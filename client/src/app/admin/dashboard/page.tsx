"use client";
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
  const { data: stats } = useGetChannelStatsQuery({
    userId: Number(user?.userId),
  });
  console.log("stats", stats);
  const { data: videos } = useGetChannelVideosQuery();

  return (
    <div className="w-full mx-auto md:w-6xl">
      <ChannelStats stats={stats} />
      <VideoPanel videos={videos} />
    </div>
  );
};

export default DashboardPage;
