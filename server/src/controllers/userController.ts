import { prisma, isPasswordCorrect } from "../utils/hashedPassword";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens";

interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: boolean | "none" | "lax" | "strict" | undefined;
}

// to delete files from the local file system
function unlinkPath(avatarLocalPath: any, coverImageLocalPath: any) {
  if (avatarLocalPath) fs.unlinkSync(avatarLocalPath);
  if (coverImageLocalPath) fs.unlinkSync(coverImageLocalPath);
}

// for the creation of token
const generateAccessAndRefreshTokens = async (userId: number, val = 0) => {
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

    let refreshToken;
    if (val === 0) {
      refreshToken = generateRefreshToken(user);

      const userWithRefreshToken = await prisma.user.update({
        where: {
          userId: userId,
        },
        data: {
          refreshToken: refreshToken,
        },
      });

      if (userWithRefreshToken) {
        return {
          accessToken,
          refreshToken: userWithRefreshToken.refreshToken,
        };
      }
    }

    return { accessToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating token");
  }
};

const registerUser = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { fullName, email, username, description, password } = req.body;

      let avatarLocalPath;
      if (Array.isArray(req.files)) {
        const avatarFile = req.files.find(
          (file) => file.fieldname === "avatar"
        );
        avatarLocalPath = avatarFile?.path;
      } else if (
        req.files &&
        typeof req.files === "object" &&
        "avatar" in req.files
      ) {
        avatarLocalPath = (req.files as any).avatar[0]?.path;
      }

      let coverImageLocalPath;
      if (req.files && Array.isArray(req.files)) {
        const coverImageFile = req.files.find(
          (file) => file.fieldname === "coverImage"
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
          username: username,
          description: description,
          email: email,
          avatar: avatar.url,
          coverImage: coverImage?.url,
          password: hashedPassword,
        },
        select: {
          fullName: true,
          username: true,
          avatar: true,
          coverImage: true,
          description: true,
          email: true,
          refreshToken: true,
          watchHistory: true,
          tweets: true,
          subscribers: true,
          subscribedChannels: true,
          playlist: true,
          comments: true,
          likes: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      res.status(201).json(createdUser);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while creating new user!"
      );
    }
  },
});

const loginUser = asyncHandler({
  requestHandler: async (req, res) => {
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
      const { accessToken, refreshToken } =
        await generateAccessAndRefreshTokens(user.userId);

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
        .json({
          user: loggedUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        });
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Error while logging user!");
    }
  },
});

const logoutUser = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      await prisma.user.update({
        where: {
          userId: req.user?.userId,
        },
        data: {
          refreshToken: null,
        },
      });

      const options: CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      };
      res
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json({});
    } catch (error: any) {
      throw new ApiError(500, error?.message || "Error while logging out");
    }
  },
});

const refreshAccessToken = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const inComingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

      if (!inComingRefreshToken) {
        throw new ApiError(401, "Anauthorized request!");
      }

      const decodedToken: any = jwt.verify(
        inComingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET || ""
      );
      // decodedToken { id: '1', iat: 1751957369, exp: 1752821369 }
      const user = await prisma.user.findUnique({
        where: {
          userId: Number(decodedToken?.id),
        },
      });

      if (!user) {
        throw new ApiError(401, "Invalid refresh token!");
      }
      if (inComingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token expired or used!");
      }

      const options: CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      };

      const { accessToken } = await generateAccessAndRefreshTokens(
        user?.userId,
        1
      );

      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json({ accessToken });
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Invalid refresh token!");
    }
  },
});

const changeCurrentPassword = asyncHandler({
  requestHandler: async (req, res) => {
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

      // for password to hash again
      await prisma.user.hashPasswordAgain(user, newPassword);

      res.status(200).json({});
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while changing password!"
      );
    }
  },
});

const getCurrentLoggedInUser = asyncHandler({
  requestHandler: async (req, res) => {
    if (!req.user) {
      throw new ApiError(400, "Current logged-in user not found!");
    }
    res.status(200).json(req.user);
  },
});

const updateAccountDetails = asyncHandler({
  requestHandler: async (req, res) => {
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

      res.status(200).json(user);
    } catch (error) {
      throw new ApiError(400, "Error while updating account details");
    }
  },
});

