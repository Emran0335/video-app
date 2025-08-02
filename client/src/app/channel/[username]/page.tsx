"use client";
import GuestChannel from "@/components/GuestChannel/GuestChannel";
import Channel from "@/components/UserChannel/Channel";
import { useParams } from "next/navigation";
import React from "react";

const ChannelPage = () => {
  const params = useParams();
  const username = params.username as string | undefined;

  if (!username) {
    return <GuestChannel />;
  }

  return <Channel username={username} />;
};

export default ChannelPage;
