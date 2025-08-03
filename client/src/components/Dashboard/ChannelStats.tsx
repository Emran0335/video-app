import { Stats } from "@/state/api";
import React from "react";

type ChannelStatsProps = {
  stats: Stats[] | undefined;
};

const ChannelStats = ({ stats }: ChannelStatsProps) => {
  return <div>{stats?.map((stat)=> stat.totalVideos)}</div>;
};

export default ChannelStats;
