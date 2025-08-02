import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../utils/hashedPassword";

const getChannelStats = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(Number(userId))) {
        throw new ApiError(400, "Invalid user ID");
      }

      const videos = await prisma.video.findMany({
        where: {
          ownerId: Number(req.user?.userId),
        },
        select: {
          id: true,
          views: true,
          _count: {
            select: {
              likes: true,
            },
          },
        },
      });

      if (!videos) {
        throw new ApiError(500, "No video found");
      }

      const totalVideos = videos.length;
      const totalViews = videos.reduce((acc, video) => acc + video.views, 0);
      const totalLikes = videos.reduce(
        (acc, video) => acc + video._count.likes,
        0
      );

      const subscribersCount = await prisma.subscription.count({
        where: {
          channelId: Number(userId),
        },
      });

      if (!subscribersCount) {
        throw new ApiError(500, "No subscriber found");
      }

      const totalTweets = await prisma.tweet.count({
        where: {
          ownerId: Number(userId),
        },
      });

      if (!totalTweets) {
        throw new ApiError(500, "No tweet found");
      }

      const stats = {
        subscribersCount,
        totalLikes,
        totalVideos,
        totalViews,
        totalTweets,
      };

      res.status(200).json(stats);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting user channel's stats!"
      );
    }
  },
});

const getChannelVideos = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const videos = await prisma.video.findMany({
        where: {
          ownerId: Number(req.user?.userId),
        },
        select: {
          id: true,
          videoFile: true,
          thumbnail: true,
          isPublished: true,
          description: true,
          title: true,
          createdAt: true,
          views: true,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      });

      if (!videos) {
        throw new ApiError(500, "No video found");
      }

      const transformed = videos.map((video) => ({
        ...video,
        likesCount: video._count.likes,
        commentsCount: video._count.comments,
      }));

      res.status(200).json(transformed);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting user's videos!"
      );
    }
  },
});

export { getChannelStats, getChannelVideos };
