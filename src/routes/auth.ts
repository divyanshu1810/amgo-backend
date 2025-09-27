import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middlewares/validation";
import { AuthService } from "../services/authService";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("name").notEmpty().trim(),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const { email, password, name } = req.body;
    const { user, token } = await AuthService.register(email, password, name);

    res.status(201).json({
      message: "User registered successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  })
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty(), validate],
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const { user, token } = await AuthService.login(email, password);

    res.json({
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  })
);

export default router;
