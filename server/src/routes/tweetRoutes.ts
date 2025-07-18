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

router.post("/tweet/", verifyJWT, createTweet);
router.get("/", openAuth, getAllTweets);
router.get("/tweet/user/:userId", openAuth, getUserTweets);
router.patch("/tweet/:tweetId", verifyJWT, updateTweet);
router.delete("/tweet/:tweetId", verifyJWT, deleteTweet);

export default router;
