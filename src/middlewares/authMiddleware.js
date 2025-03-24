import jwt from "jsonwebtoken";
import prisma from "../lib/prismaClient.js";

const authMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ message: "JWT secret is not defined" });
  }
  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid tokem" });
    }
    const user = await prisma.user.findUnique({
      where: {
        id: decoded?.id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        coverImage: true,
        avatar: true,
        description: true,
        watchHistory: true,
        videos: true,
      },
    });
    req.user = user;
    next();
  });
};

export default authMiddleware;
