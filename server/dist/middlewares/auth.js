"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = void 0;
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hashedPassword_1 = require("../utils/hashedPassword");
exports.verifyJWT = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET || "";
        try {
            const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) ||
                ((_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
            if (!token) {
                throw new ApiError_1.ApiError(401, "Unauthorized request");
            }
            jsonwebtoken_1.default.verify(token, accessTokenSecret, (err, decodedToken) => __awaiter(void 0, void 0, void 0, function* () {
                if (err) {
                    if (err.name === "TokenExpiredError") {
                        return next(new ApiError_1.ApiError(401, "TokenExpiredError"));
                    }
                    return next(new ApiError_1.ApiError(401, "Invalid access token"));
                }
                // decodedToken { id: '1', iat: 1751957369, exp: 1752821369 }
                const user = yield hashedPassword_1.prisma.user.findUnique({
                    where: {
                        userId: Number(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.id),
                    },
                    select: {
                        userId: true,
                        username: true,
                        email: true,
                        fullName: true,
                        avatar: true,
                        coverImage: true,
                        description: true,
                        watchHistory: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
                if (!user) {
                    throw new ApiError_1.ApiError(401, "Invalid Access Token");
                }
                req.user = user;
                next();
            }));
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Invalid access token");
        }
    }),
});
