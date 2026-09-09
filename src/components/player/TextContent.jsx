import React from "react";
import { sanitizeHtml } from "../../lib/sanitize";

export const TextContent = ({ content = "" }) => {
  if (!content) {
    return (
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
        No reading material provided for this lesson.
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-8 rounded-xl border border-slate-200 prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed">
      <div
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(content),
        }}
      />
    </div>
  );
};

export default TextContent;
