/**
 * HTML sanitisation helper (XSS protection).
 *
 * Wraps DOMPurify so lesson content rendered via
 * dangerouslySetInnerHTML is safe.
 *
 * Usage:
 *   import { sanitizeHtml } from "../lib/sanitize";
 *   <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }} />
 */
import DOMPurify from "dompurify";

/**
 * Returns a sanitised HTML string, safe for dangerouslySetInnerHTML.
 * @param {string} dirty - Raw HTML string from the API.
 * @returns {string} Sanitised HTML.
 */
export const sanitizeHtml = (dirty) => {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    // Allow common rich-text tags only
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "a",
      "img",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel"],
    // Force safe link behaviour
    FORCE_BODY: true,
    ADD_ATTR: ["target"],
    // Prevent javascript: URLs in href/src
    FORBID_ATTR: ["onerror", "onload", "onclick"],
  });
};
