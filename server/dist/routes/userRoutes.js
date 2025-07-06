"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../middlewares/multer");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
router.post("/", multer_1.upload.fields([
    {
        name: "avatar",
        maxCount: 1,
    },
    {
        name: "coverImage",
        maxCount: 1,
    },
]), userController_1.registerUser);
exports.default = router;
