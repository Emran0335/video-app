import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../utils/hashedPassword";

const toggleSubscription = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { channelId } = req.params;

      if (!channelId || isNaN(Number(channelId))) {
        throw new ApiError(400, "Invalid channel ID");
      }

      if (Number(channelId) === Number(req.user?.userId)) {
        throw new ApiError(400, "Cannot subscribe own channel");
      }

      const isSubscribed = await prisma.subscription.findFirst({
        where: {
          subscriberId: Number(req.user?.userId),
          channelId: Number(channelId),
        },
      });

      if (!isSubscribed) {
        throw new ApiError(500, "Error while getting details of subscription");
      }

      if (isSubscribed) {
        const unsubscribe = await prisma.subscription.delete({
          where: {
            id: isSubscribed.id,
          },
        });

        if (!unsubscribe) {
          throw new ApiError(500, "Error while unsubscribing");
        } else {
          const subscribe = await prisma.subscription.create({
            data: {
              subscriberId: Number(req.user?.userId),
              channelId: Number(channelId),
            },
          });

          if (!subscribe) {
            throw new ApiError(500, "Error while subscribing");
          }
        }
      }

      res.status(200).json(new ApiResponse(200, {}, "Subscription toggled"));
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while toggling subscription!"
      );
    }
  },
});

const getUserChannelSubscribers = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { channelId } = req.params;

      if (!channelId || isNaN(Number(channelId))) {
        throw new ApiError(400, "Invalid channel ID");
      }

      const subscriptions = await prisma.subscription.findMany({
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
        .json(
          new ApiResponse(200, transformed, "Subscribers fetched successfully")
        );
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting suscribers!"
      );
    }
  },
});

const getSubscribedChannels = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { subscriberId } = req.params;

      if (!subscriberId || isNaN(Number(subscriberId))) {
        throw new ApiError(400, "No valid subscriber Id found");
      }

      const subscriptions = await prisma.subscription.findMany({
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
          isSubscribed: subscribersList.some(
            (s) => s.subscriberId === Number(req.user?.userId)
          ),
        };
      });

      res.status(200).json(
        new ApiResponse(
          200,
          {
            channels,
            channelsCount: channels.length,
          },
          "Subscribed channels fetched successfully"
        )
      );
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting suscribed channels!"
      );
    }
  },
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
