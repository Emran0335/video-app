"use client";
import React, { useEffect } from "react";
import VideoPlayer from "@/components/Video/VideoPlayer";
import {
  useGetAllVideosQuery,
  useGetCurrentLoggedInUserQuery,
  useGetVideoByIdQuery,
  useVideoViewCountMutation,
} from "@/state/api";
import { useParams } from "next/navigation";
import { icons } from "@/assets/Icons";
import VideoInfo from "@/components/Video/VideoInfo";
import Comments from "@/components/Comments";
import VideoListCard from "@/components/Video/VideoListCard";

const VideoPage = () => {
  const { videoId } = useParams();
  const { data: currentUser } = useGetCurrentLoggedInUserQuery();
  const { currentData: video } = useGetVideoByIdQuery({
    videoId: Number(videoId),
  });
  console.log("currentVideo", video)
  const { currentData: videos, isLoading } = useGetAllVideosQuery();
  const [videoViewCount] = useVideoViewCountMutation();

  useEffect(() => {
    if (video && currentUser?.userId !== video.owner.userId) {
      videoViewCount({ videoId: video.id });
    }
  }, [video, currentUser, videoViewCount]);

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
          <div className="w-full">
            <div>
              <VideoPlayer video={video} />
            </div>
            <div>
              <VideoInfo video={video} />
            </div>
            <div>
              <Comments video={video} />
            </div>
          </div>
          <div className="w-[30%] ml-4">
            {videos ? (
              <div className="grid grid-cols-[repeat(auto-fill,_minmax(300px,_1fr))] gap-2">
                {videos
                  .filter((enlistedVideo) => enlistedVideo.id !== video.id)
                  .map((videoList) => (
                    <VideoListCard
                      key={videoList.id}
                      video={videoList}
                      showVideoDescription={videoList.description}
                    />
                  ))}
              </div>
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
