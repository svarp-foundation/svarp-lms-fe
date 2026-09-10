import React, { useMemo } from "react";
import { renderMarkdown } from "../../lib/markdown";

export const TextContent = ({ content = "" }) => {
  const htmlContent = useMemo(() => renderMarkdown(content), [content]);

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
        className="markdown-lesson-body"
        dangerouslySetInnerHTML={{
          __html: htmlContent,
        }}
      />
    </div>
  );
};

export default TextContent;

