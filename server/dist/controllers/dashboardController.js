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
exports.getChannelVideos = exports.getChannelStats = void 0;
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const hashedPassword_1 = require("../utils/hashedPassword");
const getChannelStats = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { userId } = req.params;
            if (!userId || isNaN(Number(userId))) {
                throw new ApiError_1.ApiError(400, "Invalid user ID");
            }
            const videos = yield hashedPassword_1.prisma.video.findMany({
                where: {
                    ownerId: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
                },
                select: {
                    id: true,
                    views: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        },
                    },
                },
            });
            const totalVideos = videos.length;
            const totalViews = videos.reduce((acc, video) => acc + video.views, 0);
            const totalLikes = videos.reduce((acc, video) => acc + video._count.likes, 0);
            const totalComments = videos.reduce((acc, video) => acc + video._count.comments, 0);
            const subscribersCount = yield hashedPassword_1.prisma.subscription.count({
                where: {
                    channelId: Number(userId),
                },
            });
            const totalTweets = yield hashedPassword_1.prisma.tweet.count({
                where: {
                    ownerId: Number(userId),
                },
            });
            const stats = {
                subscribersCount: subscribersCount || 0,
                totalLikes: totalLikes || 0,
                totalComments: totalComments || 0,
                totalVideos: totalVideos || 0,
                totalViews: totalViews || 0,
                totalTweets: totalTweets || 0,
            };
            res.status(200).json(stats);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting user channel's stats!");
        }
    }),
});
exports.getChannelStats = getChannelStats;
const getChannelVideos = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const videos = yield hashedPassword_1.prisma.video.findMany({
                where: {
                    ownerId: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
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
                throw new ApiError_1.ApiError(500, "No video found");
            }
            const transformed = videos.map((video) => (Object.assign(Object.assign({}, video), { likesCount: video._count.likes, commentsCount: video._count.comments })));
            res.status(200).json(transformed);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting user's videos!");
        }
    }),
});
exports.getChannelVideos = getChannelVideos;
