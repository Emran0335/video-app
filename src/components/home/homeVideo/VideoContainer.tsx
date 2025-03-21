import React from "react";
import { FaVideo } from "react-icons/fa";
import VideoCard from "./VideoCard";

const VideoContainer = () => {
  const video = true;
  if (video) {
    return (
      <div className="flex justify-center">
        <div className="flex flex-col items-center">
          <FaVideo className="w-20 h-20" />
          <h1>No Videos Available</h1>
        </div>
      </div>
    );
  }
  if (!video) {
    return (
      <div>
        <div>
          <VideoCard />
        </div>
      </div>
    );
  }
};

export default VideoContainer;
