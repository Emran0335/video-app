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
exports.deleteTweet = exports.getUserTweets = exports.updateTweet = exports.getAllTweets = exports.createTweet = void 0;
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
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
            res.status(201).json(tweet);
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
                take: Number(page),
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
            res.status(200).json(tweetsWithInfo);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting all tweet!");
        }
    }),
});
exports.getAllTweets = getAllTweets;
const updateTweet = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { content } = req.body;
            const { tweetId } = req.params;
            if (!(content === null || content === void 0 ? void 0 : content.trim())) {
                throw new ApiError_1.ApiError(400, "Tweet content is empty!");
            }
            if (!tweetId) {
                throw new ApiError_1.ApiError(400, "Invalid tweet ID!");
            }
            const tweet = yield hashedPassword_1.prisma.tweet.findUnique({
                where: {
                    id: Number(tweetId),
                },
            });
            if (!tweet) {
                throw new ApiError_1.ApiError(500, "Tweet not found!");
            }
            if (tweet.ownerId !== Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new ApiError_1.ApiError(401, "No permission to update the tweet");
            }
            const updatedTweet = yield hashedPassword_1.prisma.tweet.update({
                where: {
                    id: Number(tweet.id),
                },
                data: Object.assign(Object.assign({}, tweet), { content: content }),
            });
            if (!updatedTweet) {
                throw new ApiError_1.ApiError(400, "Error while updating the tweet");
            }
            const tweetWithRelation = yield hashedPassword_1.prisma.tweet.findMany({
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
                    Like: {
                        select: {
                            likedBy: true,
                        },
                    },
                },
            });
            const tweetDetails = tweetWithRelation.map((tweet) => {
                var _a;
                const likes = tweet.Like;
                return {
                    id: tweet.id,
                    content: tweet.content,
                    owner: tweet.owner,
                    createdAt: tweet.createdAt,
                    updatedAt: tweet.updatedAt,
                    likesCount: likes.length,
                    isLiked: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)
                        ? likes.some((like) => { var _a; return like.likedBy === Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId); })
                        : false,
                };
            });
            res.status(200).json(tweetDetails);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while updating tweet!");
        }
    }),
});
exports.updateTweet = updateTweet;
const getUserTweets = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 30 } = req.query;
            if (!userId) {
                throw new ApiError_1.ApiError(400, "No valid user ID found");
            }
            const tweets = yield hashedPassword_1.prisma.tweet.findMany({
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
                    Like: {
                        select: {
                            likedBy: true,
                        },
                    },
                },
            });
            if (!(tweets === null || tweets === void 0 ? void 0 : tweets.length)) {
                throw new ApiError_1.ApiError(401, "No tweets found for this user");
            }
            const tweetDetails = tweets.map((tweet) => {
                const likes = tweet.Like;
                return {
                    id: tweet.id,
                    content: tweet.content,
                    owner: tweet.owner,
                    likesCount: likes.length,
                    isLiked: Number(userId)
                        ? likes.some((like) => like.likedBy === Number(userId))
                        : false,
                };
            });
            res.status(200).json(tweetDetails);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting user's tweets!");
        }
    }),
});
exports.getUserTweets = getUserTweets;
const deleteTweet = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { tweetId } = req.params;
            if (!tweetId) {
                throw new ApiError_1.ApiError(400, "Invalid tweet ID");
            }
            const tweet = yield hashedPassword_1.prisma.tweet.findUnique({
                where: {
                    id: Number(tweetId),
                },
            });
            if ((tweet === null || tweet === void 0 ? void 0 : tweet.ownerId) !== Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new ApiError_1.ApiError(401, "You do not the have permission to delete this tweet");
            }
            const deletedTweet = yield hashedPassword_1.prisma.tweet.delete({
                where: {
                    id: tweet.id,
                },
            });
            console.log(deletedTweet);
            if (!deletedTweet) {
                throw new ApiError_1.ApiError(400, "Error while deleting tweet");
            }
            res.status(200).json(deletedTweet);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while deleting tweet!");
        }
    }),
});
exports.deleteTweet = deleteTweet;
