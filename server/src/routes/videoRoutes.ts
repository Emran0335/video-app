import { Router } from "express";
import { upload } from "../middlewares/multer";
import {
  deleteVideo,
  getAllVideos,
  getSubscribedVideos,
  getUserVideos,
  getVideoById,
  publishAVideo,
  toggleVideoPublishStatus,
  updateVideo,
} from "../controllers/videoController";
import { verifyJWT } from "../middlewares/auth";
import { openAuth } from "../middlewares/openAuth";

const router = Router();

router.get("/", getAllVideos);
router.get("/video/user/:userId", getUserVideos);
router.get("/video/:videoId", openAuth, getVideoById);

router.post(
  "/video",
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  verifyJWT,
  publishAVideo
);

router.patch(
  "/video/:videoId",
  verifyJWT,
  upload.single("thumbnail"),
  updateVideo
);
router.delete("/video/:videoId", verifyJWT, deleteVideo);
router.patch("/video/toggle/:videoId", verifyJWT, toggleVideoPublishStatus);
router.get("/video/subscriptions", verifyJWT, getSubscribedVideos);

export default router;
