// JSON.stringify does not escape "<", so a CMS-authored string containing
// "</script>" would break out of <script type="application/ld+json"> and
// inject arbitrary HTML/JS. Escaping "<", ">", "&" and U+2028/2029 as
// \uXXXX keeps the JSON valid while making breakout impossible.
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
