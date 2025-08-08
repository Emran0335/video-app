"use client";
import Modal from "@/components/Modal";
import VideoModal from "@/components/UserModal/VideoModal";
import { Plus, Video } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

const AddVideoPage = () => {
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(true);

  const openVideoModalHandler = () => {
    setIsModalNewTaskOpen((prev) => !prev);
  };
  return (
    <div className="text-gray-600 w-full h-full flex items-center justify-center gap-4">
      {isModalNewTaskOpen ? (
        <Modal
          isOpen={isModalNewTaskOpen}
          onClose={() => setIsModalNewTaskOpen(false)}
          name="Please Add A Video"
        >
          <VideoModal closeModal={() => setIsModalNewTaskOpen(false)} />
        </Modal>
      ) : (
        <>
          <button
            className="flex items-center gap-2  text-gray-600 bg-gray-200 py-2 px-4 border border-gray-400 hover:bg-gray-400 hover:text-white"
            onClick={openVideoModalHandler}
          >
            <Plus className="w-8 h-8 text-blue-600" />
            <span className="text-2xl">Add Video</span>
          </button>
          <Link
            href="/home"
            className="flex items-center gap-2  text-gray-600 bg-gray-200 py-2 px-4 border border-gray-400 hover:bg-gray-400 hover:text-white"
          >
            <Video className="w-8 h-8 text-blue-600" />
            <span className="text-2xl">Back To Videos</span>
          </Link>
        </>
      )}
    </div>
  );
};

export default AddVideoPage;
