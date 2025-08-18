"use client";
import { icons } from "@/assets/Icons";
import ChannelStats from "@/components/Dashboard/ChannelStats";
import VideoPanel from "@/components/Dashboard/VideoPanel";
import {
  useGetChannelStatsQuery,
  useGetChannelVideosQuery,
  useGetCurrentLoggedInUserQuery,
} from "@/state/api";
import React from "react";

const DashboardPage = () => {
  const { data: user } = useGetCurrentLoggedInUserQuery();
  const { data: stats } = useGetChannelStatsQuery(
    {
      userId: Number(user?.userId),
    },
    { skip: !user?.userId }
  );
  const { data: videos } = useGetChannelVideosQuery();

  if (!user) {
    <div>{icons.loading}</div>;
  }
  return (
    <div className="w-full mx-auto md:w-6xl">
      <ChannelStats stats={stats} user={user}/>
      <VideoPanel videos={videos} />
    </div>
  );
};

export default DashboardPage;
