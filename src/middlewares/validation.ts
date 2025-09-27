import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { AppError } from "./error";

export const validate = (req: Request, _res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessage = errors
      .array()
      .map((error) => `${error.type}: ${error.msg}`)
      .join(", ");

    throw new AppError(errorMessage, 400);
  }

  next();
};
