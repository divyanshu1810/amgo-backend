import { Router } from "express";
import { body, param, query } from "express-validator";
import { Op } from "sequelize";
import { authenticate, AuthRequest } from "../middlewares/auth";
import { AppError } from "../middlewares/error";
import { validate } from "../middlewares/validation";
import { Analytics, Project } from "../models";
import { EventType } from "../models/Analytics";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Log analytics event (public endpoint)
router.post(
  "/",
  [
    body("projectId").isInt(),
    body("eventType").isIn(Object.values(EventType)),
    body("metadata").optional().isObject(),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const { projectId, eventType, metadata } = req.body;

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const analytics = await Analytics.create({
      projectId,
      eventType,
      metadata,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
    });

    res.status(201).json({
      message: "Analytics event logged successfully",
      data: {
        id: analytics.id,
        eventType: analytics.eventType,
      },
    });
  })
);

// Get analytics for a project (authenticated)

router.get(
  "/project/:projectId",
  [
    param("projectId").isInt(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("eventType").optional().isIn(Object.values(EventType)),
    validate,
  ],
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { projectId } = req.params;
    const { startDate, endDate, eventType } = req.query;
    const userId = req.user!.id;

    // Verify project ownership
    const project = await Project.findOne({
      where: { id: projectId, userId },
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    const where: any = { projectId };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate as string);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate as string);
    }

    if (eventType) {
      where.eventType = eventType;
    }

    const analytics = await Analytics.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    // Option 1: Access dataValues directly
    const analyticsData = analytics.map((item) => item.dataValues);

    console.log("analytics", analyticsData);

    // Calculate summary statistics
    const summary = analyticsData.reduce(
      (acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    res.json({
      message: "Analytics retrieved successfully",
      data: {
        summary,
        events: analyticsData,
        total: analyticsData.length,
      },
    });
  })
);

export default router;
