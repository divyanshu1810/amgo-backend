import { Router } from "express";
import { param } from "express-validator";
import { authenticate, AuthRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/error";
import { validate } from "../middlewares/validation";
import { Job, Project } from "../models";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get(
  "/:id",
  [param("id").isUUID(), validate],
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;
    console.log("userId", userId);

    const job = await Job.findByPk(id, {
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "title", "userId"],
        },
      ],
      raw: true,
    });

    console.log("job: ", job);

    if (!job) {
      throw new AppError("Job not found", 404);
    }

    // When using raw: true, nested data is flattened with dot notation
    // The project.userId is accessible as 'project.userId' in the flattened object
    const projectUserId = (job as any)["project.userId"];

    if (projectUserId !== userId) {
      throw new AppError("Unauthorized", 403);
    }

    res.json({
      message: "Job status retrieved successfully",
      data: {
        id: job.id,
        status: job.status,
        progress: job.progress,
        outputPath: job.outputPath,
        error: job.error,
        startedAt: job.startedAt,
        completedAt: job.completedAt,
        createdAt: job.createdAt,
      },
    });
  })
);

// Get all jobs for a user
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    console.log("userId", userId);

    const jobs = await Job.findAll({
      include: [
        {
          model: Project,
          as: "project",
          where: { userId },
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      message: "Jobs retrieved successfully",
      data: jobs,
    });
  })
);

export default router;
