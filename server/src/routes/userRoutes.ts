import { Router } from "express";
import { upload } from "../middlewares/multer";
import { registerUser } from "../controllers/userController";

const router = Router();

router.post(
  "/",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

export default router;
