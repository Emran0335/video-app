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
exports.updateAccountDetails = exports.changeCurrentPassword = exports.loginUser = exports.registerUser = void 0;
const client_1 = require("@prisma/client");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const cloudinary_1 = require("../utils/cloudinary");
const fs_1 = __importDefault(require("fs"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokens_1 = require("../utils/tokens");
const isPasswordCorrect_1 = require("../utils/isPasswordCorrect");
const prisma = new client_1.PrismaClient();
// to delete files from the local file system
function unlinkPath(avatarLocalPath, coverImageLocalPath) {
    if (avatarLocalPath)
        fs_1.default.unlinkSync(avatarLocalPath);
    if (coverImageLocalPath)
        fs_1.default.unlinkSync(coverImageLocalPath);
}
// for the creation of token
const generateAcessAndRefreshTokens = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield prisma.user.findUnique({
            where: {
                userId: userId,
            },
        });
        if (!user) {
            throw new ApiError_1.ApiError("User is not found");
        }
        const accessToken = (0, tokens_1.generateAccessToken)(user);
        const refreshToken = (0, tokens_1.generateRefreshToken)(user);
        const userWithRefreshToken = yield prisma.user.update({
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
        // Always return an object for consistent destructuring
        return { accessToken, refreshToken };
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
            const existedUser = yield prisma.user.findFirst({
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
            // Hash password BEFORE creating user
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const createdUser = yield prisma.user.create({
                data: {
                    fullName: fullName,
                    avatar: avatar.url,
                    coverImage: coverImage === null || coverImage === void 0 ? void 0 : coverImage.url,
                    email: email,
                    password: hashedPassword,
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
const loginUser = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { email, username, password } = req.body;
            if (!username && !email) {
                throw new ApiError_1.ApiError(500, "Username and email is required");
            }
            const user = yield prisma.user.findFirst({
                where: {
                    OR: [{ username: username }, { email: email }],
                },
            });
            if (!user) {
                throw new ApiError_1.ApiError(404, "User does not exist!");
            }
            const isPasswordValid = yield (0, isPasswordCorrect_1.isPasswordCorrect)(password, user.password);
            if (!isPasswordValid) {
                throw new ApiError_1.ApiError(401, "Invalid user credentials!");
            }
            const { accessToken, refreshToken } = yield generateAcessAndRefreshTokens(user.userId);
            const loggedUser = yield prisma.user.findUnique({
                where: {
                    userId: user.userId,
                },
                select: {
                    avatar: true,
                    coverImage: true,
                    userId: true,
                    username: true,
                    email: true,
                    password: true,
                    fullName: true,
                    description: true,
                    refreshToken: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            const options = {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            };
            res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", refreshToken, options)
                .json(new ApiResponse_1.ApiResponse(200, {
                user: loggedUser,
                accessToken: accessToken,
                refreshToken: refreshToken,
            }, "User logged in successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while logging user!");
        }
    }),
});
exports.loginUser = loginUser;
const changeCurrentPassword = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { password, newPassword } = req.body;
            const user = yield prisma.user.findUnique({
                where: {
                    userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
                },
            });
            const isOldPasswordCorrect = yield (0, isPasswordCorrect_1.isPasswordCorrect)(password, user === null || user === void 0 ? void 0 : user.password);
            if (!isOldPasswordCorrect) {
                throw new ApiError_1.ApiError(400, "Invalid Old Password");
            }
            // Hash password BEFORE creating user
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
            yield prisma.user.update({
                where: {
                    userId: user === null || user === void 0 ? void 0 : user.userId,
                },
                data: {
                    password: hashedPassword,
                },
            });
            res
                .status(200)
                .json(new ApiResponse_1.ApiResponse(200, {}, "Password changed successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while changing password!");
        }
    }),
});
exports.changeCurrentPassword = changeCurrentPassword;
const updateAccountDetails = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            const { fullName, email, username, description } = req.body;
            if (!fullName && !email && !username && !description) {
                throw new ApiError_1.ApiError(400, "All fields are required");
            }
            const user = yield prisma.user.update({
                where: {
                    userId: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
                },
                data: {
                    fullName: fullName || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.fullName),
                    email: email || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.email),
                    username: username || ((_d = req.user) === null || _d === void 0 ? void 0 : _d.username),
                    description: description || ((_e = req.user) === null || _e === void 0 ? void 0 : _e.description),
                },
                select: {
                    userId: true,
                    username: true,
                    fullName: true,
                    email: true,
                    description: true,
                    coverImage: true,
                    avatar: true,
                },
            });
            res
                .status(200)
                .json(new ApiResponse_1.ApiResponse(200, user, "Account details updated successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(400, "Error while updating account details");
        }
    }),
});
exports.updateAccountDetails = updateAccountDetails;
