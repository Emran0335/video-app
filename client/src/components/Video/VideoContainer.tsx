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
  console.log("Videos", videos);

  if (!videos || videos.length === 0) {
    return (
      <div className="flex justify-center mt-[30vh]">
        <div className="flex flex-col items-center">
          <Video className="w-20 h-20" />
          <h1>No Videos Available</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden mt-5">
      <div className="flex flex-wrap justify-around">
        {videos?.map((video) => (
          <VideoCard key={video?.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default VideoContainer;
