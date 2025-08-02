import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../utils/hashedPassword";

const addComment = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { content } = req.body;
      const { videoId } = req.params;

      if (!content?.trim()) {
        throw new ApiError(400, "Comment cannot be empty!");
      }

      if (!videoId) {
        throw new ApiError(400, "Invalid video ID");
      }

      const comment = await prisma.comment.create({
        data: {
          content: content,
          video: Number(videoId),
          owner: Number(req.user?.userId),
        },
      });

      if (!comment) {
        throw new ApiError(500, "Error while creating comment");
      }

      res.status(201).json(comment);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while creating comment!"
      );
    }
  },
});

const getVideoComments = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { videoId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!videoId) {
        throw new ApiError(400, "Video ID not found");
      }

      const comments = await prisma.comment.findMany({
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
        throw new ApiError(500, "Comments not found!");
      }

      const getComments = comments.map((comment) => {
        const comments = comment.likes;

        return {
          id: comment.id,
          owner: comment.ownerId,
          content: comment.content,
          likesCount: comments.length,
          isLiked: Number(req.user?.userId)
            ? comments.some(
                (comment) => comment.likedBy?.userId === Number(req.user?.userId)
              )
            : false,
        };
      });

      res.status(200).json(getComments);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while fetching comments!"
      );
    }
  },
});

const updateComment = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { content } = req.body;
      const { commentId } = req.params;

      if (!content.trim()) {
        throw new ApiError(400, "Comment content not found");
      }

      if (!commentId) {
        throw new ApiError(400, "Invalid comment ID");
      }

      const comment = await prisma.comment.findUnique({
        where: {
          id: Number(commentId),
        },
      });

      if (!comment) {
        throw new ApiError(500, "Comment not found");
      }

      if (comment.owner !== Number(req.user?.userId)) {
        throw new ApiError(401, "No permission to update comment");
      }

      const updateComment = await prisma.comment.update({
        where: {
          id: Number(commentId),
        },
        data: {
          content: content,
        },
      });

      if (!updateComment) {
        throw new ApiError(400, "Error while updating comment");
      }

      res.status(200).json(updateComment);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while fetching comments!"
      );
    }
  },
});

const deleteComment = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { commentId } = req.params;

      if (!commentId) {
        throw new ApiError(400, "Invalid comment ID");
      }

      const comment = await prisma.comment.findUnique({
        where: {
          id: Number(commentId),
        },
      });

      if (!comment) {
        throw new ApiError(500, "No comment found");
      }

      if (comment.owner !== Number(req.user?.userId)) {
        throw new ApiError(401, "No permission to delete comment");
      }

      const deletedComment = await prisma.comment.delete({
        where: {
          id: comment.id,
        },
      });

      res.status(200).json(deletedComment);
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while fetching comments!"
      );
    }
  },
});

export { addComment, getVideoComments, updateComment, deleteComment };
