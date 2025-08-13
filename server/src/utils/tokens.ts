// utils/tokens.ts
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: number;
  email: string;
  username: string;
  fullName: string;
}

export const generateAccessToken = (user: TokenPayload) => {
  const tokenAccess = process.env.ACCESS_TOKEN_SECRET;
  if (!tokenAccess) {
    throw new Error(
      "ACCESS_TOKEN_SECRET is not defined in environment variables"
    );
  }
  return jwt.sign(
    {
      id: user.userId.toString(),
      email: user.email,
      username: user.username,
      fullName: user.fullName,
    },
    tokenAccess,
    { expiresIn: "1d" }
  );
};

export const generateRefreshToken = (user: { userId: number }) => {
  const tokenRefresh = process.env.REFRESH_TOKEN_SECRET;
  if (!tokenRefresh) {
    throw new Error(
      "REFRESH_TOKEN_SECRET is not defined in environment variables"
    );
  }

  return jwt.sign({ id: user.userId.toString() }, tokenRefresh, {
    expiresIn: "10d",
  });
};
