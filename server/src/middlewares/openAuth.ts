import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/hashedPassword";

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

export const openAuth = asyncHandler({
  requestHandler: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");
      if (token === null) {
        throw new ApiError(400, "No token found!");
      }
      if (token) {
        const decodedToken: any = jwt.verify(
          token,
          process.env.ACCESS_TOKEN_SECRET || ""
        );

        if (!decodedToken) {
          next();
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
            refreshToken: true,
            watchHistory: true,
            Tweet: true,
            Comment: true,
            Like: true,
            Playlist: true,
            subscribers: true,
            subscribedChannels: true,
            createdAt: true,
            updatedAt: true,
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
