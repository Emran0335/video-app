import fs from "fs";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { prisma } from "../utils/hashedPassword";

// to delete files from the local file system

function unlinkPath(
  videoLocalPath?: string,
  thumbnailLocalPath?: string
): void {
  if (videoLocalPath) fs.unlinkSync(videoLocalPath);
  if (thumbnailLocalPath) fs.unlinkSync(thumbnailLocalPath);
}

const publishAVideo = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { title, description } = req.body;

      let videoLocalPath;
      if (req.files && Array.isArray(req.files)) {
        const videoFile = req.files.find(
          (file) => file.fieldname === "videoFile"
        );
        videoLocalPath = videoFile?.path;
      } else {
        videoLocalPath = (req.files as any).videoFile[0]?.path;
      }

      let thumbnailLocalPath;
      if (req.files && Array.isArray(req.files)) {
        const thumbnail = req.files.find(
          (file) => file.fieldname === "thumbnail"
        );
        thumbnailLocalPath = thumbnail?.path;
      } else {
        thumbnailLocalPath = (req.files as any).thumbnail[0]?.path;
      }

      if (title.trim() === "") {
        unlinkPath(videoLocalPath, thumbnailLocalPath);
        throw new ApiError(400, "Title is required!");
      }

      if (!videoLocalPath) {
        unlinkPath(videoLocalPath, thumbnailLocalPath);
        throw new ApiError(400, "Video file is required");
      }

      if (!thumbnailLocalPath) {
        unlinkPath(videoLocalPath, thumbnailLocalPath);
        throw new ApiError(400, "Thumbnail file is required");
      }

      const videoFile = await uploadOnCloudinary(videoLocalPath);
      const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

      if (!videoFile || !thumbnail) {
        throw new ApiError(
          400,
          "Video or thumbnail is missing from cloudinary!"
        );
      }

      const video = await prisma.video.create({
        data: {
          videoFile: videoFile?.secure_url,
          thumbnail: thumbnail?.secure_url,
          title: title,
          duration: videoFile?.width,
          description: description || "",
          isPublished: true,
          ownerId: Number(req.user?.userId),
        },
        select: {
          title: true,
          description: true,
          thumbnail: true,
          videoFile: true,
          duration: true,
          isPublished: true,
          views: true,
          likes: true,
          comments: true,
          playlist: true,
          createdAt: true,
          updatedAt: true,
          viewlist: true,
        },
      });

      if (!video) {
        throw new ApiError(500, "Error while creating and uploading video");
      }

      res.status(201).json(video);
    } catch (error: any) {
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Error while publishing video"
      );
    }
  },
});

const getAllVideos = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        query,
        sortBy = "createdAt",
        sortType = "desc",
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const sortField = sortBy;
      const sortOrder = sortType === "asc" ? "asc" : "desc";

      const videos = await prisma.video.findMany({
        where: {
          isPublished: true,
          ...(query && {
            OR: [
              { title: { contains: query as string, mode: "insensitive" } },
              {
                description: { contains: query as string, mode: "insensitive" },
              },
            ],
          }),
        },
        include: {
          owner: {
            select: {
              userId: true,
              avatar: true,
              fullName: true,
              username: true,
              subscribers: true,
            },
          },
        },
        orderBy: {
          [sortField as string]: sortOrder,
        },
        skip: skip,
        take: Number(limit),
      });
      if (!videos) {
        throw new ApiError(404, "No videos found for the given query!");
      }
      if (!videos?.length) {
        throw new ApiError(404, "No videos found!");
      }

      res.status(200).json(videos);
    } catch (error: any) {
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Error while fetching videos"
      );
    }
  },
});

const getUserVideos = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const userId = req.params.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const sortType = req.query.sortType === "asc" ? "asc" : "desc";

      const skip = (page - 1) * limit;

      const videos = await prisma.video.findMany({
        where: {
          AND: [{ ownerId: Number(userId) }, { isPublished: true }],
        },
        orderBy: {
          createdAt: sortType, // Sort by creation date
        },
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              userId: true,
              avatar: true,
              username: true,
              fullName: true,
            },
          },
        },
      });
      res.status(200).json(videos);
    } catch (error: any) {
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Error while user's videos"
      );
    }
  },
});

const getVideoById = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { videoId } = req.params;

      if (!videoId) {
        throw new ApiError(400, "Invalid videoId");
      }

      const video = await prisma.video.findUnique({
        where: {
          id: Number(videoId),
        },
        include: {
          likes: {
            select: {
              likedBy: true,
            },
          },
          owner: {
            select: {
              userId: true,
              fullName: true,
              username: true,
              avatar: true,
              subscribers: true,
              subscribedChannels: true,
            },
          },
          comments: true,
        },
      });

      if (!video) {
        throw new ApiError(404, "Video not found");
      }

      const likesCount = video.likes.length;
      const isLiked = video.likes.some((like) => like.likedBy);
      const subscriberCount = video.owner.subscribers.length;
      const isSubscribed = video.owner.subscribers.some(
        (sub) => sub.id === Number(req.user?.userId)
      );

      const result = {
        ...video,
        likesCount: likesCount,
        isLiked: isLiked,
        owner: {
          ...video.owner,
          id: video.owner.userId,
          subscriberCount: subscriberCount,
          isSubscribed: isSubscribed,
        },
      };

      res.status(200).json(result);
    } catch (error: any) {
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Error while user's video"
      );
    }
  },
});

