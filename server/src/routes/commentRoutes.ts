import { Router } from "express";
import { verifyJWT } from "../middlewares/auth";
import { addComment } from "../controllers/commentController";

const router = Router();

router.post("/:videoId", verifyJWT, addComment);

export default router;