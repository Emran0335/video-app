import { Stats, User } from "@/state/api";
import {
  Eye,
  Heart,
  MessageCircle,
  MessageSquareText,
  Plus,
  Users,
  Video,
} from "lucide-react";
import React from "react";
import InfoChannel from "../Channel/InfoChannel";

type ChannelStatsProps = {
  stats?: Stats;
  user?: User;
};

const ChannelStats = ({ stats, user }: ChannelStatsProps) => {
  console.log("Stats", stats);
  return (
    <>
      <div className="flex flex-wrap justify-between">
        <div className="">
          <h1 className="text-2xl font-bold">Welcome back, {user?.fullName}</h1>
          <p className="text-sm text-gray-600">
            Track and manage your channel and videos
          </p>
        </div>
        <div className="">
          {/* video add modal should be opened here? */}
          <button className="inline-flex items-center gap-x-1 bg-gray-200 py-2 px-4 rounded-lg">
            <Plus className="w-5 h-5" />
            Upload Video
          </button>
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(220px,_1fr))] gap-4 mt-4">
        <InfoChannel
          title="Total Videos"
          value={stats?.totalVideos}
          icon={<Video className="h-6 w-6" />}
        />
        <InfoChannel
          title="Total Views"
          value={stats?.totalViews}
          icon={<Eye className="h-6 w-6" />}
        />
        <InfoChannel
          title="Total Subscribers"
          value={stats?.subscribersCount}
          icon={<Users className="h-6 w-6" />}
        />
        <InfoChannel
          title="Total Likes"
          value={stats?.totalLikes}
          icon={<Heart className="h-6 w-6" />}
        />
        <InfoChannel
          title="Total Comments"
          value={stats?.totalComments}
          icon={<MessageCircle className="h-6 w-6" />}
        />
        <InfoChannel
          title="Total Tweets"
          value={stats?.totalTweets}
          icon={<MessageSquareText className="h-6 w-6" />}
        />
      </div>
    </>
  );
};

export default ChannelStats;
