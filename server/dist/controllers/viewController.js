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
exports.viewVideoCount = void 0;
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const hashedPassword_1 = require("../utils/hashedPassword");
const viewVideoCount = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { videoId } = req.params;
            if (!videoId) {
                throw new ApiError_1.ApiError(404, "Invalid Video ID");
            }
            const recentView = yield hashedPassword_1.prisma.view.findFirst({
                where: {
                    videoId: Number(videoId),
                    userId: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
                    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                },
            });
            if (!recentView) {
                yield hashedPassword_1.prisma.video.update({
                    where: { id: Number(videoId) },
                    data: { views: { increment: 1 } },
                });
                yield hashedPassword_1.prisma.view.create({
                    data: {
                        videoId: Number(videoId),
                        userId: Number((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId),
                        createdAt: new Date(),
                    },
                });
            }
            res.status(200).json({ success: true });
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.statusCode || 500, error.message || "Error while deleting video");
        }
    }),
});
exports.viewVideoCount = viewVideoCount;
