import jwt from "jsonwebtoken";
import prisma from "../lib/prismaClient.js";

const openMiddleware = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    const secret = process.env.JWT_SECRET;

    if (!token) {
      const decondedToken = jwt.verify(token, secret);
      if (!decondedToken) return next();
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
      if (!user) return next();
      req.user = user;
    }
    next();
  } catch (error) {
    console.error("Error while checking authentication: ", error);
  }
};

export default openMiddleware;
