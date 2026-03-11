/**
 * Input sanitization utilities — lightweight XSS protection only.
 * SQL injection is handled by the backend (parameterized queries).
 * We only strip obvious XSS patterns (script tags, javascript: URIs, etc.)
 * to prevent stored XSS if the backend ever reflects unsanitized input.
 */

// XSS patterns — script tags, javascript: URLs, iframes, embeds
function xssPattern(): RegExp {
  return /<script\b[^>]*>[\s\S]*?<\/script>|<script\b[^>]*\/?>|<\/script>|javascript:|<iframe[^>]*>|<object[^>]*>|<embed[^>]*>/gi;
}

/**
 * Sanitizes a string by removing obvious XSS patterns.
 * Does NOT strip normal words or punctuation.
 */
export function sanitizeInput(value: string): string {
  return value.replace(xssPattern(), "");
}

/**
 * Checks if a string contains potential XSS patterns.
 */
export function containsXss(value: string): boolean {
  return xssPattern().test(value);
}
