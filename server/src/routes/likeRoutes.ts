import { Router } from "express";
import { verifyJWT } from "../middlewares/auth";
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/likeController";

const router = Router();

router.get("/like/videos", verifyJWT, getLikedVideos);
router.patch("/toggle/v/:videoId", verifyJWT, toggleVideoLike);
router.patch("/toggle/c/:commentId", verifyJWT, toggleCommentLike);
router.patch("/toggle/t/:tweetId", verifyJWT, toggleTweetLike);

export default router;
