import { Router } from "express";
import { verifyJWT } from "../middlewares/auth";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/commentController";

const router = Router();

router.post("/comment/:videoId", verifyJWT, addComment);
router.get("/comment/:videoId", verifyJWT, getVideoComments);
router.patch("/c/:commentId", verifyJWT, updateComment);
router.delete("/c/:commentId", verifyJWT, deleteComment);

export default router;
