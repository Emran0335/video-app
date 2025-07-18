"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../middlewares/multer");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middlewares/auth");
const openAuth_1 = require("../middlewares/openAuth");
const router = (0, express_1.Router)();
router.post("/user/register", multer_1.upload.fields([
    {
        name: "avatar",
        maxCount: 1,
    },
    {
        name: "coverImage",
        maxCount: 1,
    },
]), userController_1.registerUser);
router.post("/user/login", userController_1.loginUser);
router.post("/user/logout", auth_1.verifyJWT, userController_1.logoutUser);
router.patch("/user/refresh-token", userController_1.refreshAccessToken);
router.post("/user/change-password", auth_1.verifyJWT, userController_1.changeCurrentPassword);
router.get("/user/current-user", auth_1.verifyJWT, userController_1.getCurrentLoggedInUser);
router.patch("/user/update-account", auth_1.verifyJWT, userController_1.updateAccountDetails);
router.patch("/user/avatar", auth_1.verifyJWT, multer_1.upload.single("avatar"), userController_1.updateUserAvatar);
router.patch("/user/cover-image", auth_1.verifyJWT, multer_1.upload.single("coverImage"), userController_1.updateUserCoverImage);
router.get("/user/channel/:username", openAuth_1.openAuth, userController_1.getUserChannelProfile);
router.get("/user/history", auth_1.verifyJWT, userController_1.getWatchHistory);
exports.default = router;