const updateVideo = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { title, description } = req.body;
      const { videoId } = req.params;
      const thumbnailLocalPath = req.file?.path;

      if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnailLocalPath file is missing!");
      }

      const video = await prisma.video.findUnique({
        where: {
          id: Number(videoId),
        },
      });

      if (req.user?.userId !== video?.ownerId) {
        unlinkPath(thumbnailLocalPath);
        throw new ApiError(
          401,
          "You do not have the permission to perform this action"
        );
      }
      const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
      if (!thumbnail) {
        throw new ApiError(
          400,
          "Error while uploading thumbnail on cloudinary"
        );
      } else {
        const thumbnailUrl = video?.thumbnail;
        const regex = /\/([^/]+)\.[^.]+$/;
        const match = thumbnailUrl?.match(regex);

        if (!match) {
          throw new ApiError(400, "Couldn't find public Id of old thumbnail!");
        }
        const publicId = match[1];
        await deleteFromCloudinary(publicId, "image");
      }

      const updatedVideo = await prisma.video.update({
        where: {
          id: Number(videoId),
        },
        data: {
          title: title || video?.title,
          description: description || video?.description,
          thumbnail: thumbnail.secure_url || video?.thumbnail,
        },
      });

      res.status(200).json(updatedVideo);
    } catch (error) {
      throw new ApiError(400, "Error while updating user's video");
    }
  },
});

const deleteVideo = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { videoId } = req.params;

      if (!videoId) {
        throw new ApiError(404, "Video ID not found!");
      }

      const video = await prisma.video.findUnique({
        where: {
          id: Number(videoId),
        },
      });

      if (!video) {
        throw new ApiError(404, "Video not found!");
      }

      if (video.ownerId !== Number(req.user?.userId)) {
        throw new ApiError(401, "Not have permission to delete video!");
      }

      // delete videoFile and thumbail
      const thumbailUrl = video?.thumbnail;
      const videoFileUrl = video?.videoFile;

      const regex = /\/([^/]+)\.[^.]+$/;

      // let's delete thumbnail
      let match = thumbailUrl.match(regex);
      if (!match) {
        throw new ApiError(400, "Couldn't find thumbnail");
      }
      let publicId = match[1];

      const deleteThumbnail = await deleteFromCloudinary(publicId, "image");

      // let's delete videoFile
      match = videoFileUrl.match(regex);
      if (!match) {
        throw new ApiError(400, "Couldn't find videoFile");
      }
      publicId = match[1];

      const deleteVideoFile = await deleteFromCloudinary(publicId, "video");

      if (!deleteThumbnail && !deleteVideoFile) {
        throw new ApiError(
          500,
          "Error while deleting thumbnail and videoFile from cloudinary"
        );
      }

      await prisma.video.delete({
        where: {
          id: video.id,
        },
      });

      res.status(200).json({ message: "Video deleted successfull!" });
    } catch (error: any) {
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Error while deleting video"
      );
    }
  },
});

const toggleVideoPublishStatus = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { videoId } = req.params;

      if (!videoId) {
        throw new ApiError(400, "Invalid video ID!");
      }

      const video = await prisma.video.findUnique({
        where: {
          id: Number(videoId),
        },
      });

      if (!video) {
        throw new ApiError(404, "Video not found!");
      }

      if (video?.ownerId !== req.user?.userId) {
        throw new ApiError(
          401,
          "Not have the permission to toggle publishStatus!"
        );
      }

      const updateVideo = await prisma.video.update({
        where: {
          id: Number(videoId),
        },
        data: {
          isPublished: !video.isPublished,
        },
      });

      res.status(200).json({
        updateVideo,
        message: "Video publish status updated",
      });
    } catch (error: any) {
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Error while deleting video"
      );
    }
  },
});

const getSubscribedVideos = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { page = 1, limit = 10, sortType = "desc" } = req.query;

      // Step 1: Get all subscribed channel IDs
      const subscriptions = await prisma.subscription.findMany({
        where: {
          subscriberId: Number(req.user?.userId),
        },
        select: {
          channelId: true,
        },
      });

      const channelIds = subscriptions.map((sub) => sub.channelId);

      if (channelIds.length === 0) {
        throw new ApiError(200, "No subscribed channels found");
      }

      // Step 2: Get videos from those channels
      const videos = await prisma.video.findMany({
        where: {
          ownerId: {
            in: channelIds,
          },
          isPublished: true,
        },
        orderBy: {
          createdAt: sortType === "asc" ? "asc" : "desc",
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        include: {
          owner: {
            select: {
              userId: true,
              username: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      });

      res.status(200).json(videos);
    } catch (error: any) {
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Error while deleting video"
      );
    }
  },
});

export {
  publishAVideo,
  getAllVideos,
  getUserVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  toggleVideoPublishStatus,
  getSubscribedVideos,
};
