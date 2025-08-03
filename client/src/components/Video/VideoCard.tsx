import { Video } from "@/state/api";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { formatDuration, getTimeDistanceToNow } from "@/lib/utils";
import { useRouter } from "next/navigation";

type VideoCardProps = {
  video: Video;
};

const VideoCard = ({ video }: VideoCardProps) => {
  const duration = formatDuration(video.duration);
  const timeDistance = getTimeDistanceToNow(video.createdAt);

  const router = useRouter();

  const moveToChannelUser = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    router.push(`/channel/${video.owner.username}`);
  };

  return (
    <Link href={`/watchpage/${video.id}`}>
      <div className="relative mb-2 bg-gray-200 rounded-2xl text-white p-1 hover:bg-gray-300">
        <div className="relative flex flex-col w-[350px] h-[300px]">
          <Image
            className="rounded-t-2xl shadow-2xl w-full h-full shadow-gray-200 object-cover"
            src={video.thumbnail}
            alt={video.title}
            width={300}
            height={200}
          />
          <p className="absolute bottom-1 bg-gray-200 rounded-2xl w-12 h-6 right-3 text-center text-gray-600">
            {duration}
          </p>
        </div>
        <div className="flex items-center gap-4 px-2 mt-4">
          <button className="mt-1 cursor-pointer" onClick={moveToChannelUser}>
            <Image
              className="w-12 h-12 bg-gray-100 rounded-full object-cover"
              src={video.owner?.avatar as string}
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
              <h2 className="text-gray-600">{video.owner.fullName}</h2>
            )}
          </div>
        </div>
        <p className="text-gray-400 text-center text-[0.95rem]">{`${video.views} views * ${timeDistance}`}</p>
      </div>
    </Link>
  );
};

export default VideoCard;
