import { Router } from "express";
import { upload } from "../middlewares/multer";
import {
  registerUser,
  loginUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  logoutUser,
  refreshAccessToken,
  getCurrentLoggedInUser,
  getWatchHistory,
} from "../controllers/userController";
import { verifyJWT } from "../middlewares/auth";
import { openAuth } from "../middlewares/openAuth";

const router = Router();

router.post(
  "/user/register",
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

router.post("/user/login", loginUser);
router.post("/user/logout", verifyJWT, logoutUser);
router.patch("/user/refresh-token", refreshAccessToken);
router.post("/user/change-password", verifyJWT, changeCurrentPassword);
router.get("/user/current-user", verifyJWT, getCurrentLoggedInUser);
router.patch("/user/update-account", verifyJWT, updateAccountDetails);
router.patch(
  "/user/avatar",
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatar
);
router.patch(
  "/user/cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);
router.get("/user/channel/:username", openAuth, getUserChannelProfile);
router.get("/user/history", verifyJWT, getWatchHistory);

export default router;
