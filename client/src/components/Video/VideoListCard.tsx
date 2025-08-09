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
      <div className="bg-gray-200 text-white hover:bg-gray-300">
        <div className="relative w-full h-full overflow-hidden">
          <Image
            className="shadow-2xl w-full h-full shadow-gray-200 object-cover"
            src={video.thumbnail}
            alt={video.title}
            style={{ width: "auto", height: "auto" }}
            width={400}
            height={250}
          />
          <p className="absolute bottom-1 bg-gray-200 rounded-2xl w-12 h-6 right-3 text-center text-gray-600">
            {duration}
          </p>
        </div>
        <div className="flex py-1 gap-4">
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
            <h2 className="text-lg font-semibold text-gray-800">
              {video.title}
            </h2>
            {showVideoDescription && (
              <div className="text-gray-600">
                <p className="text-sm">{video?.description}</p>
              </div>
            )}
            {video.owner && (
              <h2 className="text-gray-600 text-[14px]">{video.owner.fullName}</h2>
            )}
            <p className="text-gray-500 text-[0.85rem]">{`${video.views} views * ${times}`}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoListCard;
