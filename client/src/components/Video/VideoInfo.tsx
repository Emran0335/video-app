"use client";
import {
  useGetCurrentLoggedInUserQuery,
  useGetUserChannelSubscribersQuery,
  useToggleSubscriptionMutation,
  useToggleVideoLikeMutation,
  Video,
} from "@/state/api";
import SignInModal from "../UserModal/SignInModal";
import { useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Modal from "../Modal";
import { toast } from "react-toastify";

type VideoInfoProps = {
  video: Video;
};

const VideoInfo = ({ video }: VideoInfoProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [toggleSubscribe] = useToggleSubscriptionMutation();
  const [toggleVideoLike] = useToggleVideoLikeMutation();
  const { currentData: user } = useGetCurrentLoggedInUserQuery();
  const { data: subscription } = useGetUserChannelSubscribersQuery({
    channelId: video.ownerId,
  });
  const router = useRouter();

  const [userVideo, setUserVideo] = useState(video);

  const toggleVideoLikeHandler = async () => {
    if (!user) {
      setIsModalNewTaskOpen(true);
      return;
    } else {
      try {
        setIsLoading(true);
        const result = await toggleVideoLike({
          videoId: video.ownerId,
        }).unwrap();
        if (result) {
          setUserVideo((prev) => {
            return {
              ...prev,
              isLiked: !prev.isLiked,
              likesCount: prev.isLiked
                ? prev.likesCount - 1
                : prev.likesCount + 1,
            };
          });
        }
      } catch (error) {
        toast.error("Failed to toggle like");
      } finally {
        setIsLoading(false);
      }
    }
  };
  const toggleSubscribeHandler = async () => {
    if (!user) {
      setIsModalNewTaskOpen(true);
      return;
    } else {
      try {
        setIsLoading(true);
        await toggleSubscribe({
          channelId: video.ownerId,
        }).unwrap();
      } catch (error) {
        toast.error("Can't Subscribe Your Own Channel");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const moveToChannelUser = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push(`/channel/${video.owner.username}`);
  };

  const subscribed = subscription?.subscribers.some(
    (id) => Number(id) === user?.userId
  );
  const subscribers =
    subscription?.subscribersCount === 0
      ? "subscriber"
      : subscription?.subscribersCount === 1
        ? "subscriber"
        : "subscribers";

  return (
    <div className="border border-gray-300 rounded-xl px-3 mt-2">
      <h1 className="text-[16px] text-gray-600 font-semibold">{video.title}</h1>
      <div className="flex py-2 justify-between items-center">
        <div className="flex gap-4 items-start justify-between">
          <button className="cursor-pointer" onClick={moveToChannelUser}>
            <div className="w-[48px] h-[48px] rounded-full border-2 border-gray-200 overflow-hidden">
              <Image
                src={video.owner.avatar as string}
                alt={video.owner.fullName as string}
                width={44}
                height={44}
                className="w-11 h-11 object-cover rounded-full border-1 border-gray-200"
              />
            </div>
          </button>
          <div className="flex flex-col">
            <p className="text-[14px] font-bold text-gray-600">
              {video.owner.fullName}
            </p>
            <p className="text-[0.9rem] text-gray-800">
              {subscription?.subscribersCount} {subscribers}
            </p>
          </div>
          <button
            className={`border-gray-200 border cursor-pointer text-center text-gray-600 py-1 px-2 rounded-lg hover:bg-gray-400 shadow-2xl hover:text-gray-100 ${
              subscribed && "text-pink-700 border-2 border-pink-200"
            }`}
            onClick={toggleSubscribeHandler}
          >
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
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
            <p className="mr-1">{userVideo.likesCount}</p>
            {userVideo.isLiked ? (
              <ThumbsUp className="w-5 h-5" />
            ) : (
              <ThumbsDown />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoInfo;
