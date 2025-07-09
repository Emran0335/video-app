import { Router } from "express";
import { upload } from "../middlewares/multer";
import {
  getAllVideos,
  getUserVideos,
  publishAVideo,
} from "../controllers/videoController";
import { verifyJWT } from "../middlewares/auth";

const router = Router();

router.get("/", getAllVideos);
router.get("/c/:userId", getUserVideos);

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

export default router;
