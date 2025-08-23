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
    <Link href={`/watchpage/${video.id}`} className="block bg-gray-200">
      <div className="text-white flex flex-col gap-2 hover:cursor-pointer hover:bg-gray-200">
        <div className="relative w-full aspect-video overflow-hidden bg-gray-200">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (min-width: 1280px) 50vw, 33vw"
          />
          <p className="absolute bottom-1  bg-black/80 rounded-2xl w-12 h-6 right-3 text-center text-white">
            {duration}
          </p>
        </div>
        <div className="flex flex-1 gap-2 min-w-0">
          <button
            className="cursor-pointer flex items-center justify-center w-[40px] h-[40px] rounded-full border-2 border-gray-200 overflow-hidden"
            onClick={moveToChannelUser}
          >
            <Image
              src={video.owner.avatar as string}
              alt={video?.title as string}
              width={32}
              height={24}
              style={{ width: "auto", height: "auto" }}
              className="w-full h-full rounded-full object-cover"
            />
          </button>
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-gray-800">
              {video.title}
            </h2>
            {showVideoDescription && (
              <div className="text-gray-600">
                <p className="text-sm">{video?.description}</p>
              </div>
            )}
            {video.owner && (
              <h2 className="text-gray-600 text-[14px]">
                {video.owner.fullName}
              </h2>
            )}
            <p className="text-gray-500 text-[0.85rem]">{`${video.views} views * ${times}`}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoListCard;
