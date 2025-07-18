"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../middlewares/multer");
const videoController_1 = require("../controllers/videoController");
const auth_1 = require("../middlewares/auth");
const openAuth_1 = require("../middlewares/openAuth");
const router = (0, express_1.Router)();
router.get("/", videoController_1.getAllVideos);
router.get("/video/:userId", videoController_1.getUserVideos);
router.get("/video/:videoId", openAuth_1.openAuth, videoController_1.getVideoById);
router.post("/video", multer_1.upload.fields([
    {
        name: "videoFile",
        maxCount: 1,
    },
    {
        name: "thumbnail",
        maxCount: 1,
    },
]), auth_1.verifyJWT, videoController_1.publishAVideo);
router.patch("/video/:videoId", auth_1.verifyJWT, multer_1.upload.single("thumbnail"), videoController_1.updateVideo);
router.delete("/video/:videoId", auth_1.verifyJWT, videoController_1.deleteVideo);
router.patch("/video/toggle/:videoId", auth_1.verifyJWT, videoController_1.togglePublishStatus);
router.get("/video/subscriptions", auth_1.verifyJWT, videoController_1.getSubscribedVideos);
exports.default = router;
