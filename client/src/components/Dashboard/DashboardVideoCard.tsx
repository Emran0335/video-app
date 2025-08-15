"use client";
import { formatDate, getTimeDistanceToNow } from "@/lib/utils";
import {
  useDeleteVideoMutation,
  useToggleVideoPublishStatusMutation,
  Video,
} from "@/state/api";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "react-toastify";
import Modal from "../Modal";
import EditVideoModal from "@/components/Dashboard/UpdateVideoModal";
import { Delete, Edit } from "lucide-react";

type DashboardVideoCardProps = {
  video: Video;
};

const DashboardVideoCard = ({ video }: DashboardVideoCardProps) => {
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const openVideoModalHandler = () => {
    setIsModalNewTaskOpen((prev) => !prev);
  };

  const [publishStatus, setPublishStatus] = useState(video?.isPublished);

  const [toggleVidioPublish, { isLoading: isTogglePublishing }] =
    useToggleVideoPublishStatusMutation();
  const [deleteVideo, { isLoading: isDeleting }] = useDeleteVideoMutation();

  const handleTogglePublish = async () => {
    try {
      const result = await toggleVidioPublish({
        videoId: Number(video.id),
        isPublished: !video.isPublished,
      }).unwrap();
      toast.success(result.message);
      setPublishStatus((prev) => !prev);
    } catch (error) {
      toast.error("Error while toggling video publish status");
      console.log(error);
    }
  };

  const handleDeleteVideo = async () => {
    try {
      await deleteVideo({
        videoId: Number(video.id),
      }).unwrap();
      toast.loading("Video deleted successfully");
    } catch (error) {
      toast.error("Error while deleting video");
      console.log(error);
    }
  };

  return (
    <tr key={video.id} className="group border">
      <td className="border-collapse border-b border-gray-600 px-4 py-3 group-last:border-none">
        <div className="flex justify-center">
          <label
            htmlFor={"vid" + video.id}
            className="relative inline-block w-12 cursor-pointer overflow-hidden"
          >
            <input
              type="checkbox"
              id={"vid" + video.id}
              defaultChecked={video.isPublished}
              onClick={handleTogglePublish}
              className="peer sr-only"
            />
            <span className="inline-block h-6 w-full rounded-2xl border border-gray-400 bg-gray-100 duration-200 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-red-400 after:duration-200 peer-checked:bg-gray-200 peer-checked:after:bg-green-500 peer-checked:after:left-7"></span>
          </label>
        </div>
      </td>
      <td className="border-collapse border-b border-gray-600 px-4 py-3 group-last:border-none">
        <div className="flex justify-center">
          <span
            className={`inline-block rounded-2xl border px-1.5 py-0.5 ${
              publishStatus
                ? "border-gray-400 text-green-600"
                : "border-red-400 text-red-400"
            }`}
          >
            {publishStatus ? "Published" : "Unpublished"}
          </span>
        </div>
      </td>
      <td className="border-collapse border-b border-gray-600 px-4 py-3 group-last:border-none">
        <div className="flex items-center justify-start gap-2 pl-4">
          {publishStatus ? (
            <Link href={`/watchpage/${video.id}`}>
              <Image
                src={video.thumbnail}
                alt={video.title}
                width={40}
                height={40}
                style={{ width: "auto", height: "auto" }}
                className="object-cover"
              />
            </Link>
          ) : (
            <Image
              src={video.thumbnail}
              alt={video.title}
              width={40}
              height={40}
              style={{ width: "auto", height: "auto" }}
              className="object-cover"
            />
          )}
          <h3 className="font-semibold">
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
      <td className="border-collapse text-center border-b border-gray-600 px-4 py-3 group-last:border-none">
        {formatDate(video.createdAt)}
      </td>
      <td className="border-collapse text-center border-b border-gray-600 px-4 py-3 group-last:border-none">
        {video.views}
      </td>
      <td className="border-collapse text-center border-b border-gray-600 px-4 py-3 group-last:border-none">
        {video.commentsCount}
      </td>
      <td className="border-collapse text-center border-b border-gray-600 px-4 py-3 group-last:border-none">
        {video.likesCount}
      </td>
      <td>
        {isModalNewTaskOpen && (
          <Modal
            isOpen={isModalNewTaskOpen}
            onClose={() => setIsModalNewTaskOpen(false)}
            name="Edit the Video"
          >
            <EditVideoModal video={video} closeModal={() => setIsModalNewTaskOpen(false)} />
          </Modal>
        )}
        <div className="flex justify-center gap-2">
          <button
            type="button"
            className="cursor-pointer"
            onClick={handleDeleteVideo}
            disabled={isDeleting}
          >
            <Delete className="w-5 h-5 hover:text-red-500" />
          </button>
          <button type="button" className="cursor-pointer" onClick={openVideoModalHandler}>
            <Edit className="w-5 h-5 hover:text-red-500" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DashboardVideoCard;
