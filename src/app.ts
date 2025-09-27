import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import config from "./config";
import { errorHandler } from "./middlewares/errorHandler";
import { limiter } from "./middlewares/rateLimiter";
import routes from "./routes";

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Request parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
app.use(morgan("combined"));

// Rate limiting
app.use(limiter);

// Routes
app.use(config.prefix, routes());

// Static files for uploads and outputs
app.use("/uploads", express.static("uploads"));
app.use("/outputs", express.static("outputs"));

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
