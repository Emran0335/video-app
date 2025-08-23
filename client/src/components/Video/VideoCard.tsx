import { Video } from "@/state/api";
import Image from "next/image";
import Link from "next/link";
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
    <Link href={`/watchpage/${video.id}`} className="block group">
      <div className="flex flex-col hover:cursor-pointer">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video overflow-hidden bg-gray-200">
          <Image
            className="object-cover cursor-pointer"
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (min-width: 1280px) 50vw, 33vw"
          />
          <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded-md">
            {duration}
          </span>
        </div>

        {/* Video info */}
        <div className="flex items-start gap-3 mt-3">
          {/* Avatar */}
          <button className="shrink-0" onClick={moveToChannelUser}>
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <Image
                src={video.owner.avatar as string}
                alt={video.owner.fullName as string}
                width={40}
                height={40}
                className="object-cover cursor-pointer"
              />
            </div>
          </button>

          {/* Text info */}
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-gray-600 line-clamp-2">
              {video.title}
            </h2>
            <p className="text-xs text-gray-600">{video.owner.fullName}</p>
            <p className="text-xs text-gray-500">
              {video.views} views • {timeDistance}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;
