import { Stats, User } from "@/state/api";
import React from "react";

type ChannelStatsProps = {
  stats?: Stats;
  user?: User
};

const ChannelStats = ({ stats, user }: ChannelStatsProps) => {
  return <div>
    <div className="">
      <h1>{user?.fullName}</h1>
    </div>
    
  </div>;
};

export default ChannelStats;
