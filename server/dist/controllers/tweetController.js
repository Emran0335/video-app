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
exports.getAllTweets = exports.createTweet = void 0;
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const hashedPassword_1 = require("../utils/hashedPassword");
const createTweet = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { content } = req.body;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!(content === null || content === void 0 ? void 0 : content.trim())) {
                throw new ApiError_1.ApiError(400, "Tweet cannot be empty");
            }
            const tweet = yield hashedPassword_1.prisma.tweet.create({
                data: {
                    content: content,
                    ownerId: Number(userId),
                },
            });
            if (!tweet) {
                throw new ApiError_1.ApiError(500, "Error while creating tweet");
            }
            res
                .status(201)
                .json(new ApiResponse_1.ApiResponse(201, tweet, "Tweet created successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while creating new tweet!");
        }
    }),
});
exports.createTweet = createTweet;
const getAllTweets = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { page = 1, limit = 30 } = req.query;
            const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
            const tweets = yield hashedPassword_1.prisma.tweet.findMany({
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
                throw new ApiError_1.ApiError(400, "No tweets found!");
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
                .json(new ApiResponse_1.ApiResponse(200, tweetsWithInfo, "Tweets fetched successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while creating new tweet!");
        }
    }),
});
exports.getAllTweets = getAllTweets;
