import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

export class AppError extends Error {
  public status: number;
  public isOperational: boolean;

  constructor(message: string, status = 500, isOperational = true) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: AppError,
  request: Request,
  response: Response,
  _next: NextFunction
): void => {
  logger.error({
    message: error.message,
    status: error.status,
    stack: error.stack,
    url: request.url,
    method: request.method,
    body: request.body,
  });

  response.status(error.status || 500).json({
    error: {
      message: error.message || "Internal Server Error",
      status: error.status || 500,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    },
  });
};
