import React, { useState } from "react";
import { getMediaUrl } from "../../config";
import { BookOpen } from "lucide-react";

export const CourseThumbnail = ({
  thumbnailUrl,
  title = "Course",
  className = "w-full h-full",
  imgClassName = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300",
}) => {
  const [hasError, setHasError] = useState(false);

  const resolvedUrl = thumbnailUrl ? getMediaUrl(thumbnailUrl) : null;

  if (resolvedUrl && !hasError) {
    return (
      <img
        src={resolvedUrl}
        alt={title}
        className={imgClassName}
        onError={() => setHasError(true)}
      />
    );
  }

  // Modern brand-themed gradient placeholder when image is missing or fails to load
  return (
    <div
      className={`w-full h-full bg-gradient-to-br from-[#1f3b45] via-[#162e36] to-[#0f172a] flex flex-col items-center justify-center p-4 text-center select-none relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-400 backdrop-blur-xs">
          <BookOpen size={20} />
        </div>
        <span className="text-[11px] font-bold text-white/90 line-clamp-1 max-w-[85%] tracking-tight">
          {title}
        </span>
      </div>
    </div>
  );
};

export default CourseThumbnail;
