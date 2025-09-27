import { Router } from "express";
import { body, param } from "express-validator";
import { authenticate, AuthRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/error";
import { validate } from "../middlewares/validation";
import { Asset, Job, Project } from "../models";
import { JobStatus } from "../models/Job";
import { queueService } from "../queue/Index";
import { upload } from "../services/storageService";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// All project routes require authentication
router.use(authenticate);

// Create a new project
router.post(
  "/",
  [
    body("title").notEmpty().trim().isLength({ min: 1, max: 255 }),
    body("description").notEmpty().trim(),
    validate,
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const { title, description } = req.body;

    // Add proper check for user
    if (!req.user || !req.user.id) {
      throw new AppError("Authentication required", 401);
    }

    const userId = req.user.id;
    console.log("Creating project for userId:", userId); // Debug log

    const project = await Project.create({
      title,
      description,
      userId,
    });

    res.status(201).json({
      message: "Project created successfully",
      data: project,
    });
  })
);

// Get all projects for the authenticated user
router.get(
  "/",
  asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.id;

    const projects = await Project.findAll({
      where: { userId },
      include: [
        {
          model: Asset,
          as: "assets",
          attributes: ["id", "filename", "mimeType", "size"],
        },
        {
          model: Job,
          as: "jobs",
          attributes: ["id", "status", "progress", "createdAt"],
          order: [["createdAt", "DESC"]],
          limit: 1,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      message: "Projects retrieved successfully",
      data: projects,
    });
  })
);

// Get a specific project
router.get(
  "/:id",
  [param("id").isInt(), validate],
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const project = await Project.findOne({
      where: { id, userId },
      include: [
        {
          model: Asset,
          as: "assets",
        },
        {
          model: Job,
          as: "jobs",
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    res.json({
      message: "Project retrieved successfully",
      data: project,
    });
  })
);

// Upload asset to project
router.post(
  "/:id/assets",
  [param("id").isInt(), validate],
  authenticate,
  upload.single("file"),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify project ownership
    const project = await Project.findOne({
      where: { id, userId },
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const asset = await Asset.create({
      projectId: parseInt(id),
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });

    res.status(201).json({
      message: "Asset uploaded successfully",
      data: asset,
    });
  })
);

// Trigger render job
router.post(
  "/:id/render",
  [param("id").isInt(), validate],
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify project ownership
    const project = await Project.findOne({
      where: { id, userId },
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    // Create a new job
    const job = await Job.create({
      projectId: parseInt(id),
      status: JobStatus.PENDING,
      progress: 0,
    });

    console.log("job: ", job);
    const jobId = job.getDataValue("id");
    console.log("jobId", jobId);

    // Publish to queue
    await queueService.publishJob({
      jobId: job.getDataValue("id"),
      projectId: parseInt(id),
    });

    res.status(202).json({
      message: "Render job queued successfully",
      data: {
        jobId: jobId,
        status: job.getDataValue("status"),
      },
    });
  })
);

// Update a project
router.put(
  "/:id",
  [
    param("id").isInt(),
    body("title").optional().trim().isLength({ min: 1, max: 255 }),
    body("description").optional().trim(),
    validate,
  ],
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { title, description } = req.body;

    const project = await Project.findOne({
      where: { id, userId },
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    await project.update({ title, description });

    res.json({
      message: "Project updated successfully",
      data: project,
    });
  })
);

// Delete a project
router.delete(
  "/:id",
  [param("id").isInt(), validate],
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const project = await Project.findOne({
      where: { id, userId },
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    await project.destroy();

    res.json({
      message: "Project deleted successfully",
    });
  })
);

export default router;
