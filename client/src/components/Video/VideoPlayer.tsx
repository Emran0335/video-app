"use client";

import { useVideoViewCountMutation, Video } from "@/state/api";
import {
  Download,
  Maximize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type VideoPlayerProps = {
  video: Video;
};

const VideoPlayer = ({ video }: VideoPlayerProps) => {
  const videoElRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const vid = videoElRef.current;
    if (vid) {
      vid.addEventListener("timeupdate", handleTimeUpdate);
      vid.addEventListener("loadedmetadata", () => setDuration(vid.duration));
    }

    return () => {
      if (vid) {
        vid.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (!videoElRef.current) return;
    if (isPlaying) {
      videoElRef.current.pause();
    } else {
      videoElRef.current.play();
    }
    setIsPlaying((prev) => !prev);
  };

  const handleTimeUpdate = () => {
    if (videoElRef.current) {
      setProgress(
        (videoElRef.current.currentTime / videoElRef.current.duration) * 100
      );
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoElRef.current) {
      const newTime =
        (parseInt(e.target.value) / 100) * videoElRef.current.duration;
      videoElRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoElRef.current) {
      videoElRef.current.volume = newVolume;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoElRef.current) {
      videoElRef.current.muted = !isMuted;
    }
    setIsMuted((prev) => !prev);
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="relative w-full max-h-[70vh] overflow-hidden border border-gray-200">
      <video
        ref={videoElRef}
        poster={video.thumbnail}
        autoPlay
        className="w-full h-full object-contain"
      >
        <source src={video.videoFile} type="video/mp4" />
      </video>

      <div className="absolute flex bottom-0 w-full bg-black/5 py-2 items-center gap-4 px-2 text-gray-300">
        <button onClick={handlePlayPause}>
          {isPlaying ? (
            <Pause
              size={24}
              className="cursor-pointer text-gray-400 hover:text-gray-500"
            />
          ) : (
            <Play
              size={24}
              className="cursor-pointer text-gray-400 hover:text-gray-500"
            />
          )}
        </button>
        <input
          type="range"
          value={progress}
          onChange={handleSeek}
          className="flex-1 accent-red-500"
        />
        <span className="">
          {formatTime(videoElRef.current?.currentTime || 0)} /{" "}
          {formatTime(duration)}
        </span>
        <button onClick={toggleMute}>
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-20 accent-red-500"
        />
        <a href={video.videoFile} download className="cursor-pointer">
          <Download size={20} />
        </a>
        <Maximize size={20} className="cursor-pointer" />
      </div>
    </div>
  );
};

export default VideoPlayer;
