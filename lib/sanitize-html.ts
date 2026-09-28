import DOMPurify from "isomorphic-dompurify";

// All CMS-style content (hero text, FAQ answers, SEO blocks, legal pages,
// blog articles, etc.) is authored by CONTENT_MANAGER/ADMIN accounts, but we
// still sanitize before injecting it as raw HTML via dangerouslySetInnerHTML.
// This is defense-in-depth: it protects against a compromised or malicious
// editor account, and against any future content source that isn't fully
// trusted, without relying on every call site remembering to sanitize.
// isomorphic-dompurify runs both during Next.js SSR and in the browser.
const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "a", "ul", "ol", "li", "strong", "em", "b", "i", "u", "s",
    "br", "hr", "blockquote", "code", "pre", "span", "div", "img",
    "table", "thead", "tbody", "tr", "th", "td", "figure", "figcaption",
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel", "src", "alt", "title", "width", "height", "class",
  ],
  // Only allow http(s)/mailto/tel URIs (and relative/anchor links) - blocks
  // javascript:, data:text/html and similar script-capable schemes.
  ALLOWED_URI_REGEXP:
    /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
};

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS);
}
