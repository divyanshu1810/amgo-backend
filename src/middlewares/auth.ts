import { NextFunction, Request, Response } from "express";
import { User } from "../models";
import { AuthService } from "../services/authService";
import { AppError } from "./error";

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    console.log("token: ", token);

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = AuthService.verifyToken(token);
    console.log("payload: ", payload);
    const user = await User.findByPk(payload.userId);

    if (!user) {
      throw new AppError("User not found", 401);
    }

    const userData = user.toJSON() as User;
    console.log(JSON.stringify(userData));
    req.user = userData;
    next();
  } catch (error) {
    next(error);
  }
};
