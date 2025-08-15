import { icons } from "@/assets/Icons";
import { useUpdateVideoMutation, Video } from "@/state/api";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

type UpdateVideoModalProps = {
  video: Video;
  closeModal: () => void;
};

const UpdateVideoModal = ({ video, closeModal }: UpdateVideoModalProps) => {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [thumbnail, setThumbnail] = useState<File | string>("");

  const router = useRouter();

  const [update, { isLoading, isSuccess }] = useUpdateVideoMutation();

  const handleSubmit = async () => {
    if (!title || !description || !thumbnail) return;

    const videoData = new FormData();
    videoData.append("title", title);
    videoData.append("description", description);
    videoData.append("thumbnail", thumbnail); // append file, not name

    const response = await update({
      videoId: Number(video.id),
      videoData,
    }).unwrap(); // make sure your mutation accepts FormData

    if (!("error" in response)) {
      // ✅ Navigate to login page on success
      router.push("/");
      closeModal();
    }

    // Reset form
    setTitle("");
    setDescription("");
    setThumbnail("");
  };

  const isFormValid = () => {
    return title && description && thumbnail;
  };

  if (isLoading) {
    return (
      <div className="flex-col items-center justify-center">
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
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <div>
        <label className="mb-1 block text-sm">Title</label>
        <input
          type="text"
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          placeholder="Video Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm">Description</label>
        <input
          type="text"
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          value={description}
          placeholder="Video Description"
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="thumbnail" className="mb-1 block text-sm">
          {thumbnail ? "Thumbnail" : "Choose Thumbnail"}
        </label>
        <input
          type="file"
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setThumbnail(e.target.files[0]);
            }
          }}
        />
      </div>
      <button
        type="submit"
        className={`w-full rounded bg-teal-600 py-2 text-sm text-white hover:bg-teal-700" ${
          !isFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""
        }`}
        disabled={!isFormValid() || isLoading}
      >
        {isLoading ? "Updating..." : "Updated"}
      </button>
    </form>
  );
};

export default UpdateVideoModal;
