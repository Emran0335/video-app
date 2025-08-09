import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../utils/hashedPassword";

const viewVideoCount = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { videoId } = req.params;
      if (!videoId) {
        throw new ApiError(404, "Invalid Video ID");
      }

      const recentView = await prisma.view.findFirst({
        where: {
          videoId: Number(videoId),
          userId: Number(req.user?.userId),
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (!recentView) {
        await prisma.video.update({
          where: { id: Number(videoId) },
          data: { views: { increment: 1 } },
        });

        await prisma.view.create({
          data: {
            videoId: Number(videoId),
            userId: Number(req.user?.userId),
            createdAt: new Date(),
          },
        });
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      throw new ApiError(
        error.statusCode || 500,
        error.message || "Error while deleting video"
      );
    }
  },
});

export { viewVideoCount };
