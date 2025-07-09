"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserVideos = exports.getAllVideos = exports.publishAVideo = void 0;
const fs_1 = __importDefault(require("fs"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const cloudinary_1 = require("../utils/cloudinary");
const passwordRelated_1 = require("../utils/passwordRelated");
// to delete files from the local file system
function unlinkPath(videoLocalPath, thumbnailLocalPath) {
    if (videoLocalPath)
        fs_1.default.unlinkSync(videoLocalPath);
    if (thumbnailLocalPath)
        fs_1.default.unlinkSync(thumbnailLocalPath);
}
const publishAVideo = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const { title, description } = req.body;
            let videoLocalPath;
            if (req.files && Array.isArray(req.files)) {
                const videoFile = req.files.find((file) => file.fieldname === "videoFile");
                videoLocalPath = videoFile === null || videoFile === void 0 ? void 0 : videoFile.path;
            }
            else {
                videoLocalPath = (_a = req.files.videoFile[0]) === null || _a === void 0 ? void 0 : _a.path;
            }
            let thumbnailLocalPath;
            if (req.files && Array.isArray(req.files)) {
                const thumbnail = req.files.find((file) => file.fieldname === "thumbnail");
                thumbnailLocalPath = thumbnail === null || thumbnail === void 0 ? void 0 : thumbnail.path;
            }
            else {
                thumbnailLocalPath = (_b = req.files.thumbnail[0]) === null || _b === void 0 ? void 0 : _b.path;
            }
            if (title.trim() === "") {
                unlinkPath(videoLocalPath, thumbnailLocalPath);
                throw new ApiError_1.ApiError(400, "Title is required!");
            }
            if (!videoLocalPath) {
                unlinkPath(videoLocalPath, thumbnailLocalPath);
                throw new ApiError_1.ApiError(400, "Video file is required");
            }
            if (!thumbnailLocalPath) {
                unlinkPath(videoLocalPath, thumbnailLocalPath);
                throw new ApiError_1.ApiError(400, "Thumbnail file is required");
            }
            const videoFile = yield (0, cloudinary_1.uploadOnCloudinary)(videoLocalPath);
            const thumbnail = yield (0, cloudinary_1.uploadOnCloudinary)(thumbnailLocalPath);
            if (!videoFile || !thumbnail) {
                throw new ApiError_1.ApiError(400, "Video or thumbnail is missing from cloudinary!");
            }
            const video = yield passwordRelated_1.prisma.video.create({
                data: {
                    videoFile: videoFile === null || videoFile === void 0 ? void 0 : videoFile.secure_url,
                    thumbnail: thumbnail === null || thumbnail === void 0 ? void 0 : thumbnail.secure_url,
                    title: title,
                    duration: videoFile === null || videoFile === void 0 ? void 0 : videoFile.width,
                    description: description || "",
                    isPublised: true,
                    ownerId: Number((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId),
                },
            });
            if (!video) {
                throw new ApiError_1.ApiError(500, "Error while creating and uploading video");
            }
            res
                .status(201)
                .json(new ApiResponse_1.ApiResponse(201, video, "Video published successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.statusCode || 500, error.message || "Error while publishing video");
        }
    }),
});
exports.publishAVideo = publishAVideo;
const getAllVideos = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const sortField = sortBy;
            const sortOrder = sortType === "asc" ? "asc" : "desc";
            const videos = yield passwordRelated_1.prisma.video.findMany({
                where: Object.assign({ isPublised: true }, (query && {
                    OR: [
                        { title: { contains: query, mode: "insensitive" } },
                        {
                            description: { contains: query, mode: "insensitive" },
                        },
                    ],
                })),
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
                    [sortField]: sortOrder,
                },
                skip: skip,
                take: Number(limit),
            });
            if (!videos) {
                throw new ApiError_1.ApiError(404, "No videos found for the given query!");
            }
            if (!(videos === null || videos === void 0 ? void 0 : videos.length)) {
                throw new ApiError_1.ApiError(404, "No videos found!");
            }
            res
                .status(200)
                .json(new ApiResponse_1.ApiResponse(200, videos, "All videos fetched successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.statusCode || 500, error.message || "Error while fetching videos");
        }
    }),
});
exports.getAllVideos = getAllVideos;
const getUserVideos = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { page = 1, limit = 10, sortType = "desc" } = req.query;
            const { userId } = req.params;
            if (!userId) {
                throw new ApiError_1.ApiError(400, "Inavlid userId");
            }
            const videos = yield passwordRelated_1.prisma.video.findMany({
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
                throw new ApiError_1.ApiError(400, "Error whilie fetching user's vidoes");
            }
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.statusCode || 500, error.message || "Error while user's videos");
        }
    }),
});
exports.getUserVideos = getUserVideos;
