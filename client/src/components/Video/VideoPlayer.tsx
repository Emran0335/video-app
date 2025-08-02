import React from "react";

type VideoPlayerProps = {
  videoFile: string;
};

const VideoPlayer = ({ videoFile }: VideoPlayerProps) => {
  return (
    <video
      className="rounded-xl p-4 w-full max-h-[70vh] border border-gray-200"
      controls
      autoPlay
    >
      <source src={videoFile} type="video/mp4" />
    </video>
  );
};

export default VideoPlayer;
