import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../utils/hashedPassword";

const getLikedVideos = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const likedVideos = await prisma.like.findMany({
        where: {
          likedBy: Number(req.user?.userId),
        },
        include: {
          videoId: {
            select: {
              isPublished: true,
            },
          },
          likedById: {
            select: {
              fullName: true,
              username: true,
              avatar: true,
            },
          },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(page),
      });

      if (!likedVideos) {
        throw new ApiError(500, "Error while fetching liked videos");
      }

      res
        .status(200)
        .json(
          new ApiResponse(200, likedVideos, "Liked videos fetched successfully")
        );
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting all tweet!"
      );
    }
  },
});

const toggleVideoLike = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { videoId } = req.params;

      if (!videoId) {
        throw new ApiError(400, "Invalid video ID");
      }

      const isLiked = await prisma.like.findFirst({
        where: {
          video: Number(videoId),
          likedBy: Number(req.user?.userId),
        },
      });

      if (isLiked) {
        const removeLike = await prisma.like.delete({
          where: {
            id: isLiked.id,
          },
        });
        if (!removeLike) {
          throw new ApiError(500, "Error while removing like");
        }
      } else {
        const liked = await prisma.like.create({
          data: {
            video: Number(videoId),
            likedBy: Number(req.user?.userId),
          },
        });
        if (!liked) {
          throw new ApiError(500, "Error while liking the video");
        }
      }

      res
        .status(200)
        .json(new ApiResponse(200, {}, "Liked video status updated"));
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while changing video like status"
      );
    }
  },
});

const toggleCommentLike = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { commentId } = req.params;
      if (!commentId) {
        throw new ApiError(400, "No valid comment Id found");
      }
      const isLiked = await prisma.like.findFirst({
        where: {
          comment: Number(commentId),
          likedBy: Number(req.user?.userId),
        },
      });
      if (isLiked) {
        const removeLiked = await prisma.like.delete({
          where: {
            id: isLiked.id,
          },
        });
        if (!removeLiked) {
          throw new ApiError(500, "Error while removing liked comment");
        }
      } else {
        const liked = await prisma.like.create({
          data: {
            comment: Number(commentId),
            likedBy: Number(req.user?.userId),
          },
        });
        if (!liked) {
          throw new ApiError(500, "Error while liking comment");
        }
      }

      res
        .status(200)
        .json(new ApiResponse(200, {}, "Liked comment status updated"));
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while changing comment status!"
      );
    }
  },
});

const toggleTweetLike = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { tweetId } = req.params;
      if (!tweetId) {
        throw new ApiError(400, "No valid tweet Id found");
      }
      const isLiked = await prisma.like.findFirst({
        where: {
          tweet: Number(tweetId),
          likedBy: Number(req.user?.userId),
        },
      });

      if (isLiked) {
        const removeLiked = await prisma.like.delete({
          where: {
            id: isLiked.id,
          },
        });
        if (!removeLiked) {
          throw new ApiError(500, "Error while removing liked tweet");
        }
      } else {
        const liked = await prisma.like.create({
          data: {
            comment: Number(tweetId),
            likedBy: Number(req.user?.userId),
          },
        });
        if (!liked) {
          throw new ApiError(500, "Error while liking tweet");
        }
      }

      res
        .status(200)
        .json(new ApiResponse(200, {}, "Liked tweet status updated"));
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while changing tweet status!"
      );
    }
  },
});

export { getLikedVideos, toggleVideoLike, toggleCommentLike, toggleTweetLike };
