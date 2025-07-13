import { Router } from "express";
import { createTweet } from "../controllers/tweetController";
import { verifyJWT } from "../middlewares/auth";

const router = Router();

router.post("/", verifyJWT, createTweet);

export default router;
