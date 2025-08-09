"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const viewController_1 = require("../controllers/viewController");
const router = (0, express_1.Router)();
router.patch("/view/video/:videoId", auth_1.verifyJWT, viewController_1.viewVideoCount);
exports.default = router;
