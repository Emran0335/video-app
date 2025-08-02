"use client";
import { getTimeDistanceToNow } from "@/lib/utils";
import { Video } from "@/state/api";
import SignInModal from "../UserModal/SignInModal";
import { useState } from "react";
import { Plus } from "lucide-react";

type videoInfoProps = {
  video: Video;
  showVideoDescription: string;
};

const VideoInfo = ({ video, showVideoDescription }: videoInfoProps) => {
  const times = getTimeDistanceToNow(video.createdAt);
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  
  const toggleVideoLike = () => {
    setIsModalNewTaskOpen((prev)=> !prev)
  };
  return (
    <div className="border border-gray-300 rounded-xl px-3 py-2 mt-2 opacity-60">
      <div className="flex justify-between">
        <div className="">
          <h1 className="text-[1.3rem] font-semibold">{video.title}</h1>
          <p className="text-[0.9rem] text-gray-800">{`${video.views} views * ${times}`}</p>
        </div>
        <div className="">
            {isModalNewTaskOpen && (
              <SignInModal
                isOpen={isModalNewTaskOpen}
                onClose={() => setIsModalNewTaskOpen(false)}
                id={video.id}
              />
            )}
            <button onClick={toggleVideoLike}>
              <p className="">{}</p>
            </button>
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;
