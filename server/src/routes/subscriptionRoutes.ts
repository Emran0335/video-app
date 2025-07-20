import { Router } from "express";
import { verifyJWT } from "../middlewares/auth";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscriptionController";
import { openAuth } from "../middlewares/openAuth";

const router = Router();

router.get("/c/:channelId", verifyJWT, getUserChannelSubscribers);
router.post("/c/:channelId", verifyJWT, toggleSubscription);

router.get("/u/:subscriberId", openAuth, getSubscribedChannels);

export default router;
