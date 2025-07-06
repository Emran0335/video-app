import { Router } from "express";
import { upload } from "../middlewares/multer";
import {
  registerUser,
  loginUser,
  changeCurrentPassword,
  updateAccountDetails,
} from "../controllers/userController";
import { verifyJWT } from "../middlewares/auth";

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
router.post("/change-password", verifyJWT, changeCurrentPassword);
router.patch("/update-account", verifyJWT, updateAccountDetails);

export default router;
