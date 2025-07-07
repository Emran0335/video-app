import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

interface User {
  userId: number;
  username: string;
  email: string;
  password: string;
  fullName: string;
  avatar: string | null;
  coverImage: string | null;
  description: string | null;
}
// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: User | undefined;
    }
  }
}

const prisma = new PrismaClient();

export const verifyJWT = asyncHandler({
  requestHandler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

      if (token) {
        const decodedToken: any = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET || ""
        );

        if (!decodedToken) {
          next();
        }

        const user = await prisma.user.findUnique({
          where: {
            userId: decodedToken?.id,
          },
          select: {
            userId: true,
            username: true,
            email: true,
            password: true,
            coverImage: true,
            avatar: true,
            fullName: true,
            description: true,
            watchHistory: true,
          },
        });

        if (!user) {
          next();
        } else {
          req.user = user;
        }
      }
      next();
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Invalid access token");
    }
  },
});
