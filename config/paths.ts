import path from 'path'

// Global repository configuration - now uses environment variable
const REPO_BASE = process.env.REPO_BASE_PATH || path.join(process.cwd(), 'storage')

// Derived paths
export const PATHS = {
  REPO_BASE,
  CHATBACKEND_BASE: path.join(REPO_BASE, 'ChatBackend'),
  GDRIVE_DOWNLOADS: path.join(REPO_BASE, 'ChatBackend', 'agentic_ai', 'tools', 'utils', 'gdrive_downloads'),
} as const

// For backwards compatibility
export const UPLOAD_BASE_PATH = PATHS.GDRIVE_DOWNLOADS