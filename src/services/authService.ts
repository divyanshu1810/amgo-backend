import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../config";
import { AppError } from "../middlewares/error";
import { User } from "../models";

interface TokenPayload {
  userId: number;
  email: string;
}

export class AuthService {
  static generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: "7d",
    });
  }

  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, config.jwtSecret) as TokenPayload;
    } catch (error) {
      throw new AppError("Invalid or expired token", 401);
    }
  }

  static async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: User; token: string }> {
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new AppError("User already exists", 409);
    }

    console.log("body: ", {
      password,
      email,
      name,
    });

    const hashed = await bcrypt.hash(password, 10);
    console.log(hashed);
    // Create user
    const user = await User.create({ email, name, password: hashed });
    const token = this.generateToken(user);

    return { user, token };
  }

  static async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const user = await User.findOne({ where: { email } });
    console.log("user: ", JSON.stringify(user));

    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Use getDataValue to access the password
    const storedPassword = user.getDataValue("password");
    // OR use user.get()
    // const storedPassword = user.get('password');

    console.log("Stored hash via getDataValue: ", storedPassword);

    const isValid = await bcrypt.compare(password, storedPassword);
    console.log("isValid: ", isValid);

    if (!isValid) {
      throw new AppError("Invalid credentials", 401);
    }

    const userPlain = user.toJSON();
    const token = this.generateToken({ id: userPlain.id, email: userPlain.email } as User);
    return { user, token };
  }
}
