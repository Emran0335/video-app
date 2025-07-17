import { Router } from "express";
import {
  createTweet,
  deleteTweet,
  getAllTweets,
  getUserTweets,
  updateTweet,
} from "../controllers/tweetController";
import { verifyJWT } from "../middlewares/auth";
import { openAuth } from "../middlewares/openAuth";

const router = Router();

router.post("/", verifyJWT, createTweet);
router.get("/", openAuth, getAllTweets);
router.get("/user/:userId", openAuth, getUserTweets);
router.patch("/:tweetId", verifyJWT, updateTweet);
router.delete("/:tweetId", verifyJWT, deleteTweet);

export default router;
