/**
 * Serialise an object as a safe JSON-LD string for dangerouslySetInnerHTML.
 * Escapes <, >, and & so the JSON cannot break out of a <script> tag.
 */
export function safeJsonLd(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}
