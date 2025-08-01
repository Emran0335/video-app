import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../utils/hashedPassword";

const createPlaylist = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        throw new ApiError(400, "Name is required!");
      }

      if (!description) {
        throw new ApiError(400, "Description is required!");
      }

      const playlist = await prisma.playlist.create({
        data: {
          name,
          description: description || "",
          ownerId: Number(req.user?.userId),
        },
      });

      if (!playlist) {
        throw new ApiError(500, "Error while creating playlist");
      }

      res.status(201).json(playlist);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting all tweet!"
      );
    }
  },
});

const addVideoToPlaylist = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { playlistId, videoId } = req.params;

      const playlistIdNum = Number(playlistId);
      const videoIdNum = Number(videoId);
      const userId = Number(req.user?.userId);

      // Validate numeric IDs
      if (isNaN(playlistIdNum) || isNaN(videoIdNum)) {
        throw new ApiError(400, "Invalid playlist or video ID");
      }

      // Check playlist existence
      const playlist = await prisma.playlist.findUnique({
        where: { id: playlistIdNum },
        include: {
          videos: {
            select: { id: true },
          },
        },
      });

      if (!playlist) {
        throw new ApiError(400, "Playlist not found");
      }

      // Check video existence
      const video = await prisma.video.findUnique({
        where: { id: videoIdNum },
      });

      if (!video) {
        throw new ApiError(400, "Video not found");
      }

      // Permission check
      if (playlist.ownerId !== userId) {
        throw new ApiError(
          401,
          "You do not have the permission to add a video to this playlist"
        );
      }

      // Check if video is already in the playlist
      const isAlreadyAdded = playlist.videos.some((v) => v.id === videoIdNum);
      if (isAlreadyAdded) {
        throw new ApiError(400, "Video already in the playlist");
      }

      // Add video to playlist
      const updatedPlaylist = await prisma.playlist.update({
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
        throw new ApiError(500, "Error while adding video to the playlist");
      }

      res.status(200).json(updatedPlaylist);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while adding video to the playlist!"
      );
    }
  },
});

const getVideoPlaylist = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { videoId } = req.params;

      if (!videoId || isNaN(Number(videoId))) {
        throw new ApiError(400, "Invalid video ID");
      }

      const playlists = await prisma.playlist.findMany({
        where: {
          ownerId: Number(req.user?.userId),
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
          isVideoPresent: playlist.videos.some(
            (video) => video.id === Number(videoId)
          ),
        };
      });

      res.status(200).json(playlistWithVideoInfo);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting video playlist!"
      );
    }
  },
});

const getUserPlaylists = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(Number(userId))) {
        throw new ApiError(400, "Invalid user ID");
      }

      const playlists = await prisma.playlist.findMany({
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
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting user's playlist!"
      );
    }
  },
});

const getPlaylistById = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { playlistId } = req.params;

      if (!playlistId || isNaN(Number(playlistId))) {
        throw new ApiError(400, "Invalid playlist ID");
      }

      const playlists = await prisma.playlist.findMany({
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
        throw new ApiError(500, "No playlist found");
      }

      const transformed = playlists.map((playlist) => {
        const thumbnails = playlist.videos
          .map((video) => video.thumbnail)
          .filter(Boolean);
        const totalViews = playlist.videos.reduce(
          (sum, video) => sum + video.views,
          0
        );

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
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting playlist!"
      );
    }
  },
});

const updatePlaylist = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { playlistId } = req.params;
      const { name, description } = req.body;

      if (!playlistId || isNaN(Number(playlistId))) {
        throw new ApiError(400, "Invalid playlist ID");
      }

      if (!name && !description) {
        throw new ApiError(400, "At least on of the field is required");
      }

      const playlist = await prisma.playlist.findUnique({
        where: {
          id: Number(playlistId),
        },
      });

      if (playlist?.ownerId !== Number(req.user?.userId)) {
        throw new ApiError(401, "No permission to update playlist");
      }

      const updatedPlaylist = await prisma.playlist.update({
        where: {
          id: playlist.id,
        },
        data: {
          name: name || playlist.name,
          description: description || playlist.description,
        },
      });

      res.status(200).json(updatedPlaylist);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while updating playlist!"
      );
    }
  },
});

const removeVideoFromPlaylist = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { playlistId, videoId } = req.params;

      if (!playlistId || isNaN(Number(playlistId))) {
        throw new ApiError(400, "Invalid playlist ID");
      }

      if (!videoId || isNaN(Number(videoId))) {
        throw new ApiError(400, "Invalid video ID");
      }

      const playlist = await prisma.playlist.findUnique({
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
        throw new ApiError(500, "No playlist found");
      }

      const video = await prisma.video.findUnique({
        where: {
          id: Number(videoId),
        },
      });

      if (!video) {
        throw new ApiError(500, "No video found");
      }

      if (playlist.ownerId !== Number(req.user?.userId)) {
        throw new ApiError(
          401,
          "No permission to remove video from the playlist"
        );
      }

      if (playlist.videos.some((video) => video.id !== Number(videoId))) {
        throw new ApiError(400, "Vedio not found in the playlist");
      }

      const removeVideo = await prisma.playlist.update({
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
        throw new ApiError(
          500,
          "Something went wrong while removing video from playlist"
        );
      }

      res.status(200).json(removeVideo);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while removing video from the playlist!"
      );
    }
  },
});

const deletePlaylist = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { playlistId } = req.params;

      if (!playlistId || isNaN(Number(playlistId))) {
        throw new ApiError(400, "Invalid playlist ID");
      }

      const playlist = await prisma.playlist.findUnique({
        where: {
          id: Number(playlistId),
        },
      });

      if (!playlist) {
        throw new ApiError(500, "No playlist found");
      }

      if (playlist.ownerId !== Number(req.user?.userId)) {
        throw new ApiError(401, "No permission to delete playlist");
      }

      const delPlaylist = await prisma.playlist.delete({
        where: {
          id: playlist.id,
        },
      });

      res.status(200).json(delPlaylist);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while deleting playlist!"
      );
    }
  },
});

export {
  createPlaylist,
  addVideoToPlaylist,
  getVideoPlaylist,
  getUserPlaylists,
  getPlaylistById,
  updatePlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
};
