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
exports.deleteComment = exports.updateComment = exports.getVideoComments = exports.addComment = void 0;
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const hashedPassword_1 = require("../utils/hashedPassword");
const addComment = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { content } = req.body;
            const { videoId } = req.params;
            if (!(content === null || content === void 0 ? void 0 : content.trim())) {
                throw new ApiError_1.ApiError(400, "Comment cannot be empty!");
            }
            if (!videoId) {
                throw new ApiError_1.ApiError(400, "Invalid video ID");
            }
            const comment = yield hashedPassword_1.prisma.comment.create({
                data: {
                    content: content,
                    video: Number(videoId),
                    owner: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
                },
            });
            if (!comment) {
                throw new ApiError_1.ApiError(500, "Error while creating comment");
            }
            res.status(201).json(comment);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while creating comment!");
        }
    }),
});
exports.addComment = addComment;
const getVideoComments = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { videoId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            if (!videoId) {
                throw new ApiError_1.ApiError(400, "Video ID not found");
            }
            const comments = yield hashedPassword_1.prisma.comment.findMany({
                where: {
                    video: Number(videoId),
                },
                include: {
                    ownerId: {
                        select: {
                            userId: true,
                            username: true,
                            avatar: true,
                        },
                    },
                    likes: {
                        select: {
                            likedBy: true,
                        },
                    },
                },
                skip: (Number(page) - 1) * Number(limit),
                take: Number(page),
            });
            if (!comments) {
                throw new ApiError_1.ApiError(500, "Comments not found!");
            }
            const getComments = comments.map((comment) => {
                var _a;
                const comments = comment.likes;
                return {
                    id: comment.id,
                    owner: comment.ownerId,
                    content: comment.content,
                    likesCount: comments.length,
                    isLiked: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)
                        ? comments.some((comment) => { var _a, _b; return ((_a = comment.likedBy) === null || _a === void 0 ? void 0 : _a.userId) === Number((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId); })
                        : false,
                };
            });
            res.status(200).json(getComments);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while fetching comments!");
        }
    }),
});
exports.getVideoComments = getVideoComments;
const updateComment = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { content } = req.body;
            const { commentId } = req.params;
            if (!content.trim()) {
                throw new ApiError_1.ApiError(400, "Comment content not found");
            }
            if (!commentId) {
                throw new ApiError_1.ApiError(400, "Invalid comment ID");
            }
            const comment = yield hashedPassword_1.prisma.comment.findUnique({
                where: {
                    id: Number(commentId),
                },
            });
            if (!comment) {
                throw new ApiError_1.ApiError(500, "Comment not found");
            }
            if (comment.owner !== Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new ApiError_1.ApiError(401, "No permission to update comment");
            }
            const updateComment = yield hashedPassword_1.prisma.comment.update({
                where: {
                    id: Number(commentId),
                },
                data: {
                    content: content,
                },
            });
            if (!updateComment) {
                throw new ApiError_1.ApiError(400, "Error while updating comment");
            }
            res.status(200).json(updateComment);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while fetching comments!");
        }
    }),
});
exports.updateComment = updateComment;
const deleteComment = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { commentId } = req.params;
            if (!commentId) {
                throw new ApiError_1.ApiError(400, "Invalid comment ID");
            }
            const comment = yield hashedPassword_1.prisma.comment.findUnique({
                where: {
                    id: Number(commentId),
                },
            });
            if (!comment) {
                throw new ApiError_1.ApiError(500, "No comment found");
            }
            if (comment.owner !== Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new ApiError_1.ApiError(401, "No permission to delete comment");
            }
            const deletedComment = yield hashedPassword_1.prisma.comment.delete({
                where: {
                    id: comment.id,
                },
            });
            res.status(200).json(deletedComment);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while fetching comments!");
        }
    }),
});
exports.deleteComment = deleteComment;
