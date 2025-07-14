import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { prisma } from "../utils/hashedPassword";

const createTweet = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { content } = req.body;

      const userId = req.user?.userId;

      if (!content?.trim()) {
        throw new ApiError(400, "Tweet cannot be empty");
      }

      const tweet = await prisma.tweet.create({
        data: {
          content: content,
          ownerId: Number(userId),
        },
      });

      if (!tweet) {
        throw new ApiError(500, "Error while creating tweet");
      }

      res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"));
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while creating new tweet!"
      );
    }
  },
});

const getAllTweets = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { page = 1, limit = 30 } = req.query;
      const userId = Number(req.user?.userId);

      const tweets = await prisma.tweet.findMany({
        include: {
          owner: {
            select: {
              userId: true,
              username: true,
              avatar: true,
              fullName: true,
            },
          },
          Like: {
            select: {
              likedBy: true,
            },
          },
        },
        skip: (Number(page) - 1) * Number(limit),
      });

      if (!tweets) {
        throw new ApiError(400, "No tweets found!");
      }

      const tweetsWithInfo = tweets.map((tweet) => {
        const likes = tweet.Like;
        return {
          id: tweet.id,
          content: tweet.content,
          createdAt: tweet.createdAt,
          updatedAt: tweet.updatedAt,
          owner: tweet.owner,
          likesCount: likes.length,
          isLiked: userId
            ? likes.some((like) => like.likedBy === userId)
            : false,
        };
      });

      res
        .status(200)
        .json(
          new ApiResponse(200, tweetsWithInfo, "Tweets fetched successfully")
        );
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while creating new tweet!"
      );
    }
  },
});

export { createTweet, getAllTweets };
