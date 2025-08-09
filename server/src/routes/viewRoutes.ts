import { Router } from "express";
import { verifyJWT } from "../middlewares/auth";
import { viewVideoCount } from "../controllers/viewController";

const router = Router();

router.patch("/view/video/:videoId", verifyJWT, viewVideoCount);

export default router;
