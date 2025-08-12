"use client";
import { Video } from "@/state/api";
import React, { useState } from "react";
import { Search } from "lucide-react";
import DashboardVideoCard from "./DashboardVideoCard";

type VideoPanelProps = {
  videos: Video[] | undefined;
};

const VideoPanel = ({ videos }: VideoPanelProps) => {
  const [filter, setFilter] = useState<Video[] | undefined>();

  function handleUserInput(input: string) {
    if (!input || input === "") setFilter(videos);
    else {
      const filteredData = videos?.filter((video) =>
        video.title.toLowerCase().startsWith(input.toLowerCase().trim())
      );
      setFilter(filteredData);
    }
  }

  const allVideos = filter || videos;
  return (
    <>
      <div className="relative w-[400px] mt-16 mx-auto rounded-full bg-zinc-200 border py-1 pl-8 pr-3 overflow-hidden">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400">
          <Search />
        </span>
        <input
          onChange={(e) => handleUserInput(e.target.value)}
          className="w-full bg-transparent outline-none"
          placeholder="Search"
        />
      </div>

      <div className="w-full mt-8 overflow-auto">
        <table className="w-full min-w-[1000px] border-collapse border text-gray-800">
          <thead className="">
            <tr>
              <th className="border-collapse border-b p-4">Toggle</th>
              <th className="border-collapse border-b p-4">Status</th>
              <th className="border-collapse border-b p-4">Video</th>
              <th className="border-collapse border-b p-4">Date Uploaded</th>
              <th className="border-collapse border-b p-4">Views</th>
              <th className="border-collapse border-b p-4">Comments</th>
              <th className="border-collapse border-b p-4">Likes</th>
              <th className="border-collapse border-b p-4">Options</th>
            </tr>
          </thead>
          <tbody>
            {allVideos?.map((video) => (
              <DashboardVideoCard key={video.id} video={video} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default VideoPanel;
