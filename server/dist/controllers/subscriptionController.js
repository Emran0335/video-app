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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscribedChannels = exports.getUserChannelSubscribers = exports.toggleSubscription = void 0;
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const hashedPassword_1 = require("../utils/hashedPassword");
const toggleSubscription = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        try {
            const { channelId } = req.params;
            if (!channelId || isNaN(Number(channelId))) {
                throw new ApiError_1.ApiError(400, "Invalid channel ID");
            }
            if (Number(channelId) === Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
                throw new ApiError_1.ApiError(400, "Cannot subscribe own channel");
            }
            const isSubscribed = yield hashedPassword_1.prisma.subscription.findFirst({
                where: {
                    subscriberId: Number((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId),
                    channelId: Number(channelId),
                },
            });
            if (!isSubscribed) {
                throw new ApiError_1.ApiError(500, "Error while getting details of subscription");
            }
            if (isSubscribed) {
                const unsubscribe = yield hashedPassword_1.prisma.subscription.delete({
                    where: {
                        id: isSubscribed.id,
                    },
                });
                if (!unsubscribe) {
                    throw new ApiError_1.ApiError(500, "Error while unsubscribing");
                }
                else {
                    const subscribe = yield hashedPassword_1.prisma.subscription.create({
                        data: {
                            subscriberId: Number((_c = req.user) === null || _c === void 0 ? void 0 : _c.userId),
                            channelId: Number(channelId),
                        },
                    });
                    if (!subscribe) {
                        throw new ApiError_1.ApiError(500, "Error while subscribing");
                    }
                }
            }
            res.status(200).json(new ApiResponse_1.ApiResponse(200, {}, "Subscription toggled"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while toggling subscription!");
        }
    }),
});
exports.toggleSubscription = toggleSubscription;
const getUserChannelSubscribers = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { channelId } = req.params;
            if (!channelId || isNaN(Number(channelId))) {
                throw new ApiError_1.ApiError(400, "Invalid channel ID");
            }
            const subscriptions = yield hashedPassword_1.prisma.subscription.findMany({
                where: {
                    id: Number(channelId),
                },
                select: {
                    id: true,
                    subscriber: {
                        select: {
                            userId: true,
                            username: true,
                            avatar: true,
                            fullName: true,
                        },
                    },
                },
            });
            const transformed = {
                subscribersCount: subscriptions.length,
                subscribers: subscriptions.map((subs) => ({
                    userId: subs.subscriber.userId,
                    username: subs.subscriber.username,
                    avatar: subs.subscriber.avatar,
                    fullName: subs.subscriber.fullName,
                })),
            };
            res
                .status(200)
                .json(new ApiResponse_1.ApiResponse(200, transformed, "Subscribers fetched successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting suscribers!");
        }
    }),
});
exports.getUserChannelSubscribers = getUserChannelSubscribers;
const getSubscribedChannels = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { subscriberId } = req.params;
            if (!subscriberId || isNaN(Number(subscriberId))) {
                throw new ApiError_1.ApiError(400, "No valid subscriber Id found");
            }
            const subscriptions = yield hashedPassword_1.prisma.subscription.findMany({
                where: {
                    subscriberId: Number(subscriberId),
                },
                include: {
                    channel: {
                        select: {
                            userId: true,
                            username: true,
                            fullName: true,
                            avatar: true,
                            subscribers: {
                                select: {
                                    subscriberId: true,
                                },
                            },
                        },
                    },
                },
            });
            const channels = subscriptions.map((sub) => {
                const subscribersList = sub.channel.subscribers || [];
                return {
                    userId: sub.channel.userId,
                    username: sub.channel.username,
                    fullName: sub.channel.fullName,
                    avatar: sub.channel.avatar,
                    subscribersCount: subscribersList.length,
                    isSubscribed: subscribersList.some((s) => { var _a; return s.subscriberId === Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId); }),
                };
            });
            res.status(200).json(new ApiResponse_1.ApiResponse(200, {
                channels,
                channelsCount: channels.length,
            }, "Subscribed channels fetched successfully"));
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting suscribed channels!");
        }
    }),
});
exports.getSubscribedChannels = getSubscribedChannels;
