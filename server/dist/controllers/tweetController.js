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
exports.createTweet = void 0;
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const hashedPassword_1 = require("../utils/hashedPassword");
const createTweet = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
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
    }),
});
exports.createTweet = createTweet;
