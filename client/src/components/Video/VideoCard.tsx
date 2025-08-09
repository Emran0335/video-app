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
      <div className="flex flex-col bg-gray-200 text-white hover:bg-gray-300">
        <div className="relative w-[350px] h-[250px]">
          <Image
            className="shadow-2xl border-amber-500 p-0 m-0 shadow-gray-200 object-cover"
            src={video.thumbnail}
            alt={video.title}
            width={350}
            height={300}
            style={{ width: "auto", height: "auto" }}
          />
          <p className="absolute bottom-6 bg-gray-200 rounded-2xl w-12 h-6 right-3 text-center text-gray-600">
            {duration}
          </p>
        </div>
        <div className="flex items-center gap-4 px-2">
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
          <div className="ml-2">
            <h2 className="text-lg font-semibold text-gray-800">
              {video.title}
            </h2>
            {video.owner && (
              <h2 className="text-gray-600">{video.owner.fullName}</h2>
            )}
            <p className="text-gray-400 pb-2 text-[0.95rem]">{`${video.views} views * ${timeDistance}`}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
