import { Router } from "express";
import { upload } from "../middlewares/multer";
import {
  deleteVideo,
  getAllVideos,
  getSubscribedVideos,
  getUserVideos,
  getVideoById,
  publishAVideo,
  togglePublishStatus,
  updateVideo,
} from "../controllers/videoController";
import { verifyJWT } from "../middlewares/auth";
import { openAuth } from "../middlewares/openAuth";

const router = Router();

router.get("/", getAllVideos);
router.get("/video/:userId", getUserVideos);
router.get("/:videoId", openAuth, getVideoById);

router.post(
  "/",
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

router.patch("/:videoId", verifyJWT, upload.single("thumbnail"), updateVideo);
router.delete("/:videoId", verifyJWT, deleteVideo);
router.patch("/toggle/:videoId", verifyJWT, togglePublishStatus);
router.get("/video/subscriptions",verifyJWT, getSubscribedVideos);

export default router;
