import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
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

      res.status(201).json(tweet);
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
          likes: {
            select: {
              likedBy: true,
            },
          },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(page),
      });

      if (!tweets) {
        throw new ApiError(400, "No tweets found!");
      }

      const tweetsWithInfo = tweets.map((tweet) => {
        const likes = tweet.likes;
        return {
          id: tweet.id,
          content: tweet.content,
          createdAt: tweet.createdAt,
          updatedAt: tweet.updatedAt,
          owner: tweet.owner,
          likesCount: likes.length,
          isLiked: userId
            ? likes.some((like) => like.likedBy?.userId === userId)
            : false,
        };
      });

      res.status(200).json(tweetsWithInfo);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting all tweet!"
      );
    }
  },
});

const updateTweet = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { content } = req.body;
      const { tweetId } = req.params;

      if (!content?.trim()) {
        throw new ApiError(400, "Tweet content is empty!");
      }

      if (!tweetId) {
        throw new ApiError(400, "Invalid tweet ID!");
      }

      const tweet = await prisma.tweet.findUnique({
        where: {
          id: Number(tweetId),
        },
      });

      if (!tweet) {
        throw new ApiError(500, "Tweet not found!");
      }

      if (tweet.ownerId !== Number(req.user?.userId)) {
        throw new ApiError(401, "No permission to update the tweet");
      }

      const updatedTweet = await prisma.tweet.update({
        where: {
          id: Number(tweet.id),
        },
        data: {
          ...tweet,
          content: content,
        },
      });

      if (!updatedTweet) {
        throw new ApiError(400, "Error while updating the tweet");
      }

      const tweetWithRelation = await prisma.tweet.findMany({
        where: {
          id: updatedTweet.id,
        },
        include: {
          owner: {
            select: {
              userId: true,
              username: true,
              avatar: true,
              fullName: true,
            },
          },
          likes: {
            select: {
              likedBy: true,
            },
          },
        },
      });

      const tweetDetails = tweetWithRelation.map((tweet) => {
        const likes = tweet.likes;

        return {
          id: tweet.id,
          content: tweet.content,
          owner: tweet.owner,
          createdAt: tweet.createdAt,
          updatedAt: tweet.updatedAt,
          likesCount: likes.length,
          isLiked: Number(req.user?.userId)
            ? likes.some(
                (like) => like.likedBy?.userId === Number(req.user?.userId)
              )
            : false,
        };
      });

      res.status(200).json(tweetDetails);
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Error while updating tweet!");
    }
  },
});

const getUserTweets = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 30 } = req.query;

      if (!userId) {
        throw new ApiError(400, "No valid user ID found");
      }

      const tweets = await prisma.tweet.findMany({
        skip: (Number(page) - 1) * Number(limit),
        take: Number(page),
        where: {
          ownerId: Number(userId),
        },
        include: {
          owner: {
            select: {
              userId: true,
              username: true,
              avatar: true,
              fullName: true,
            },
          },
          likes: {
            select: {
              likedBy: true,
            },
          },
        },
      });

      if (!tweets?.length) {
        throw new ApiError(401, "No tweets found for this user");
      }

      const tweetDetails = tweets.map((tweet) => {
        const likes = tweet.likes;

        return {
          id: tweet.id,
          content: tweet.content,
          owner: tweet.owner,
          likesCount: likes.length,
          isLiked: userId
            ? likes.some((like) => like.likedBy?.userId === Number(userId))
            : false,
        };
      });

      res.status(200).json(tweetDetails);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting user's tweets!"
      );
    }
  },
});

const deleteTweet = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { tweetId } = req.params;

      if (!tweetId) {
        throw new ApiError(400, "Invalid tweet ID");
      }

      const tweet = await prisma.tweet.findUnique({
        where: {
          id: Number(tweetId),
        },
      });

      if (tweet?.ownerId !== Number(req.user?.userId)) {
        throw new ApiError(
          401,
          "You do not the have permission to delete this tweet"
        );
      }

      const deletedTweet = await prisma.tweet.delete({
        where: {
          id: tweet.id,
        },
      });
      console.log(deletedTweet);
      if (!deletedTweet) {
        throw new ApiError(400, "Error while deleting tweet");
      }

      res.status(200).json(deletedTweet);
    } catch (error: any) {
      throw new ApiError(401, error?.message || "Error while deleting tweet!");
    }
  },
});

export { createTweet, getAllTweets, updateTweet, getUserTweets, deleteTweet };
