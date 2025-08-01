import { Video } from "@/state/api";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { formatDuration, getTimeDistanceToNow } from "@/lib/utils";

type VideoCardProps = {
  video: Video;
};

const VideoCard = ({ video }: VideoCardProps) => {
  const duration = formatDuration(video.duration);
  const timeDistance = getTimeDistanceToNow(video.createdAt);
  return (
    <Link href={`/watchpage/${video.id}`}>
      <div className="relative mb-2 bg-gray-200 rounded-2xl text-white p-1">
        <div className="relative flex flex-col">
          <Image
            className="rounded-2xl shadow-2xl shadow-gray-200"
            src={video.thumbnail}
            alt={video.title}
            width={400}
            height={200}
          />
          <p className="absolute bottom-1 bg-gray-200 rounded-2xl w-12 h-6 right-3 text-center text-gray-600">{duration}</p>
        </div>
        <div className="flex items-center">
          <button className="mt-1">
            <Image
              className="w-12 h-12 bg-gray-100 rounded-full object-cover"
              src={
                typeof video.owner.avatar === "string"
                  ? video.owner.avatar
                  : "/default-avatar.png"
              }
              alt={video.owner.fullName as string}
              width={400}
              height={400}
            />
          </button>
          <div className="ml-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {video.title}
            </h2>
            {video.owner && (
              <h2 className="text-gray-400">{video.owner.fullName}</h2>
            )}
          </div>
        </div>
        <p className="text-gray-300 text-center text-[0.95rem]">{`${video.views} views * ${timeDistance}`}</p>
      </div>
    </Link>
  );
};

export default VideoCard;
