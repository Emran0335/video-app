import prisma from "../utils/prisma";
import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import fs from "fs";
import jwt from "jsonwebtoken";  
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";

// to delete files from the local file system
function unlinkPath(avatarLocalPath: any, coverImageLocalPath: any) {
  if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
  if (coverImageLocalPath) fs.unlinkSync(coverImageLocalPath);
}

// for the creation of token
const generateAcessAndRefreshTokens = async (userId: number, val = 0) => {
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
    return accessToken;
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

      const createdUser = await prisma.user.create({
        data: {
          fullName: fullName,
          avatar: avatar.url,
          coverImage: coverImage?.url,
          email: email,
          password: password,
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

export { registerUser };
