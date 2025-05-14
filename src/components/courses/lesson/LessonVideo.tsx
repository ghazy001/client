// components/LessonVideo.tsx

import { useEffect, useRef } from "react";
import Plyr from "plyr";

interface LessonVideoProps {
  videoUrl?: string;
  className?: string;
}

const LessonVideo = ({ videoUrl, className = "" }: LessonVideoProps) => {
  const playerRef = useRef<Plyr | null>(null);

  const isYouTubeUrl = (url: string) => {
    return url.includes("youtube.com/watch?v=") || url.includes("youtu.be/");
  };

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0] || "";
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0` : "";
  };

  useEffect(() => {
    if (videoUrl && !isYouTubeUrl(videoUrl)) {
      playerRef.current = new Plyr("#player", {
        controls: ["play-large", "play", "progress", "current-time", "mute", "volume", "settings", "fullscreen"],
      });

      return () => {
        playerRef.current?.destroy();
      };
    }
  }, [videoUrl]);

  if (!videoUrl) return <div>No video available.</div>;

  if (isYouTubeUrl(videoUrl)) {
    const embedUrl = getYouTubeEmbedUrl(videoUrl);
    if (!embedUrl) return <div>Invalid YouTube URL.</div>;

    return (
        <div className={`relative w-full ${className}`} style={{ paddingBottom: "56.25%" }}>
          <iframe
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
          />
        </div>
    );
  }

  return (
      <div className={`relative w-full ${className}`}>
        <video
            id="player"
            playsInline
            controls
            className="w-full h-full object-contain rounded-xl shadow-lg"
            data-poster="/assets/img/bg/video_bg.webp"
        >
          <source src={videoUrl} type="video/mp4" />
          <source src="/path/to/video.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
  );
};

export default LessonVideo;
