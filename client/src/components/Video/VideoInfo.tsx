"use client";
import { useCallback, useEffect } from "react";
import { getTimeDistanceToNow } from "@/lib/utils";
import {
  useGetCurrentLoggedInUserQuery,
  useToggleSubscriptionMutation,
  useToggleVideoLikeMutation,
  useVideoViewCountMutation,
  Video,
} from "@/state/api";
import SignInModal from "../UserModal/SignInModal";
import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Modal from "../Modal";

type videoInfoProps = {
  video: Video;
};

const VideoInfo = ({ video }: videoInfoProps) => {
  const times = getTimeDistanceToNow(video.createdAt);
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [toggleSubscribe] = useToggleSubscriptionMutation();
  const [toggleVideoLike] = useToggleVideoLikeMutation();
  const { currentData: user } = useGetCurrentLoggedInUserQuery();

  const router = useRouter();

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

  const moveToChannelUser = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push(`/channel/${video.owner.username}`);
  };

  return (
    <div className="border border-gray-300 rounded-xl px-3 py-2 mt-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center justify-between">
          <button className="mt-1 cursor-pointer" onClick={moveToChannelUser}>
            <div className="w-[48px] h-[48px] rounded-full border-2 border-gray-200 overflow-hidden">
              <Image
                src={video.owner.avatar as string}
                alt={video.owner.fullName as string}
                width={40}
                height={40}
                className="object-cover"
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          </button>
          <div className="">
            <h1 className="text-[1.3rem] font-semibold">{video.title}</h1>
            <p className="text-[0.9rem] text-gray-800">{`${video.views} views * ${times}`}</p>
          </div>
        </div>
        <div className="">
          {isModalNewTaskOpen && (
            <Modal
              isOpen={isModalNewTaskOpen}
              onClose={() => setIsModalNewTaskOpen(false)}
              name="Please sign in to like"
            >
              <SignInModal
                isOpen={isModalNewTaskOpen}
                onClose={() => setIsModalNewTaskOpen(false)}
                id={video.id}
              />
            </Modal>
          )}
          <button
            onClick={toggleVideoLikeHandler}
            className={`px-3 border rounded-lg border-gray-400 flex items-center hover:bg-gray-400 hover:text-white`}
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
