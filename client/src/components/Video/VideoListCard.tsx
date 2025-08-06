import { formatDuration, getTimeDistanceToNow } from "@/lib/utils";
import { Video } from "@/state/api";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

type VideoListCardProps = {
  showVideoDescription?: string;
  video: Video;
};

const VideoListCard = ({ showVideoDescription, video }: VideoListCardProps) => {
  const duration = formatDuration(video.duration);
  const times = getTimeDistanceToNow(video.createdAt);

  const router = useRouter();

  const moveToChannelUser = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push(`/channel/${video.owner.username}`);
  };

  return (
    <Link href={`/watchpage/${video.id}`}>
      <div className="relative mb-2 bg-gray-200 rounded-2xl text-white p-1 hover:bg-gray-300">
        <div className="relative flex flex-col w-full h-[120px]">
          <Image
            className="rounded-xl shadow-2xl w-full h-full shadow-gray-200 object-contain"
            src={video.thumbnail}
            alt={video.title}
            style={{ width: "auto", height: "auto" }}
            width={300}
            height={150}
          />
          <p className="absolute bottom-1 bg-gray-200 rounded-2xl w-12 h-6 right-3 text-center text-gray-600">
            {duration}
          </p>
        </div>
        <div className="flex items-center gap-4 px-2 mt-4">
          <button className="mt-1 cursor-pointer" onClick={moveToChannelUser}>
            <Image
              className="w-12 h-12 bg-gray-100 rounded-full object-cover"
              src={
                typeof video.owner.avatar === "string"
                  ? video.owner.avatar
                  : "/default-avatar.png"
              }
              alt={video.owner.fullName as string}
              style={{ width: "auto", height: "auto" }}
              width={400}
              height={400}
            />
          </button>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {video.title}
            </h2>
            {video.owner && (
              <h2 className="text-gray-600">{video.owner.fullName}</h2>
            )}
            <p className="text-gray-400 text-center text-[0.95rem]">{`${video.views} views * ${times}`}</p>
          </div>
        </div>
        {showVideoDescription && (
          <span className="text-center px-2">
            <p className="text-gray-600 text-sm font-semibold">
              {video?.description}
            </p>
          </span>
        )}
      </div>
    </Link>
  );
};

export default VideoListCard;
