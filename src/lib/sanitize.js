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

const getPurifier = () => {
  if (typeof DOMPurify?.sanitize === "function") {
    return DOMPurify;
  }
  if (typeof DOMPurify === "function" && typeof window !== "undefined") {
    return DOMPurify(window);
  }
  return DOMPurify;
};

/**
 * Returns a sanitised HTML string, safe for dangerouslySetInnerHTML.
 * @param {string} dirty - Raw HTML string from the API.
 * @returns {string} Sanitised HTML.
 */
export const sanitizeHtml = (dirty) => {
  if (!dirty) return "";
  const purifier = getPurifier();
  if (!purifier || typeof purifier.sanitize !== "function") {
    return dirty;
  }
  return purifier.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
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
      "span",
      "div",
      "hr",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "a",
      "img",
      "details",
      "summary",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel", "class", "id", "align"],
    FORCE_BODY: true,
    ADD_ATTR: ["target"],
    FORBID_ATTR: ["onerror", "onload", "onclick"],
  });
};
