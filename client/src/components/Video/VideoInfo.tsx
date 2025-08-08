"use client";
import { useCallback } from "react";
import { getTimeDistanceToNow } from "@/lib/utils";
import {
  useGetCurrentLoggedInUserQuery,
  useToggleSubscriptionMutation,
  useToggleVideoLikeMutation,
  Video,
} from "@/state/api";
import SignInModal from "../UserModal/SignInModal";
import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";

type videoInfoProps = {
  video: Video;
};

const VideoInfo = ({ video }: videoInfoProps) => {
  const times = getTimeDistanceToNow(video.createdAt);
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [toggleSubscribe] = useToggleSubscriptionMutation();
  const [toggleVideoLike] = useToggleVideoLikeMutation();
  const { currentData: user } = useGetCurrentLoggedInUserQuery();

  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [likesCount, setLikesCount] = useState(video.likesCount);

  const toggleVideoLikeHandler = useCallback(async () => {
    if (user?.userId === video.owner.userId) {
      setIsModalNewTaskOpen(true);
      return;
    } else {
      try {
        await toggleVideoLike({ videoId: video.id }).unwrap();
        setIsLiked((prev) => !prev);
        setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
      } catch (error) {
        console.error("Failed to toggle like:", error);
      }
    }
  }, [
    video.owner.userId,
    video.id,
    user?.userId,
    toggleVideoLike,
    setIsModalNewTaskOpen,
    isLiked,
  ]);

  return (
    <div className="border border-gray-300 rounded-xl px-3 py-2 mt-2 opacity-60">
      <div className="flex justify-between items-center">
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
          <button
            onClick={toggleVideoLikeHandler}
            className={`px-3 border rounded-lg border-gray-400 flex items-center hover:bg-gray-700`}
          >
            <p className="mr-1">{likesCount}</p>
            {isLiked ? <ThumbsUp className="w-5 h-5" /> : <ThumbsDown />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;
