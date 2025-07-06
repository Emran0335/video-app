import { Router } from "express";
import { upload } from "../middlewares/multer";
import { registerUser, loginUser } from "../controllers/userController";

const router = Router();

router.post(
  "/register",
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

router.post("/login", loginUser);

export default router;
