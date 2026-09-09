import React from "react";
import API_URL from "../../config";
import { PlayCircle } from "lucide-react";

export const VideoPlayer = ({ videoUrl, title = "Lesson Video" }) => {
  if (!videoUrl) {
    return (
      <div className="w-full aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white/50 p-6 text-center">
        <PlayCircle size={48} className="text-white/20 mb-2" />
        <p className="text-xs text-slate-400">No video stream attached to this lesson.</p>
      </div>
    );
  }

  // Check for YouTube embed
  const isYouTube =
    videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

  const getYouTubeEmbedUrl = (url) => {
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("watch?v=")) {
      videoId = url.split("watch?v=")[1]?.split("&")[0];
    } else if (url.includes("embed/")) {
      return url;
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0` : url;
  };

  // Check for Vimeo embed
  const isVimeo = videoUrl.includes("vimeo.com");
  const getVimeoEmbedUrl = (url) => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}` : url;
  };

  if (isYouTube) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md">
        <iframe
          src={getYouTubeEmbedUrl(videoUrl)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  if (isVimeo) {
    return (
      <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md">
        <iframe
          src={getVimeoEmbedUrl(videoUrl)}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    );
  }

  // Direct hosted HTML5 video with token auth
  const token = localStorage.getItem("token") || "";
  let resolvedUrl = videoUrl.replace("/static/uploads/", "/media/");
  if (resolvedUrl.startsWith("/")) {
    resolvedUrl = `${API_URL}${resolvedUrl}`;
  } else if (!resolvedUrl.startsWith("http")) {
    resolvedUrl = `${API_URL}/${resolvedUrl}`;
  }
  const secureVideoUrl = `${resolvedUrl}${resolvedUrl.includes("?") ? "&" : "?"}token=${token}`;

  return (
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-md">
      <video
        key={secureVideoUrl}
        controls
        controlsList="nodownload"
        className="w-full h-full object-contain"
      >
        <source src={secureVideoUrl} type="video/mp4" />
        <source src={secureVideoUrl} type="video/webm" />
        Your browser does not support HTML5 video streaming.
      </video>
    </div>
  );
};

export default VideoPlayer;
