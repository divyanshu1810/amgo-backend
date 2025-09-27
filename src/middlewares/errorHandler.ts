import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  error: AppError,
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  logger.error(error);
  response.status(error.status || 500).json({
    message: error.message || "Internal Server Error",
  });
};
