/**
 * Input sanitization utilities to strip SQL injection and XSS patterns
 * from user input on the frontend before it reaches the API.
 */

// SQL injection patterns — fresh regex each call to avoid lastIndex issues
function sqlPattern(): RegExp {
  return /[;'"\\`]|--|\*|\/\*|\*\/|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b|\bEXEC\b|\bEXECUTE\b|\bALTER\b|\bCREATE\b|\bTRUNCATE\b|\bOR\s+\d+=\d+|\bAND\s+\d+=\d+|\bOR\s+'[^']*'\s*=\s*'[^']*'/gi;
}

// XSS patterns — script tags, event handlers, javascript: URLs, etc.
function xssPattern(): RegExp {
  return /<script\b[^>]*>[\s\S]*?<\/script>|<script\b[^>]*\/?>|<\/script>|javascript:|on\w+\s*=|<iframe|<object|<embed|<form|<img[^>]+onerror|<svg[^>]+onload|expression\s*\(|url\s*\(/gi;
}

/**
 * Sanitizes a string by removing SQL injection and XSS patterns.
 * Use this on all text inputs before sending to the API.
 */
export function sanitizeInput(value: string): string {
  return value
    .replace(xssPattern(), "")
    .replace(sqlPattern(), "")
    .replace(/\s{2,}/g, " ");
}

/**
 * Checks if a string contains potential SQL injection patterns.
 * Returns true if suspicious content is detected.
 */
export function containsSqlInjection(value: string): boolean {
  return sqlPattern().test(value);
}

/**
 * Checks if a string contains potential XSS patterns.
 * Returns true if suspicious content is detected.
 */
export function containsXss(value: string): boolean {
  return xssPattern().test(value);
}

/**
 * React onChange handler wrapper that sanitizes input in real-time.
 * Usage: <input onChange={sanitizedOnChange(setName)} />
 */
export function sanitizedOnChange(
  setter: (value: string) => void
): (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void {
  return (e) => {
    setter(sanitizeInput(e.target.value));
  };
}
