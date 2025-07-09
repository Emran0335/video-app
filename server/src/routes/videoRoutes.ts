import { Router } from "express";
import { upload } from "../middlewares/multer";
import {
  getAllVideos,
  getUserVideos,
  getVideoById,
  publishAVideo,
  updateVideo,
} from "../controllers/videoController";
import { verifyJWT } from "../middlewares/auth";
import { openAuth } from "../middlewares/openAuth";

const router = Router();

router.get("/", getAllVideos);
router.get("/c/:userId", getUserVideos);
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

export default router;
