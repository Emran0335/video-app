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
exports.getWatchHistory = exports.getUserChannelProfile = exports.updateUserCoverImage = exports.updateUserAvatar = exports.updateAccountDetails = exports.getCurrentLoggedInUser = exports.changeCurrentPassword = exports.refreshAccessToken = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const hashedPassword_1 = require("../utils/hashedPassword");
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const cloudinary_1 = require("../utils/cloudinary");
const fs_1 = __importDefault(require("fs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const tokens_1 = require("../utils/tokens");
// to delete files from the local file system
function unlinkPath(avatarLocalPath, coverImageLocalPath) {
    if (avatarLocalPath)
        fs_1.default.unlinkSync(avatarLocalPath);
    if (coverImageLocalPath)
        fs_1.default.unlinkSync(coverImageLocalPath);
}
// for the creation of token
const generateAccessAndRefreshTokens = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, val = 0) {
    try {
        const user = yield hashedPassword_1.prisma.user.findUnique({
            where: {
                userId: userId,
            },
        });
        if (!user) {
            throw new ApiError_1.ApiError("User is not found");
        }
        const accessToken = (0, tokens_1.generateAccessToken)(user);
        let refreshToken;
        if (val === 0) {
            refreshToken = (0, tokens_1.generateRefreshToken)(user);
            const userWithRefreshToken = yield hashedPassword_1.prisma.user.update({
                where: {
                    userId: userId,
                },
                data: {
                    refreshToken: refreshToken,
                },
            });
            return {
                accessToken,
                refreshToken,
            };
        }
        return { accessToken };
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
            const existedUser = yield hashedPassword_1.prisma.user.findFirst({
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
            const createdUser = yield hashedPassword_1.prisma.user.create({
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
            const user = yield hashedPassword_1.prisma.user.findFirst({
                where: {
                    OR: [{ username: username }, { email: email }],
                },
            });
            if (!user) {
                throw new ApiError_1.ApiError(404, "User does not exist!");
            }
            const isPasswordValid = yield (0, hashedPassword_1.isPasswordCorrect)(password, user.password);
            if (!isPasswordValid) {
                throw new ApiError_1.ApiError(401, "Invalid user credentials!");
            }
            const { accessToken, refreshToken } = yield generateAccessAndRefreshTokens(user.userId);
            const loggedUser = yield hashedPassword_1.prisma.user.findUnique({
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
const logoutUser = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            yield hashedPassword_1.prisma.user.update({
                where: {
                    userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
                },
                data: {
                    refreshToken: null,
                },
            });
            const options = {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            };
            res
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .json(new ApiResponse_1.ApiResponse(200, {}, "User logged out successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(500, (error === null || error === void 0 ? void 0 : error.message) || "Error while logging out");
        }
    }),
});
exports.logoutUser = logoutUser;
const refreshAccessToken = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const inComingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
            if (!inComingRefreshToken) {
                throw new ApiError_1.ApiError(401, "Anauthorized request!");
            }
            const decodedToken = jsonwebtoken_1.default.verify(inComingRefreshToken, process.env.REFRESH_TOKEN_SECRET || "");
            // decodedToken { id: '1', iat: 1751957369, exp: 1752821369 }
            const user = yield hashedPassword_1.prisma.user.findUnique({
                where: {
                    userId: Number(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id),
                },
            });
            if (!user) {
                throw new ApiError_1.ApiError(401, "Invalid refresh token!");
            }
            if (inComingRefreshToken !== (user === null || user === void 0 ? void 0 : user.refreshToken)) {
                throw new ApiError_1.ApiError(401, "Refresh token expired or used!");
            }
            const options = {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            };
            const { accessToken } = yield generateAccessAndRefreshTokens(user === null || user === void 0 ? void 0 : user.userId, 1);
            res
                .status(200)
                .cookie("accessToken", accessToken, options)
                .json(new ApiResponse_1.ApiResponse(200, { accessToken }, "Access token refreshed"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Invalid refresh token!");
        }
    }),
});
exports.refreshAccessToken = refreshAccessToken;
const changeCurrentPassword = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { password, newPassword } = req.body;
            const user = yield hashedPassword_1.prisma.user.findUnique({
                where: {
                    userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId,
                },
            });
            const isOldPasswordCorrect = yield (0, hashedPassword_1.isPasswordCorrect)(password, user === null || user === void 0 ? void 0 : user.password);
            if (!isOldPasswordCorrect) {
                throw new ApiError_1.ApiError(400, "Invalid Old Password");
            }
            // for password to hash again
            yield hashedPassword_1.prisma.user.hashPasswordAgain(user, newPassword);
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
const getCurrentLoggedInUser = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            throw new ApiError_1.ApiError(400, "Current logged-in user not found!");
        }
        res
            .status(200)
            .json(new ApiResponse_1.ApiResponse(200, req.user, "Current logged-in user fetched successfully"));
    }),
});
exports.getCurrentLoggedInUser = getCurrentLoggedInUser;
const updateAccountDetails = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        try {
            const { fullName, email, username, description } = req.body;
            if (!fullName && !email && !username && !description) {
                throw new ApiError_1.ApiError(400, "All fields are required");
            }
            const user = yield hashedPassword_1.prisma.user.update({
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
const updateUserAvatar = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const avatarLocalPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
            if (!avatarLocalPath) {
                throw new ApiError_1.ApiError(400, "Avatar file is missing!");
            }
            const avatar = yield (0, cloudinary_1.uploadOnCloudinary)(avatarLocalPath);
            if (!(avatar === null || avatar === void 0 ? void 0 : avatar.secure_url)) {
                throw new ApiError_1.ApiError(400, "Error while uploading on cloudinary");
            }
            const avatarUrl = (_b = req.user) === null || _b === void 0 ? void 0 : _b.avatar;
            const regex = /\/([^/]+)\.[^.]+$/;
            const match = avatarUrl === null || avatarUrl === void 0 ? void 0 : avatarUrl.match(regex);
            if (!match) {
                throw new ApiError_1.ApiError(400, "Couldn't find public Id of old avatar!");
            }
            const publicId = match[1];
            yield (0, cloudinary_1.deleteFromCloudinary)(publicId);
            const userWithNewAvatar = yield hashedPassword_1.prisma.user.update({
                where: {
                    userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId,
                },
                data: {
                    avatar: avatar.secure_url,
                },
            });
            res
                .status(200)
                .json(new ApiResponse_1.ApiResponse(200, userWithNewAvatar, "Avatar is updated successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(400, "Error while updating user's avatar");
        }
    }),
});
exports.updateUserAvatar = updateUserAvatar;
const updateUserCoverImage = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const coverImageLocalPath = (_a = req.file) === null || _a === void 0 ? void 0 : _a.path;
            if (!coverImageLocalPath) {
                throw new ApiError_1.ApiError(400, "CoverImage file is missing!");
            }
            const coverImage = yield (0, cloudinary_1.uploadOnCloudinary)(coverImageLocalPath);
            if (!(coverImage === null || coverImage === void 0 ? void 0 : coverImage.secure_url)) {
                throw new ApiError_1.ApiError(400, "Error while uploading on cloudinary");
            }
            const coverImageUrl = (_b = req.user) === null || _b === void 0 ? void 0 : _b.coverImage;
            const regex = /\/([^/]+)\.[^.]+$/;
            const match = coverImageUrl === null || coverImageUrl === void 0 ? void 0 : coverImageUrl.match(regex);
            if (!match) {
                throw new ApiError_1.ApiError(400, "Couldn't find public Id of old coverImage!");
            }
            const publicId = match[1];
            yield (0, cloudinary_1.deleteFromCloudinary)(publicId);
            const userWithNewCoverImage = yield hashedPassword_1.prisma.user.update({
                where: {
                    userId: (_c = req.user) === null || _c === void 0 ? void 0 : _c.userId,
                },
                data: {
                    avatar: coverImage.secure_url,
                },
            });
            res
                .status(200)
                .json(new ApiResponse_1.ApiResponse(200, userWithNewCoverImage, "CoverImage is updated successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(400, "Error while updating user's coverImage");
        }
    }),
});
exports.updateUserCoverImage = updateUserCoverImage;
const getUserChannelProfile = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { username } = req.params;
            const currentLoggedInUser = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!currentLoggedInUser) {
                throw new ApiError_1.ApiError(404, "No CurrentLoggedInuser is found");
            }
            if (!username.trim()) {
                throw new ApiError_1.ApiError(400, "Username is missing!");
            }
            const channel = yield hashedPassword_1.prisma.user.findUnique({
                where: {
                    username: username === null || username === void 0 ? void 0 : username.toLowerCase(),
                },
                select: {
                    userId: true,
                },
            });
            if (!channel) {
                throw new ApiError_1.ApiError(404, "Channel not found!");
            }
            const [subcribers, subscribedTo] = yield Promise.all([
                // subcribers of this channel(other users who subcribe this channel)
                hashedPassword_1.prisma.subscription.count({
                    where: {
                        channelId: channel.userId,
                    },
                }),
                //
                hashedPassword_1.prisma.subscription.count({
                    where: {
                        subscriberId: channel.userId,
                    },
                }),
            ]);
            // check if currentLoggedInUser is a subscriber to this channel
            const isSubscribed = currentLoggedInUser
                ? Boolean(yield hashedPassword_1.prisma.subscription.findFirst({
                    where: {
                        channelId: channel.userId,
                        subscriberId: currentLoggedInUser,
                    },
                }))
                : false;
            // fetch channel profile with all fields
            const channelProfile = yield hashedPassword_1.prisma.user.findUnique({
                where: {
                    userId: channel.userId,
                },
                select: {
                    userId: true,
                    fullName: true,
                    username: true,
                    avatar: true,
                    coverImage: true,
                    email: true,
                    description: true,
                    createdAt: true,
                },
            });
            const profileData = Object.assign(Object.assign({}, channelProfile), { userId: channelProfile === null || channelProfile === void 0 ? void 0 : channelProfile.userId, subscribersCount: subcribers, channelsSubscribedToCount: subscribedTo, isSubscribed });
            res
                .status(200)
                .json(new ApiResponse_1.ApiResponse(200, profileData, "Channel profile fetched successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.statusCode || 500, error.message || "Error fetching channel profile");
        }
    }),
});
exports.getUserChannelProfile = getUserChannelProfile;
const getWatchHistory = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            //const {page = 1, limit = 10} = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            // get user's watchHistory videoIds array
            const user = yield hashedPassword_1.prisma.user.findUnique({
                where: {
                    userId: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
                },
                select: {
                    watchHistory: true,
                },
            });
            if (!user) {
                throw new ApiError_1.ApiError(404, "User and his watchHistory not found!");
            }
            // Array of videoIds
            const videoIds = user.watchHistory.map((videoId) => videoId.id);
            // get paginated watch history videos with owner's(user) details
            const watchHistoryWithOwner = yield hashedPassword_1.prisma.video.findMany({
                where: {
                    id: { in: videoIds },
                },
                select: {
                    id: true,
                    title: true,
                    duration: true,
                    description: true,
                    videoFile: true,
                    thumbnail: true,
                    views: true,
                    isPublised: true,
                    createdAt: true,
                    updatedAt: true,
                    owner: {
                        select: {
                            fullName: true,
                            username: true,
                            avatar: true,
                        },
                    },
                },
                orderBy: { updatedAt: "desc" },
                skip,
                take: limit,
            });
            // get total videos for pagination metadata
            const totalCount = yield hashedPassword_1.prisma.video.count({
                where: {
                    id: { in: videoIds },
                    isPublised: true,
                },
            });
            res.status(200).json(new ApiResponse_1.ApiResponse(200, {
                watchHistoryWithOwner,
                totalCount,
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                hasNextPage: skip + limit < totalCount,
            }, "Video watch history of the user fetched successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.statusCode || 500, error.message || "Error fetching watch history");
        }
    }),
});
exports.getWatchHistory = getWatchHistory;
