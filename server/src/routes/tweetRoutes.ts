import { Router } from "express";
import { createTweet, getAllTweets } from "../controllers/tweetController";
import { verifyJWT } from "../middlewares/auth";
import { openAuth } from "../middlewares/openAuth";

const router = Router();

router.post("/", verifyJWT, createTweet);
router.get("/", openAuth, getAllTweets);

export default router;
