import { Router } from "express";
import { openAuth } from "../middlewares/openAuth";
import {
  getChannelStats,
  getChannelVideos,
} from "../controllers/dashboardController";
import { verifyJWT } from "../middlewares/auth";

const router = Router();

router.get("/videos", verifyJWT, getChannelVideos);
router.get("/stats/:userId", openAuth, getChannelStats);

export default router;
