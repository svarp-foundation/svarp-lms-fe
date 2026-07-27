import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Share2, Copy, Check, X, Send, Linkedin, Twitter, Mail } from "lucide-react";

export default function ShareModal({ isOpen, onClose, courseTitle, courseUrl }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetUrl = courseUrl || window.location.href;
  const encodedUrl = encodeURIComponent(targetUrl);
  const shareText = `Check out this course on SVARP Global Academy: ${courseTitle || "Course"}`;
  const encodedText = encodeURIComponent(shareText);

  const handleCopy = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: courseTitle || "SVARP Global Academy Course",
          text: shareText,
          url: targetUrl,
        });
      } catch (err) {
        console.error("Native share error:", err);
      }
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: Send,
      color: "bg-emerald-500 hover:bg-emerald-600 text-white",
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "X (Twitter)",
      icon: Twitter,
      color: "bg-black hover:bg-gray-800 text-white",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-slate-700 hover:bg-slate-800 text-white",
      href: `mailto:?subject=${encodeURIComponent(courseTitle || "SVARP Course")}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-primary">
            <Share2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">
              Share Course
            </h3>
            <p className="text-xs text-gray-500 font-medium line-clamp-1">
              {courseTitle || "SVARP Global Academy"}
            </p>
          </div>
        </div>

        {/* Native Share Button (if supported) */}
        {navigator.share && (
          <button
            onClick={handleNativeShare}
            className="w-full mb-4 py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-gray-200 transition-colors"
          >
            <Share2 size={14} />
            Share via Device App...
          </button>
        )}

        {/* Social Share Grid */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {shareOptions.map((option) => (
            <a
              key={option.name}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all shadow-sm active:scale-95 ${option.color}`}
              title={`Share on ${option.name}`}
            >
              <option.icon size={20} />
              <span className="text-[10px] font-bold mt-1.5">{option.name}</span>
            </a>
          ))}
        </div>

        {/* Copy Link Section */}
        <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={targetUrl}
            className="bg-transparent border-none outline-none text-xs text-gray-700 font-mono flex-1 px-1 overflow-hidden text-ellipsis"
          />
          <button
            onClick={handleCopy}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              copied
                ? "bg-emerald-600 text-white shadow-md"
                : "bg-primary text-white hover:bg-slate-900 shadow-sm"
            }`}
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
