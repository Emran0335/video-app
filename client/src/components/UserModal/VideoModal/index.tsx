"use client";
import { usePublishAVideoMutation } from "@/state/api";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { icons } from "@/assets/Icons";

type VideoModalProps = {
  closeModal: () => void;
};

const VideoModal = ({ closeModal }: VideoModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState<File | string>("");
  const [videoFile, setVideoFile] = useState<File | string>("");

  const router = useRouter();

  const [publishAVideo, { isLoading, isSuccess }] = usePublishAVideoMutation();

  const handleSubmit = async () => {
    if (!title || !description || !thumbnail || !videoFile) return;

    const videoData = new FormData();
    videoData.append("title", title);
    videoData.append("description", description);
    videoData.append("thumbnail", thumbnail); // append file, not name
    videoData.append("videoFile", videoFile); // append file, not name

    const response = await publishAVideo(videoData); // make sure your mutation accepts FormData

    if (!("error" in response)) {
      // ✅ Navigate to login page on success
      router.push("/");
      closeModal();
    }

    // Reset form
    setTitle("");
    setDescription("");
    setThumbnail("");
    setVideoFile("");
  };

  const isFormValid = () => {
    return title && description && thumbnail && videoFile;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <h2 className="text-center">Please wait...</h2>
        <div className="flex items-center justify-center">{icons.loading}</div>
        <p className="text-center">Large file takes time</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center">
        Video Uploaded Successfully
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <form
        className="mx-auto mt-2 flex flex-col gap-2 w-full px-4 text-gray-900"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="text"
          className="px-2 rounded-lg border py-1 mb-2"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          className="px-2 rounded-lg border py-1 mb-2"
          value={description}
          placeholder="Video Description"
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="relative mt-4 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-4">
          <label
            htmlFor="thumbnail"
            className="absolute text-sm mt-[-16px] px-1 text-pink-600 ml-10 bg-white"
          >
            {thumbnail ? "Thumbnail" : "Choose Thumbnail"}
          </label>
          <input
            type="file"
            className="px-2 rounded-lg border py-1 mb-2"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setThumbnail(e.target.files[0]);
              }
            }}
          />
          <label
            htmlFor="videoFile"
            className="absolute text-sm text-pink-600 px-1 mt-[-16px] ml-[280px] bg-white"
          >
            {videoFile ? "VideoFile" : "Choose videoFile"}
          </label>
          <input
            type="file"
            className="px-2 rounded-lg border py-1 mb-2"
            accept="video/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setVideoFile(e.target.files[0]);
              }
            }}
          />
        </div>
        <button
          className={`mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
            !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={!isFormValid() || isLoading}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default VideoModal;
