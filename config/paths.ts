import path from 'path'

// Global repository configuration
const REPO_BASE = 'C:\\repositories\\Zhub'

// Derived paths
export const PATHS = {
  REPO_BASE,
  CHATBACKEND_BASE: path.join(REPO_BASE, 'ChatBackend'),
  GDRIVE_DOWNLOADS: path.join(REPO_BASE, 'ChatBackend', 'agentic_ai', 'tools', 'utils', 'gdrive_downloads'),
} as const

// For backwards compatibility
export const UPLOAD_BASE_PATH = PATHS.GDRIVE_DOWNLOADS