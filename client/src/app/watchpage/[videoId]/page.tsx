"use client";
import React from "react";
import VideoPlayer from "@/components/Video/VideoPlayer";
import { useGetAllVideosQuery, useGetVideoByIdQuery } from "@/state/api";
import { useParams } from "next/navigation";
import { icons } from "@/assets/Icons";
import VideoInfo from "@/components/Video/VideoInfo";
import Comments from "@/components/Comments";
import VideoListCard from "@/components/Video/VideoListCard";
import Image from "next/image";

const VideoPage = () => {
  const { videoId } = useParams();

  const { currentData: video, isLoading } = useGetVideoByIdQuery({
    videoId: Number(videoId),
  });
  const { currentData: videos } = useGetAllVideosQuery({
    page: 1,
    limit: 20,
  });

  if (!video) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>No video found</p>
      </div>
    );
  }

  return (
    <div>
      {isLoading ? (
        <span className="flex justify-center mt-20">{icons.bigLoading}</span>
      ) : (
        <div className="flex">
          <div className="w-full p-4">
            <div>
              <VideoPlayer video={video} />
            </div>
            <div>
              <VideoInfo
                video={video}
                showVideoDescription={video.description}
              />
            </div>
            <div>
              <Comments video={video} />
            </div>
          </div>
          <div className="w-[30%] mt-4 mr-4">
            {videos ? (
              <>
                {videos
                  .filter((enlistedVideo) => enlistedVideo.id !== video.id)
                  .map((videoList) => (
                    <VideoListCard
                      key={videoList.id}
                      video={videoList}
                      showVideoDescription={videoList.description}
                    />
                  ))}
              </>
            ) : (
              <div>
                <p>No Videos Enlisted Yet!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPage;
