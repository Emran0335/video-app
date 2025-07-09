"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../middlewares/multer");
const videoController_1 = require("../controllers/videoController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get("/", videoController_1.getAllVideos);
router.get("/c/:userId", videoController_1.getUserVideos);
router.post("/", multer_1.upload.fields([
    {
        name: "videoFile",
        maxCount: 1,
    },
    {
        name: "thumbnail",
        maxCount: 1,
    },
]), auth_1.verifyJWT, videoController_1.publishAVideo);
exports.default = router;
