"use client";
import React, { useEffect } from "react";
import VideoPlayer from "@/components/Video/VideoPlayer";
import {
  useGetAllVideosQuery,
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

  const { currentData: video } = useGetVideoByIdQuery({
    videoId: Number(videoId),
  });
  const { currentData: videos, isLoading } = useGetAllVideosQuery();
  const [videoViewCount] = useVideoViewCountMutation();

  useEffect(() => {
    if (video?.owner.userId !== Number(videoId)) {
      videoViewCount({
        videoId: Number(videoId),
      });
    }
  }, [video, videoViewCount, videoId]);

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
              <VideoInfo video={video} />
            </div>
            <div>
              <Comments video={video} />
            </div>
          </div>
          <div className="w-[30%] mt-4 mr-4">
            {videos ? (
              <div className="grid grid-cols-1 gap-2">
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
