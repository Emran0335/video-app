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
exports.deletePlaylist = exports.removeVideoFromPlaylist = exports.updatePlaylist = exports.getPlaylistById = exports.getUserPlaylists = exports.getVideoPlaylist = exports.addVideoToPlaylist = exports.createPlaylist = void 0;
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const hashedPassword_1 = require("../utils/hashedPassword");
const createPlaylist = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { name, description } = req.body;
            if (!name) {
                throw new ApiError_1.ApiError(400, "Name is required!");
            }
            if (!description) {
                throw new ApiError_1.ApiError(400, "Description is required!");
            }
            const playlist = yield hashedPassword_1.prisma.playlist.create({
                data: {
                    name,
                    description: description || "",
                    ownerId: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
                },
            });
            if (!playlist) {
                throw new ApiError_1.ApiError(500, "Error while creating playlist");
            }
            res.status(201).json(playlist);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting all tweet!");
        }
    }),
});
exports.createPlaylist = createPlaylist;
const addVideoToPlaylist = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { playlistId, videoId } = req.params;
            const playlistIdNum = Number(playlistId);
            const videoIdNum = Number(videoId);
            const userId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
            // Validate numeric IDs
            if (isNaN(playlistIdNum) || isNaN(videoIdNum)) {
                throw new ApiError_1.ApiError(400, "Invalid playlist or video ID");
            }
            // Check playlist existence
            const playlist = yield hashedPassword_1.prisma.playlist.findUnique({
                where: { id: playlistIdNum },
                include: {
                    videos: {
                        select: { id: true },
                    },
                },
            });
            if (!playlist) {
                throw new ApiError_1.ApiError(400, "Playlist not found");
            }
            // Check video existence
            const video = yield hashedPassword_1.prisma.video.findUnique({
                where: { id: videoIdNum },
            });
            if (!video) {
                throw new ApiError_1.ApiError(400, "Video not found");
            }
            // Permission check
            if (playlist.ownerId !== userId) {
                throw new ApiError_1.ApiError(401, "You do not have the permission to add a video to this playlist");
            }
            // Check if video is already in the playlist
            const isAlreadyAdded = playlist.videos.some((v) => v.id === videoIdNum);
            if (isAlreadyAdded) {
                throw new ApiError_1.ApiError(400, "Video already in the playlist");
            }
            // Add video to playlist
            const updatedPlaylist = yield hashedPassword_1.prisma.playlist.update({
                where: { id: playlistIdNum },
                data: {
                    videos: {
                        connect: { id: videoIdNum },
                    },
                },
                include: {
                    videos: true,
                },
            });
            if (!updatedPlaylist) {
                throw new ApiError_1.ApiError(500, "Error while adding video to the playlist");
            }
            res.status(200).json(updatedPlaylist);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while adding video to the playlist!");
        }
    }),
});
exports.addVideoToPlaylist = addVideoToPlaylist;
const getVideoPlaylist = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { videoId } = req.params;
            if (!videoId || isNaN(Number(videoId))) {
                throw new ApiError_1.ApiError(400, "Invalid video ID");
            }
            const playlists = yield hashedPassword_1.prisma.playlist.findMany({
                where: {
                    ownerId: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId),
                },
                include: {
                    videos: {
                        select: {
                            id: true,
                        },
                    },
                },
            });
            const playlistWithVideoInfo = playlists.map((playlist) => {
                return {
                    name: playlist.name,
                    isVideoPresent: playlist.videos.some((video) => video.id === Number(videoId)),
                };
            });
            res.status(200).json(playlistWithVideoInfo);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting video playlist!");
        }
    }),
});
exports.getVideoPlaylist = getVideoPlaylist;
const getUserPlaylists = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            if (!userId || isNaN(Number(userId))) {
                throw new ApiError_1.ApiError(400, "Invalid user ID");
            }
            const playlists = yield hashedPassword_1.prisma.playlist.findMany({
                where: {
                    ownerId: Number(userId),
                },
                include: {
                    owner: {
                        select: {
                            fullName: true,
                            username: true,
                            avatar: true,
                        },
                    },
                    videos: {
                        where: {
                            isPublished: true,
                        },
                        select: {
                            thumbnail: true,
                            views: true,
                        },
                    },
                },
            });
            const transformed = playlists.map((playlist) => {
                const thumbnails = playlist.videos
                    .map((video) => video.thumbnail)
                    .filter(Boolean);
                const totalViews = playlist.videos.reduce((sum, v) => sum + v.views, 0);
                return {
                    name: playlist.name,
                    description: playlist.description,
                    thumbnail: thumbnails[0] || null,
                    owner: playlist.owner,
                    createdAt: playlist.createdAt,
                    updatedAt: playlist.updatedAt,
                    videosCount: playlist.videos.length,
                    totalViews,
                };
            });
            res.status(200).json(transformed);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting user's playlist!");
        }
    }),
});
exports.getUserPlaylists = getUserPlaylists;
const getPlaylistById = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { playlistId } = req.params;
            if (!playlistId || isNaN(Number(playlistId))) {
                throw new ApiError_1.ApiError(400, "Invalid playlist ID");
            }
            const playlists = yield hashedPassword_1.prisma.playlist.findMany({
                where: {
                    id: Number(playlistId),
                },
                include: {
                    videos: {
                        where: {
                            isPublished: true,
                        },
                    },
                    owner: {
                        select: {
                            username: true,
                            fullName: true,
                            avatar: true,
                        },
                    },
                },
            });
            if (!playlists) {
                throw new ApiError_1.ApiError(500, "No playlist found");
            }
            const transformed = playlists.map((playlist) => {
                const thumbnails = playlist.videos
                    .map((video) => video.thumbnail)
                    .filter(Boolean);
                const totalViews = playlist.videos.reduce((sum, video) => sum + video.views, 0);
                return {
                    name: playlist.name,
                    description: playlist.description,
                    videos: playlist.videos,
                    owner: playlist.owner,
                    thumbnail: thumbnails[0] || null,
                    videosCount: playlist.videos.length,
                    createdAt: playlist.createdAt,
                    updatedAt: playlist.updatedAt,
                    totalViews,
                };
            });
            res.status(200).json(transformed);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting playlist!");
        }
    }),
});
exports.getPlaylistById = getPlaylistById;
const updatePlaylist = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { playlistId } = req.params;
            const { name, description } = req.body;
            if (!playlistId || isNaN(Number(playlistId))) {
                throw new ApiError_1.ApiError(400, "Invalid playlist ID");
            }
            if (!name && !description) {
                throw new ApiError_1.ApiError(400, "At least on of the field is required");
            }
            const playlist = yield hashedPassword_1.prisma.playlist.findUnique({
                where: {
                    id: Number(playlistId),
                },
            });
            if ((playlist === null || playlist === void 0 ? void 0 : playlist.ownerId) !== Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new ApiError_1.ApiError(401, "No permission to update playlist");
            }
            const updatedPlaylist = yield hashedPassword_1.prisma.playlist.update({
                where: {
                    id: playlist.id,
                },
                data: {
                    name: name || playlist.name,
                    description: description || playlist.description,
                },
            });
            res.status(200).json(updatedPlaylist);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while updating playlist!");
        }
    }),
});
exports.updatePlaylist = updatePlaylist;
const removeVideoFromPlaylist = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { playlistId, videoId } = req.params;
            if (!playlistId || isNaN(Number(playlistId))) {
                throw new ApiError_1.ApiError(400, "Invalid playlist ID");
            }
            if (!videoId || isNaN(Number(videoId))) {
                throw new ApiError_1.ApiError(400, "Invalid video ID");
            }
            const playlist = yield hashedPassword_1.prisma.playlist.findUnique({
                where: {
                    id: Number(playlistId),
                },
                select: {
                    videos: true,
                    ownerId: true,
                    name: true,
                    description: true,
                },
            });
            if (!playlist) {
                throw new ApiError_1.ApiError(500, "No playlist found");
            }
            const video = yield hashedPassword_1.prisma.video.findUnique({
                where: {
                    id: Number(videoId),
                },
            });
            if (!video) {
                throw new ApiError_1.ApiError(500, "No video found");
            }
            if (playlist.ownerId !== Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new ApiError_1.ApiError(401, "No permission to remove video from the playlist");
            }
            if (playlist.videos.some((video) => video.id !== Number(videoId))) {
                throw new ApiError_1.ApiError(400, "Vedio not found in the playlist");
            }
            const removeVideo = yield hashedPassword_1.prisma.playlist.update({
                where: {
                    id: Number(playlistId),
                },
                data: {
                    videos: {
                        disconnect: {
                            id: Number(videoId),
                        },
                    },
                },
                include: {
                    videos: true, // return updated playlist with videos
                },
            });
            if (!removeVideo) {
                throw new ApiError_1.ApiError(500, "Something went wrong while removing video from playlist");
            }
            res.status(200).json(removeVideo);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while removing video from the playlist!");
        }
    }),
});
exports.removeVideoFromPlaylist = removeVideoFromPlaylist;
const deletePlaylist = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { playlistId } = req.params;
            if (!playlistId || isNaN(Number(playlistId))) {
                throw new ApiError_1.ApiError(400, "Invalid playlist ID");
            }
            const playlist = yield hashedPassword_1.prisma.playlist.findUnique({
                where: {
                    id: Number(playlistId),
                },
            });
            if (!playlist) {
                throw new ApiError_1.ApiError(500, "No playlist found");
            }
            if (playlist.ownerId !== Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new ApiError_1.ApiError(401, "No permission to delete playlist");
            }
            const delPlaylist = yield hashedPassword_1.prisma.playlist.delete({
                where: {
                    id: playlist.id,
                },
            });
            res.status(200).json(delPlaylist);
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while deleting playlist!");
        }
    }),
});
exports.deletePlaylist = deletePlaylist;
