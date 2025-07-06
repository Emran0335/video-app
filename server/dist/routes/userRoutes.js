"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = require("../middlewares/multer");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post("/register", multer_1.upload.fields([
    {
        name: "avatar",
        maxCount: 1,
    },
    {
        name: "coverImage",
        maxCount: 1,
    },
]), userController_1.registerUser);
router.post("/login", userController_1.loginUser);
router.post("/change-password", auth_1.verifyJWT, userController_1.changeCurrentPassword);
router.patch("/update-account", auth_1.verifyJWT, userController_1.updateAccountDetails);
exports.default = router;
