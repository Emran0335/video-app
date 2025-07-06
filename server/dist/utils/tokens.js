"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = void 0;
// utils/tokens.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateAccessToken = (user) => {
    const tokenAccess = process.env.ACCESS_TOKEN_SECRET;
    if (!tokenAccess) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign({
        id: user.userId.toString(),
        email: user.email,
        username: user.username,
        fullName: user.fullName,
    }, tokenAccess, { expiresIn: "1d" });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (user) => {
    const tokenRefresh = process.env.REFRESH_TOKEN_SECRET;
    if (!tokenRefresh) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign({ id: user.userId.toString() }, tokenRefresh, {
        expiresIn: "10d",
    });
};
exports.generateRefreshToken = generateRefreshToken;
