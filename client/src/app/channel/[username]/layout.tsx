import React from "react";
import Channel from "@/components/UserChannel/Channel";

export default async function ChannelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  return <Channel username={username}>{children}</Channel>;
}
