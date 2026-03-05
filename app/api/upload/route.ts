import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { UPLOAD_BASE_PATH } from '../../../config/paths'

// Maximum file size: 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Allowed file extensions
const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.txt', '.md', '.csv', '.json', '.xml', '.log',
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg',
  '.zip', '.rar', '.7z',
])

// Dangerous extensions that should never be uploaded
const BLOCKED_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.ps1', '.msi', '.dll', '.sys',
  '.com', '.vbs', '.js', '.wsf', '.scr', '.pif', '.hta',
  '.cpl', '.msc', '.inf', '.reg', '.rgs',
])

export async function POST(request: NextRequest) {
  // Auth check — reject unauthenticated uploads
  const authHeader = request.headers.get('authorization')
  const authCookie = request.cookies.get('auth-token')?.value
  if (!authHeader && !authCookie) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const targetNode = formData.get('targetNode') as string
    const targetPath = formData.get('targetPath') as string
    const uploadedFiles: { name: string; path: string; size: number }[] = []
    const resolvedBasePath = path.resolve(UPLOAD_BASE_PATH)

    // Process all files in the form data
    const entries = Array.from(formData.entries())

    for (const [key, value] of entries) {
      if (key.startsWith('file') && value instanceof File) {
        const fileIndex = key.replace('file', '')
        const relativePath = formData.get(`path${fileIndex}`) as string || value.name

        // Validate file size
        if (value.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            { success: false, error: `File "${value.name}" exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
            { status: 400 }
          )
        }

        // Validate file extension
        const ext = path.extname(value.name).toLowerCase()
        if (BLOCKED_EXTENSIONS.has(ext)) {
          return NextResponse.json(
            { success: false, error: `File type "${ext}" is not allowed` },
            { status: 400 }
          )
        }

        // Create the full path where the file will be saved
        let fullPath = UPLOAD_BASE_PATH

        // If targetPath is specified, use the actual folder path from the tree
        if (targetPath && targetPath !== '') {
          // Sanitize targetPath: strip any .. segments
          const safeTargetPath = targetPath.split(/[/\\]/).filter(seg => seg !== '..' && seg !== '.').join(path.sep)
          fullPath = path.join(fullPath, safeTargetPath)
        }

        // Create the directory structure based on the file's relative path
        // Only use the directory part, sanitized to prevent traversal
        const fileDir = path.dirname(relativePath)
        if (fileDir && fileDir !== '.') {
          const safeFileDir = fileDir.split(/[/\\]/).filter(seg => seg !== '..' && seg !== '.').join(path.sep)
          fullPath = path.join(fullPath, safeFileDir)
        }

        // Security check: ensure the resolved path is within UPLOAD_BASE_PATH
        const resolvedFullPath = path.resolve(fullPath)
        if (!resolvedFullPath.startsWith(resolvedBasePath)) {
          return NextResponse.json(
            { success: false, error: 'Invalid upload path' },
            { status: 403 }
          )
        }

        // Ensure the directory exists
        await mkdir(fullPath, { recursive: true })

        // Write the file — use basename to prevent any remaining path tricks
        const fileName = path.basename(relativePath)
        const filePath = path.join(fullPath, fileName)

        // Final security check on the complete file path
        const resolvedFilePath = path.resolve(filePath)
        if (!resolvedFilePath.startsWith(resolvedBasePath)) {
          return NextResponse.json(
            { success: false, error: 'Invalid file path' },
            { status: 403 }
          )
        }

        const bytes = await value.arrayBuffer()
        const buffer = Buffer.from(bytes)

        await writeFile(filePath, buffer)

        uploadedFiles.push({
          name: fileName,
          path: filePath,
          size: value.size
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    })

  } catch (error) {
    console.error('Upload error:', error instanceof Error ? error.message : 'Unknown')
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    )
  }
}