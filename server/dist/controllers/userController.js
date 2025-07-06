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
exports.registerUser = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const cloudinary_1 = require("../utils/cloudinary");
const fs_1 = __importDefault(require("fs"));
const tokens_1 = require("../utils/tokens");
// to delete files from the local file system
function unlinkPath(avatarLocalPath, coverImageLocalPath) {
    if (avatarLocalPath)
        fs_1.default.unlinkSync(avatarLocalPath);
    if (coverImageLocalPath)
        fs_1.default.unlinkSync(coverImageLocalPath);
}
// for the creation of token
const generateAcessAndRefreshTokens = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, val = 0) {
    try {
        const user = yield prisma_1.default.user.findUnique({
            where: {
                userId: userId,
            },
        });
        if (!user) {
            throw new ApiError_1.ApiError("User is not found");
        }
        const accessToken = (0, tokens_1.generateAccessToken)(user);
        const refreshToken = (0, tokens_1.generateRefreshToken)(user);
        const userWithRefreshToken = yield prisma_1.default.user.update({
            where: {
                userId: userId,
            },
            data: {
                refreshToken: refreshToken,
            },
        });
        if (userWithRefreshToken) {
            return { accessToken, refreshToken };
        }
        return accessToken;
    }
    catch (error) {
        throw new ApiError_1.ApiError(500, "Something went wrong while generating token");
    }
});
const registerUser = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const { fullName, email, username, password } = req.body;
            let avatarLocalPath;
            if (Array.isArray(req.files)) {
                const avatarFile = req.files.find((file) => file.fieldname === "avatar");
                avatarLocalPath = avatarFile === null || avatarFile === void 0 ? void 0 : avatarFile.path;
            }
            else if (req.files &&
                typeof req.files === "object" &&
                "avatar" in req.files) {
                avatarLocalPath = (_a = req.files.avatar[0]) === null || _a === void 0 ? void 0 : _a.path;
            }
            let coverImageLocalPath;
            if (req.files && Array.isArray(req.files)) {
                const coverImageFile = req.files.find((file) => file.fieldname === "coverImage");
                coverImageLocalPath = coverImageFile === null || coverImageFile === void 0 ? void 0 : coverImageFile.path;
            }
            else {
                coverImageLocalPath = (_b = req.files.coverImage[0]) === null || _b === void 0 ? void 0 : _b.path;
            }
            if ([fullName, email, username, password].some((field) => (field === null || field === void 0 ? void 0 : field.trim()) === "")) {
                unlinkPath(avatarLocalPath, coverImageLocalPath);
                throw new ApiError_1.ApiError(400, "All fields are required");
            }
            const existedUser = yield prisma_1.default.user.findFirst({
                where: {
                    OR: [{ username: username }, { email: email }],
                },
            });
            if (existedUser) {
                throw new ApiError_1.ApiError(409, "User with email or username already exists!");
            }
            const avatar = yield (0, cloudinary_1.uploadOnCloudinary)(avatarLocalPath);
            const coverImage = yield (0, cloudinary_1.uploadOnCloudinary)(coverImageLocalPath);
            if (!avatar) {
                throw new ApiError_1.ApiError(400, "Avatar file not retrieved from cloudinary!");
            }
            const createdUser = yield prisma_1.default.user.create({
                data: {
                    fullName: fullName,
                    avatar: avatar.url,
                    coverImage: coverImage === null || coverImage === void 0 ? void 0 : coverImage.url,
                    email: email,
                    password: password,
                    username: username,
                },
                select: {
                    fullName: true,
                    username: true,
                    avatar: true,
                    coverImage: true,
                    description: true,
                    email: true,
                    watchHistory: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            res
                .status(201)
                .json(new ApiResponse_1.ApiResponse(200, createdUser, "User registered successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while creating new user!");
        }
    }),
});
exports.registerUser = registerUser;
