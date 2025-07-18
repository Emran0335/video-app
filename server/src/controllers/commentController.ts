import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
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

      res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment creating successfully"));
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while creating comment!"
      );
    }
  },
});

export { addComment };
