import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../swagger";
import analyticsRoutes from "./analytics";
import authRoutes from "./auth";
import jobRoutes from "./jobs";
import projectRoutes from "./projects";

export default (): Router => {
  const app = Router();

  // API documentation
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Health check
  app.get("/health", (_, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use("/auth", authRoutes);
  app.use("/projects", projectRoutes);
  app.use("/jobs", jobRoutes);
  app.use("/analytics", analyticsRoutes);

  return app;
};
