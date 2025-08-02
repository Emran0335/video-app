"use client";
import React, { useState } from "react";
import { useGetAllVideosQuery } from "@/state/api";
import { Video } from "lucide-react";
import VideoCard from "./VideoCard";

const VideoContainer = () => {
  const [page, setPage] = useState(1);

  const { data: videos } = useGetAllVideosQuery({
    page: page,
    limit: 20,
  });

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

  return (
    <div>
      <div className="flex flex-wrap gap-2 py-4 px-4">
        {videos?.map((video) => (
          <VideoCard key={video?.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideoContainer;
