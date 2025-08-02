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
router.post("/toggle/v/:videoId", verifyJWT, toggleVideoLike);
router.post("/toggle/c/:commentId", verifyJWT, toggleCommentLike);
router.post("/toggle/t/:tweetId", verifyJWT, toggleTweetLike);

export default router;
