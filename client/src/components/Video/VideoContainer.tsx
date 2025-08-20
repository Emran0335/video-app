"use client";
import React, { useEffect, useState } from "react";
import { useGetAllVideosQuery, useVideoViewCountMutation } from "@/state/api";
import { Video } from "lucide-react";
import VideoCard from "./VideoCard";
import { icons } from "@/assets/Icons";

const VideoContainer = () => {
  const [page, setPage] = useState(1);
  const { data: videos, isLoading } = useGetAllVideosQuery();

  if (!videos || videos.length === 0) {
    return (
      <div className="flex justify-center mt-[200px]">
        <div className="flex flex-col items-center">
          <Video className="w-20 h-20" />
          <h1>No Videos Available</h1>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center">{icons.loading}</div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))] gap-4">
        {videos?.map((video) => (
          <VideoCard key={video?.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideoContainer;
