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
exports.getSubscribedVideos = exports.togglePublishStatus = exports.deleteVideo = exports.updateVideo = exports.getVideoById = exports.getUserVideos = exports.getAllVideos = exports.publishAVideo = void 0;
const fs_1 = __importDefault(require("fs"));
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const cloudinary_1 = require("../utils/cloudinary");
const hashedPassword_1 = require("../utils/hashedPassword");
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
            const video = yield hashedPassword_1.prisma.video.create({
                data: {
                    videoFile: videoFile === null || videoFile === void 0 ? void 0 : videoFile.secure_url,
                    thumbnail: thumbnail === null || thumbnail === void 0 ? void 0 : thumbnail.secure_url,
                    title: title,
                    duration: videoFile === null || videoFile === void 0 ? void 0 : videoFile.width,
                    description: description || "",
                    isPublished: true,
                    ownerId: Number((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId),
                },
            });
            if (!video) {
                throw new ApiError_1.ApiError(500, "Error while creating and uploading video");
            }
            res.status(201).json(video);
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
            const videos = yield hashedPassword_1.prisma.video.findMany({
                where: Object.assign({ isPublished: true }, (query && {
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
                            userId: true,
                            avatar: true,
                            fullName: true,
                            username: true,
                            subscribers: true,
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
            res.status(200).json(videos);
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
            const userId = req.params.userId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const sortType = req.query.sortType === "asc" ? "asc" : "desc";
            const skip = (page - 1) * limit;
            const videos = yield hashedPassword_1.prisma.video.findMany({
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
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.statusCode || 500, error.message || "Error while user's videos");
        }
    }),
});
exports.getUserVideos = getUserVideos;
const getVideoById = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { videoId } = req.params;
            if (!videoId) {
                throw new ApiError_1.ApiError(400, "Invalid videoId");
            }
            const video = yield hashedPassword_1.prisma.video.findUnique({
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
                throw new ApiError_1.ApiError(404, "Video not found");
            }
            const likesCount = video.likes.length;
            const isLiked = video.likes.some((like) => like.likedBy);
            const subscriberCount = video.owner.subscribers.length;
            const isSubscribed = video.owner.subscribers.some((sub) => { var _a; return sub.id === Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId); });
            const result = Object.assign(Object.assign({}, video), { likesCount: likesCount, isLiked: isLiked, owner: Object.assign(Object.assign({}, video.owner), { id: video.owner.userId, subscriberCount: subscriberCount, isSubscribed: isSubscribed }) });
            res.status(200).json(result);
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.statusCode || 500, error.message || "Error while user's video");
        }
    }),
});
exports.getVideoById = getVideoById;
const updateVideo = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { title, description } = req.body;
            const { videoId } = req.params;
            const thumbnailLocalPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
            if (!thumbnailLocalPath) {
                throw new ApiError_1.ApiError(400, "thumbnailLocalPath file is missing!");
            }
            const video = yield hashedPassword_1.prisma.video.findUnique({
                where: {
                    id: Number(videoId),
                },
            });
            if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) !== (video === null || video === void 0 ? void 0 : video.ownerId)) {
                unlinkPath(thumbnailLocalPath);
                throw new ApiError_1.ApiError(401, "You do not have the permission to perform this action");
            }
            const thumbnail = yield (0, cloudinary_1.uploadOnCloudinary)(thumbnailLocalPath);
            if (!thumbnail) {
                throw new ApiError_1.ApiError(400, "Error while uploading thumbnail on cloudinary");
            }
            else {
                const thumbnailUrl = video === null || video === void 0 ? void 0 : video.thumbnail;
                const regex = /\/([^/]+)\.[^.]+$/;
                const match = thumbnailUrl === null || thumbnailUrl === void 0 ? void 0 : thumbnailUrl.match(regex);
                if (!match) {
                    throw new ApiError_1.ApiError(400, "Couldn't find public Id of old thumbnail!");
                }
                const publicId = match[1];
                yield (0, cloudinary_1.deleteFromCloudinary)(publicId);
            }
            const updatedVideo = yield hashedPassword_1.prisma.video.update({
                where: {
                    id: Number(videoId),
                },
                data: {
                    title: title || (video === null || video === void 0 ? void 0 : video.title),
                    description: description || (video === null || video === void 0 ? void 0 : video.description),
                    thumbnail: thumbnail.secure_url || (video === null || video === void 0 ? void 0 : video.thumbnail),
                },
            });
            res.status(200).json(updatedVideo);
        }
        catch (error) {
            throw new ApiError_1.ApiError(400, "Error while updating user's video");
        }
    }),
});
exports.updateVideo = updateVideo;
const deleteVideo = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { videoId } = req.params;
            if (!videoId) {
                throw new ApiError_1.ApiError(404, "Video ID not found!");
            }
            const video = yield hashedPassword_1.prisma.video.findUnique({
                where: {
                    id: Number(videoId),
                },
            });
            if (!video) {
                throw new ApiError_1.ApiError(404, "Video not found!");
            }
            if ((video === null || video === void 0 ? void 0 : video.ownerId) !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new ApiError_1.ApiError(401, "Not have permission to delete video!");
            }
            yield hashedPassword_1.prisma.video.delete({
                where: {
                    id: Number(videoId),
                },
            });
            // delete videoFile and thumbail
            const thumbailUrl = video === null || video === void 0 ? void 0 : video.thumbnail;
            const videoFileUrl = video === null || video === void 0 ? void 0 : video.videoFile;
            const regex = /\/([^/]+)\.[^.]+$/;
            // let's delete thumbnail
            let match = thumbailUrl.match(regex);
            if (!match) {
                throw new ApiError_1.ApiError(400, "Couldn't find thumbnail");
            }
            let publicId = match[1];
            const deleteThumbnail = yield (0, cloudinary_1.deleteFromCloudinary)(publicId);
            // let's delete videoFile
            match = videoFileUrl.match(regex);
            if (!match) {
                throw new ApiError_1.ApiError(400, "Couldn't find videoFile");
            }
            publicId = match[1];
            const deleteVideoFile = yield (0, cloudinary_1.deleteFromCloudinary)(publicId);
            if (deleteThumbnail.result !== "ok" && deleteVideoFile.result !== "ok") {
                throw new ApiError_1.ApiError(500, "Error while deleting thumbnail and videoFile from cloudinary");
            }
            res.status(200).json({});
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.statusCode || 500, error.message || "Error while deleting video");
        }
    }),
});
exports.deleteVideo = deleteVideo;
const togglePublishStatus = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { videoId } = req.params;
            if (!videoId) {
                throw new ApiError_1.ApiError(400, "Invalid video ID!");
            }
            const video = yield hashedPassword_1.prisma.video.findUnique({
                where: {
                    id: Number(videoId),
                },
            });
            if (!video) {
                throw new ApiError_1.ApiError(404, "Video not found!");
            }
            if ((video === null || video === void 0 ? void 0 : video.ownerId) !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new ApiError_1.ApiError(401, "Not have the permission to toggle publishStatus!");
            }
            const updateVideo = yield hashedPassword_1.prisma.video.update({
                where: {
                    id: Number(videoId),
                },
                data: {
                    isPublished: !video.isPublished,
                },
            });
            res.status(200).json(updateVideo);
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.statusCode || 500, error.message || "Error while deleting video");
        }
    }),
});
exports.togglePublishStatus = togglePublishStatus;
const getSubscribedVideos = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { page = 1, limit = 10, sortType = "desc" } = req.query;
            // Step 1: Get all subscribed channel IDs
            const subscriptions = yield hashedPassword_1.prisma.subscription.findMany({
                where: {
                    subscriberId: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
                },
                select: {
                    channelId: true,
                },
            });
            const channelIds = subscriptions.map((sub) => sub.channelId);
            if (channelIds.length === 0) {
                throw new ApiError_1.ApiError(200, "No subscribed channels found");
            }
            // Step 2: Get videos from those channels
            const videos = yield hashedPassword_1.prisma.video.findMany({
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
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.statusCode || 500, error.message || "Error while deleting video");
        }
    }),
});
exports.getSubscribedVideos = getSubscribedVideos;
