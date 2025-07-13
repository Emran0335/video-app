import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { prisma } from "../utils/hashedPassword";
import { connect } from "http2";

const createTweet = asyncHandler({
  requestHandler: async (req, res) => {
    const { content } = req.body;

    const userId = req.user?.userId;

    if (!content?.trim()) {
      throw new ApiError(400, "Tweet cannot be empty");
    }

    const tweet = await prisma.tweet.create({
      data: {
        content: content,
        ownerId: Number(userId),
      },
    });

    if (!tweet) {
      throw new ApiError(500, "Error while creating tweet");
    }

    res
      .status(201)
      .json(new ApiResponse(201, tweet, "Tweet created successfully"));
  },
});

export { createTweet };
