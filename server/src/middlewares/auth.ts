import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/passwordRelated";

interface User {
  userId: number;
  username: string;
  email: string;
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

export const verifyJWT = asyncHandler({
  requestHandler: async (req: Request, res: Response, next: NextFunction) => {
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "";
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        throw new ApiError(401, "Unauthorized request");
      }

      jwt.verify(
        token,
        accessTokenSecret,
        async (err: any, decodedToken: any) => {
          if (err) {
            if (err.name === "TokenExpiredError") {
              return next(new ApiError(401, "TokenExpiredError"));
            }
            return next(new ApiError(401, "Invalid access token"));
          }
          // decodedToken { id: '1', iat: 1751957369, exp: 1752821369 }
          const user = await prisma.user.findUnique({
            where: {
              userId: Number(decodedToken?.id),
            },
            select: {
              userId: true,
              username: true,
              email: true,
              fullName: true,
              avatar: true,
              coverImage: true,
              description: true,
            },
          });

          if (!user) {
            throw new ApiError(401, "Invalid Access Token");
          }

          req.user = user;
          next();
        }
      );
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Invalid access token");
    }
  },
});