const updateUserAvatar = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const avatarLocalPath = req.file?.path;

      if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing!");
      }
      const avatar = await uploadOnCloudinary(avatarLocalPath);

      if (!avatar?.secure_url) {
        throw new ApiError(400, "Error while uploading on cloudinary");
      }

      const avatarUrl = req.user?.avatar;
      const regex = /\/([^/]+)\.[^.]+$/;
      const match = avatarUrl?.match(regex);

      if (!match) {
        throw new ApiError(400, "Couldn't find public Id of old avatar!");
      }
      const publicId = match[1];
      await deleteFromCloudinary(publicId);

      const userWithNewAvatar = await prisma.user.update({
        where: {
          userId: req.user?.userId,
        },
        data: {
          avatar: avatar.secure_url,
        },
      });

      res.status(200).json(userWithNewAvatar);
    } catch (error) {
      throw new ApiError(400, "Error while updating user's avatar");
    }
  },
});

const updateUserCoverImage = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const coverImageLocalPath = req.file?.path;

      if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage file is missing!");
      }
      const coverImage = await uploadOnCloudinary(coverImageLocalPath);

      if (!coverImage?.secure_url) {
        throw new ApiError(400, "Error while uploading on cloudinary");
      }

      const coverImageUrl = req.user?.coverImage;
      const regex = /\/([^/]+)\.[^.]+$/;
      const match = coverImageUrl?.match(regex);

      if (!match) {
        throw new ApiError(400, "Couldn't find public Id of old coverImage!");
      }
      const publicId = match[1];
      await deleteFromCloudinary(publicId);

      const userWithNewCoverImage = await prisma.user.update({
        where: {
          userId: req.user?.userId,
        },
        data: {
          avatar: coverImage.secure_url,
        },
      });

      res.status(200).json(userWithNewCoverImage);
    } catch (error) {
      throw new ApiError(400, "Error while updating user's coverImage");
    }
  },
});

const getUserChannelProfile = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { username } = req.params;
      const currentLoggedInUser = req.user?.userId;

      if (!currentLoggedInUser) {
        throw new ApiError(404, "No CurrentLoggedInuser is found");
      }

      if (!username.trim()) {
        throw new ApiError(400, "Username is missing!");
      }
      const channel = await prisma.user.findUnique({
        where: {
          username: username?.toLowerCase(),
        },
        select: {
          userId: true,
        },
      });

      if (!channel) {
        throw new ApiError(404, "Channel not found!");
      }

      const [subcribers, subscribedTo] = await Promise.all([
        // subcribers of this channel(other users who subcribe this channel)
        prisma.subscription.count({
          where: {
            channelId: channel.userId,
          },
        }),
        //
        prisma.subscription.count({
          where: {
            subscriberId: channel.userId,
          },
        }),
      ]);
      // check if currentLoggedInUser is a subscriber to this channel
      const isSubscribed = currentLoggedInUser
        ? Boolean(
            await prisma.subscription.findFirst({
              where: {
                channelId: channel.userId,
                subscriberId: currentLoggedInUser,
              },
            })
          )
        : false;

      // fetch channel profile with all fields
      const channelProfile = await prisma.user.findUnique({
        where: {
          userId: channel.userId,
        },
        select: {
          userId: true,
          fullName: true,
          username: true,
          avatar: true,
          coverImage: true,
          email: true,
          description: true,
          createdAt: true,
        },
      });

      const profileData = {
        ...channelProfile,
        userId: channelProfile?.userId,
        subscribersCount: subcribers,
        channelsSubscribedToCount: subscribedTo,
        isSubscribed,
      };

      res.status(200).json(profileData);
    } catch (error: any) {
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Error fetching channel profile"
      );
    }
  },
});

const getWatchHistory = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      //const {page = 1, limit = 10} = req.query;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // get user's watchHistory videoIds array
      const user = await prisma.user.findUnique({
        where: {
          userId: Number(req.user?.userId),
        },
        select: {
          watchHistory: true,
        },
      });

      if (!user) {
        throw new ApiError(404, "User and his watchHistory not found!");
      }

      // Array of videoIds
      const videoIds = user.watchHistory.map((videoId) => videoId.id);

      // get paginated watch history videos with owner's(user) details
      const watchHistoryWithOwner = await prisma.video.findMany({
        where: {
          id: { in: videoIds },
        },
        select: {
          id: true,
          title: true,
          duration: true,
          description: true,
          videoFile: true,
          thumbnail: true,
          views: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: {
              fullName: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
      });

      // get total videos for pagination metadata
      const totalCount = await prisma.video.count({
        where: {
          id: { in: videoIds },
          isPublished: true,
        },
      });

      res.status(200).json({
        watchHistoryWithOwner,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: skip + limit < totalCount,
      });
    } catch (error: any) {
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Error fetching watch history"
      );
    }
  },
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentLoggedInUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
