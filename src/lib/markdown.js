import { marked } from "marked";
import { sanitizeHtml } from "./sanitize.js";

// Configure marked with GitHub Flavored Markdown (GFM)
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Pre-processes markdown text to convert GitHub-style alert callouts:
 * > [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION]
 * into semantic styled HTML callout boxes.
 */
function processAlerts(markdown) {
  if (!markdown) return "";

  // Regex to match blockquote alerts like:
  // > [!NOTE]
  // > Alert text line 1
  // > Alert text line 2
  const alertRegex = />\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*\n((?:>.*(?:\n|$))*)/gi;

  return markdown.replace(alertRegex, (match, type, content) => {
    const alertType = type.toLowerCase();
    const cleanLines = content
      .split("\n")
      .map((line) => line.replace(/^>\s?/, "").trim())
      .filter(Boolean)
      .join("<br/>");

    const badgeLabels = {
      note: "Note",
      tip: "Pro Tip",
      important: "Important",
      warning: "Warning",
      caution: "Caution",
    };

    const label = badgeLabels[alertType] || "Note";

    return `<div class="lms-callout lms-callout-${alertType}"><div class="lms-callout-title">${label}</div><div class="lms-callout-body">${cleanLines}</div></div>\n\n`;
  });
}

/**
 * Converts raw markdown string into safe, sanitized HTML.
 * @param {string} rawMarkdown - The raw markdown text.
 * @returns {string} Sanitized HTML string ready for rendering.
 */
export function renderMarkdown(rawMarkdown) {
  if (!rawMarkdown) return "";

  try {
    const withAlerts = processAlerts(rawMarkdown);
    const rawHtml = marked.parse(withAlerts);
    return sanitizeHtml(rawHtml);
  } catch (err) {
    console.error("Markdown parse error:", err);
    return sanitizeHtml(rawMarkdown);
  }
}

export default renderMarkdown;
