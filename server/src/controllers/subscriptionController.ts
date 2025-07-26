import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { prisma } from "../utils/hashedPassword";

const toggleSubscription = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { channelId } = req.params;

      const channelUserId = Number(channelId);
      const currentUserId = Number(req.user?.userId);

      if (!channelUserId) throw new ApiError(400, "Invalid channel ID");
      if (channelUserId === currentUserId)
        throw new ApiError(400, "Cannot subscribe to your own channel");

      const existingSubscription = await prisma.subscription.findUnique({
        where: {
          subscriberId_channelId: {
            subscriberId: currentUserId,
            channelId: channelUserId,
          },
        },
      });

      if (existingSubscription) {
        await prisma.subscription.delete({
          where: {
            id: existingSubscription.id,
          },
        });
      } else {
        await prisma.subscription.create({
          data: {
            subscriberId: currentUserId,
            channelId: channelUserId,
          },
        });
      }

      res.status(200).json({});
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while toggle subscription!"
      );
    }
  },
});

const getUserChannelSubscribers = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { channelId } = req.params;

      const channelUserId = Number(channelId);
      if (!channelUserId) throw new ApiError(400, "Invalid channel ID");

      const subscriptions = await prisma.subscription.findMany({
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

      const subscribers = subscriptions.map((sub) => sub.subscriber);

      res.status(200).json({
        subscribers,
        subscribersCount: subscribers.length,
      });
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting user's channel subscribers!"
      );
    }
  },
});

const getSubscribedChannels = asyncHandler({
  requestHandler: async (req, res) => {
    try {
      const { subscriberId } = req.params;
      const requestingUserId = Number(req.user?.userId);

      const subscriberUserId = Number(subscriberId);
      if (!subscriberUserId) throw new ApiError(400, "Invalid subscriber ID");

      const subscriptions = await prisma.subscription.findMany({
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
          isSubscribed: subscribersList.some(
            (s) => s.subscriberId === requestingUserId
          ),
        };
      });

      res.status(200).json({
        channels,
        channelsCount: channels.length,
      });
    } catch (error: any) {
      throw new ApiError(
        401,
        error?.message || "Error while getting user's subscribed channels!"
      );
    }
  },
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
