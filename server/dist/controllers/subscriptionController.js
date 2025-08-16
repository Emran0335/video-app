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
const asyncHandler_1 = require("../utils/asyncHandler");
const hashedPassword_1 = require("../utils/hashedPassword");
const toggleSubscription = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            //channelId-> video.ownerId(Who is the owner of the video and the channel)
            const { channelId } = req.params;
            const channelUserId = Number(channelId);
            const currentUserId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
            if (!channelUserId)
                throw new ApiError_1.ApiError(400, "Invalid channel ID");
            if (channelUserId === currentUserId)
                throw new ApiError_1.ApiError(400, "Cannot subscribe to your own channel");
            const channelExists = yield hashedPassword_1.prisma.user.findUnique({
                where: { userId: channelUserId },
            });
            if (!channelExists)
                throw new ApiError_1.ApiError(404, "Channel not found");
            const existingSubscription = yield hashedPassword_1.prisma.subscription.findFirst({
                where: {
                    subscriberId: currentUserId,
                    channelId: channelUserId,
                },
            });
            if (existingSubscription) {
                yield hashedPassword_1.prisma.subscription.delete({
                    where: { id: existingSubscription.id },
                });
                res.status(200).json({
                    subscribed: false,
                    message: "Unsubscribed successfully",
                });
            }
            else {
                yield hashedPassword_1.prisma.subscription.create({
                    data: { subscriberId: currentUserId, channelId: channelUserId },
                });
                res.status(200).json({
                    subscribed: true,
                    message: "Subscribed successfully",
                });
            }
        }
        catch (error) {
            throw new ApiError_1.ApiError(error.statusCode || 500, error.message || "Error while toggling subscription!");
        }
    }),
});
exports.toggleSubscription = toggleSubscription;
const getUserChannelSubscribers = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // channelId-> video.ownerId(Who is the owner of the video and the channel)
            const { channelId } = req.params;
            const channelUserId = Number(channelId);
            if (!channelUserId)
                throw new ApiError_1.ApiError(400, "Invalid channel ID");
            const subscriptions = yield hashedPassword_1.prisma.subscription.findMany({
                where: { channelId: channelUserId },
                include: {
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
            const subscribers = subscriptions.map((sub) => sub.subscriber.userId);
            res.status(200).json({
                subscribers,
                subscribersCount: subscribers.length,
            });
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting user's channel subscribers!");
        }
    }),
});
exports.getUserChannelSubscribers = getUserChannelSubscribers;
const getSubscribedChannels = (0, asyncHandler_1.asyncHandler)({
    requestHandler: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { subscriberId } = req.params;
            const requestingUserId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId);
            const subscriberUserId = Number(subscriberId);
            if (!subscriberUserId)
                throw new ApiError_1.ApiError(400, "Invalid subscriber ID");
            const subscriptions = yield hashedPassword_1.prisma.subscription.findMany({
                where: {
                    subscriberId: subscriberUserId,
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
                const channel = sub.channel;
                const subscribersList = channel.subscribers;
                return {
                    userId: channel.userId,
                    username: channel.username,
                    fullName: channel.fullName,
                    avatar: channel.avatar,
                    subscribersCount: subscribersList.length,
                    isSubscribed: subscribersList.some((s) => s.subscriberId === requestingUserId),
                };
            });
            res.status(200).json({
                channels,
                channelsCount: channels.length,
            });
        }
        catch (error) {
            throw new ApiError_1.ApiError(401, (error === null || error === void 0 ? void 0 : error.message) || "Error while getting user's subscribed channels!");
        }
    }),
});
exports.getSubscribedChannels = getSubscribedChannels;
