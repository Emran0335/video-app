"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tweetController_1 = require("../controllers/tweetController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post("/", auth_1.verifyJWT, tweetController_1.createTweet);
exports.default = router;
