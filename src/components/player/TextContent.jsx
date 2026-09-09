import React from "react";
import { sanitizeHtml } from "../../lib/sanitize";

export const TextContent = ({ content = "" }) => {
  if (!content) {
    return (
      <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
        No reading material provided for this lesson.
      </div>
    );
  }

  return (
    <div className="bg-white p-5 sm:p-8 rounded-xl border border-slate-200/90 shadow-xs max-w-none">
      <div
        className="prose prose-slate max-w-none text-slate-900 text-xs sm:text-sm leading-relaxed [&_*]:text-slate-900 [&_p]:text-slate-900 [&_p]:mb-3 [&_span]:text-slate-900 [&_h1]:text-slate-950 [&_h1]:font-bold [&_h2]:text-slate-950 [&_h2]:font-bold [&_h3]:text-slate-950 [&_h3]:font-bold [&_h4]:text-slate-950 [&_h4]:font-bold [&_ul]:text-slate-900 [&_ol]:text-slate-900 [&_li]:text-slate-900 [&_strong]:text-slate-950 [&_strong]:font-bold [&_b]:text-slate-950 [&_b]:font-bold whitespace-pre-wrap font-normal"
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(content),
        }}
      />
    </div>
  );
};

export default TextContent;

