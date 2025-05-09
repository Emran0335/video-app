import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import jwt from "jsonwebtoken";
import { NextFunction } from "express";
import prisma from "@/lib/prismaClient.js";

interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: number;
    email: string;
    fullName: string;
  };
}

export function withAuth(handler: NextApiHandler) {
  return async (
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next: NextFunction
  ) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token provided" });
      }
      const token = authHeader.split(" ")[1];

      if (!token) {
        return res.json({ message: "No Token Found!" });
      }

      jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string,
        async (err, decodedToken) => {
          if (err) {
            if (err.name === "TokenExpiredError") {
              return next(res.status(401).json({ message: "TokenExpired" }));
            }
            return next(
              res.status(401).json({ message: "Invalid access token" })
            );
          }

          if (
            !decodedToken ||
            typeof decodedToken !== "object" ||
            !("_id" in decodedToken)
          ) {
            return next(
              res.status(401).json({ message: "Invalid access token" })
            );
          }

          const user = await prisma.user.findUnique({
            where: { id: decodedToken._id },
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          });
          if (!user) {
            return res.status(401).json({ message: "Invalid Access Token!" });
          }

          req.user = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
          };
        }
      );
    } catch (error) {
      return res.status(401).json({ message: error });
    }
    return handler(req, res);
  };
}
