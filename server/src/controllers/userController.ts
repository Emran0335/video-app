import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";
import { isPasswordCorrect } from "../utils/isPasswordCorrect";

const prisma = new PrismaClient();

// to delete files from the local file system
function unlinkPath(avatarLocalPath: any, coverImageLocalPath: any) {
  if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
  if (coverImageLocalPath) fs.unlinkSync(coverImageLocalPath);
}

// for the creation of token
const generateAcessAndRefreshTokens = async (userId: number) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        userId: userId,
      },
    });
    if (!user) {
      throw new ApiError("User is not found");
    }
    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    const userWithRefreshToken = await prisma.user.update({
      where: {
        userId: userId,
      },
      data: {
        refreshToken: refreshToken,
      },
    });
    if (userWithRefreshToken) {
      return { accessToken, refreshToken };
    }
    // Always return an object for consistent destructuring
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating token");
  }
};

const registerUser = asyncHandler({
  requestHandler: async (req: Request, res: Response) => {
    try {
      const { fullName, email, username, password } = req.body;

      let avatarLocalPath: string | undefined;
      if (Array.isArray(req.files)) {
        const avatarFile = req.files.find(
          (file: any) => file.fieldname === "avatar"
        );
        avatarLocalPath = avatarFile?.path;
      } else if (
        req.files &&
        typeof req.files === "object" &&
        "avatar" in req.files
      ) {
        avatarLocalPath = (req.files as any).avatar[0]?.path;
      }

      let coverImageLocalPath: string | undefined;
      if (req.files && Array.isArray(req.files)) {
        const coverImageFile = req.files.find(
          (file: any) => file.fieldname === "coverImage"
        );
        coverImageLocalPath = coverImageFile?.path;
      } else {
        coverImageLocalPath = (req.files as any).coverImage[0]?.path;
      }

      if (
        [fullName, email, username, password].some(
          (field) => field?.trim() === ""
        )
      ) {
        unlinkPath(avatarLocalPath, coverImageLocalPath);
        throw new ApiError(400, "All fields are required");
      }

      const existedUser = await prisma.user.findFirst({
        where: {
          OR: [{ username: username }, { email: email }],
        },
      });
      if (existedUser) {
        throw new ApiError(409, "User with email or username already exists!");
      }

      const avatar = await uploadOnCloudinary(avatarLocalPath);
      const coverImage = await uploadOnCloudinary(coverImageLocalPath);

      if (!avatar) {
        throw new ApiError(400, "Avatar file not retrieved from cloudinary!");
      }

      // Hash password BEFORE creating user
      const hashedPassword = await bcrypt.hash(password, 10);

      const createdUser = await prisma.user.create({
        data: {
          fullName: fullName,
          avatar: avatar.url,
          coverImage: coverImage?.url,
          email: email,
          password: hashedPassword,
          username: username,
        },
        select: {
          fullName: true,
          username: true,
          avatar: true,
          coverImage: true,
          description: true,
          email: true,
          watchHistory: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      res
        .status(201)
        .json(
          new ApiResponse(200, createdUser, "User registered successfully")
        );
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while creating new user!"
      );
    }
  },
});

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: boolean | "none" | "lax" | "strict" | undefined;
}
const loginUser = asyncHandler({
  requestHandler: async (req: Request, res: Response) => {
    try {
      const { email, username, password } = req.body;
      if (!username && !email) {
        throw new ApiError(500, "Username and email is required");
      }

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ username: username }, { email: email }],
        },
      });

      if (!user) {
        throw new ApiError(404, "User does not exist!");
      }

      const isPasswordValid = await isPasswordCorrect(password, user.password);

      if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials!");
      }
      const { accessToken, refreshToken } = await generateAcessAndRefreshTokens(
        user.userId
      );

      const loggedUser = await prisma.user.findUnique({
        where: {
          userId: user.userId,
        },
        select: {
          avatar: true,
          coverImage: true,
          userId: true,
          username: true,
          email: true,
          password: true,
          fullName: true,
          description: true,
          refreshToken: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      const options: CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      };
      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            {
              user: loggedUser,
              accessToken: accessToken,
              refreshToken: refreshToken,
            },
            "User logged in successfully"
          )
        );
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Error while logging user!");
    }
  },
});

const changeCurrentPassword = asyncHandler({
  requestHandler: async (req: Request, res: Response) => {
    try {
      const { password, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: {
          userId: req.user?.userId,
        },
      });
      const isOldPasswordCorrect = await isPasswordCorrect(
        password,
        user?.password as string
      );
      if (!isOldPasswordCorrect) {
        throw new ApiError(400, "Invalid Old Password");
      }

      // Hash password BEFORE creating user
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: {
          userId: user?.userId,
        },
        data: {
          password: hashedPassword,
        },
      });

      res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while changing password!"
      );
    }
  },
});

const updateAccountDetails = asyncHandler({
  requestHandler: async (req: Request, res: Response) => {
    try {
      const { fullName, email, username, description } = req.body;

      if (!fullName && !email && !username && !description) {
        throw new ApiError(400, "All fields are required");
      }
      const user = await prisma.user.update({
        where: {
          userId: Number(req.user?.userId),
        },
        data: {
          fullName: fullName || req.user?.fullName,
          email: email || req.user?.email,
          username: username || req.user?.username,
          description: description || req.user?.description,
        },
        select: {
          userId: true,
          username: true,
          fullName: true,
          email: true,
          description: true,
          coverImage: true,
          avatar: true,
        },
      });

      res
        .status(200)
        .json(
          new ApiResponse(200, user, "Account details updated successfully")
        );
    } catch (error) {
      throw new ApiError(400, "Error while updating account details");
    }
  },
});

export { registerUser, loginUser, changeCurrentPassword, updateAccountDetails };
