import fs from "fs";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { prisma } from "../utils/passwordRelated";

// to delete files from the local file system
function unlinkPath(videoLocalPath: any, thumbnailLocalPath: any) {
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
          isPublised: true,
          ownerId: Number(req.user?.userId),
        },
      });

      if (!video) {
        throw new ApiError(500, "Error while creating and uploading video");
      }

      res
        .status(201)
        .json(new ApiResponse(201, video, "Video published successfully"));
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
          isPublised: true,
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
              avatar: true,
              fullName: true,
              username: true,
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

      res
        .status(200)
        .json(new ApiResponse(200, videos, "All videos fetched successfully"));
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
      const { page = 1, limit = 10, sortType = "desc" } = req.query;
      const { userId } = req.params;

      if (!userId) {
        throw new ApiError(400, "Inavlid userId");
      }

      const videos = await prisma.video.findMany({
        where: {
          AND: [{ ownerId: Number(userId) }, { isPublised: true }],
        },
        select: {
          title: true,
          description: true,
          videoFile: true,
          thumbnail: true,
          createdAt: true,
          updatedAt: true,
          ownerId: true,
          isPublised: true,
          duration: true,
          views: true,
        },
        include: {
          owner: {
            select: {
              fullName: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      if (!videos) {
        throw new ApiError(400, "Error whilie fetching user's vidoes");
      }
    } catch (error: any) {
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Error while user's videos"
      );
    }
  },
});

export { publishAVideo, getAllVideos, getUserVideos };
