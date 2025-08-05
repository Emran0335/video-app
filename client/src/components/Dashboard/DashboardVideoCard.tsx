"use client";
import { formatDate, getTimeDistanceToNow } from "@/lib/utils";
import {
  useGetCurrentLoggedInUserQuery,
  useTogglePublishStatusMutation,
  Video,
} from "@/state/api";
import Image from "next/image";
import Link from "next/link";
import React, { useCallback, useState } from "react";

type DashboardVideoCardProps = {
  video: Video;
};

const DashboardVideoCard = ({ video }: DashboardVideoCardProps) => {
  const { data: user } = useGetCurrentLoggedInUserQuery();
  const [toggleVideo] = useTogglePublishStatusMutation();

  const [publishStatus, setPublishStatus] = useState(video?.isPublished);

  const handleTogglePublish = useCallback(async () => {
    try {
      const response = await toggleVideo({
        videoId: Number(video.id),
        isPublished: !video.isPublished,
      });
      setPublishStatus((prevStatus) => !prevStatus);
    } catch (error) {
      console.log(error);
    }
  }, [toggleVideo, video.id, video.isPublished]);
  return (
    <tr key={video.id} className="group border">
      <td className="">
        <div>
          <label htmlFor={"vid" + video.id}>
            <input
              type="checkbox"
              id={"vid" + video.id}
              defaultChecked={video.isPublished}
            />
            <span className="inline-block h-6 w-full rounded-2xl bg-gray-200 duration-200 after:absolute after:bottom-1 after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-black after:duration-200 peer-checked:bg-pink-600 peer-checked:after:left-7"></span>
          </label>
        </div>
      </td>
      <td>
        <div>
          <span>{publishStatus ? "Published" : "Unpublised"}</span>
        </div>
      </td>
      <td>
        <div>
          {publishStatus ? (
            <Link href={`/watchpage/${video.id}`}>
              <Image
                src={video.thumbnail}
                alt={video.title}
                width={32}
                height={32}
                style={{ width: "auto", height: "auto" }}
              />
            </Link>
          ) : (
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={32}
              height={32}
            />
          )}
          <h3>
            {publishStatus ? (
              <Link href={`/watchpage/${video.id}`}>
                {video.title.length > 35
                  ? video.title.substr(0, 35) + "..."
                  : video.title}
              </Link>
            ) : video.title.length > 35 ? (
              video.title.substr(0, 35) + "..."
            ) : (
              video.title
            )}
          </h3>
        </div>
      </td>
      <td>{formatDate(video.createdAt)}</td>
      <td>{video.views}</td>
      <td>{video.likesCount}</td>
    </tr>
  );
};

export default DashboardVideoCard;
