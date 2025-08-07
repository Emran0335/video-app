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
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleTweetLike = exports.toggleCommentLike = exports.toggleVideoLike = exports.getLikedVideos = void 0;
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const hashedPassword_1 = require("../utils/hashedPassword");
const getLikedVideos = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { page = 1, limit = 10 } = req.query;
            const likedVideos = yield hashedPassword_1.prisma.like.findMany({
                where: {
                    likedById: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
                },
                include: {
                    video: {
                        select: {
                            isPublished: true,
                        },
                    },
                    likedBy: {
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
                throw new ApiError_1.ApiError(500, "Error while fetching liked videos");
            }
            res.status(200).json(likedVideos);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting all tweet!");
        }
    }),
});
exports.getLikedVideos = getLikedVideos;
const toggleVideoLike = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { videoId } = req.params;
            if (!videoId) {
                throw new ApiError_1.ApiError(400, "Invalid video ID");
            }
            const isLiked = yield hashedPassword_1.prisma.like.findFirst({
                where: {
                    videoId: Number(videoId),
                    likedById: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
                },
            });
            if (isLiked) {
                const removeLike = yield hashedPassword_1.prisma.like.delete({
                    where: {
                        id: isLiked.id,
                    },
                });
                if (!removeLike) {
                    throw new ApiError_1.ApiError(500, "Error while removing like");
                }
            }
            else {
                const liked = yield hashedPassword_1.prisma.like.create({
                    data: {
                        videoId: Number(videoId),
                        likedById: Number((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId),
                    },
                });
                if (!liked) {
                    throw new ApiError_1.ApiError(500, "Error while liking the video");
                }
            }
            res.status(200).json({});
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while changing video like status");
        }
    }),
});
exports.toggleVideoLike = toggleVideoLike;
const toggleCommentLike = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { commentId } = req.params;
            if (!commentId || isNaN(Number(commentId))) {
                throw new ApiError_1.ApiError(400, "No valid comment Id found");
            }
            const isLiked = yield hashedPassword_1.prisma.like.findFirst({
                where: {
                    commentId: Number(commentId),
                    likedById: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
                },
            });
            if (isLiked) {
                const removeLiked = yield hashedPassword_1.prisma.like.delete({
                    where: {
                        id: isLiked.id,
                    },
                });
                if (!removeLiked) {
                    throw new ApiError_1.ApiError(500, "Error while removing liked comment");
                }
            }
            else {
                const liked = yield hashedPassword_1.prisma.like.create({
                    data: {
                        commentId: Number(commentId),
                        likedById: Number((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId),
                    },
                    select: {
                        likedBy: true,
                        likedById: true,
                    },
                });
                if (!liked) {
                    throw new ApiError_1.ApiError(500, "Error while liking comment");
                }
            }
            res.status(200).json(isLiked);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while changing comment status!");
        }
    }),
});
exports.toggleCommentLike = toggleCommentLike;
const toggleTweetLike = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { tweetId } = req.params;
            if (!tweetId) {
                throw new ApiError_1.ApiError(400, "No valid tweet Id found");
            }
            const isLiked = yield hashedPassword_1.prisma.like.findFirst({
                where: {
                    tweetId: Number(tweetId),
                    likedById: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
                },
            });
            if (isLiked) {
                const removeLiked = yield hashedPassword_1.prisma.like.delete({
                    where: {
                        id: isLiked.id,
                    },
                });
                if (!removeLiked) {
                    throw new ApiError_1.ApiError(500, "Error while removing liked tweet");
                }
            }
            else {
                const liked = yield hashedPassword_1.prisma.like.create({
                    data: {
                        tweetId: Number(tweetId),
                        likedById: Number((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId),
                    },
                });
                if (!liked) {
                    throw new ApiError_1.ApiError(500, "Error while liking tweet");
                }
            }
            res.status(200).json({});
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while changing tweet status!");
        }
    }),
});
exports.toggleTweetLike = toggleTweetLike;
