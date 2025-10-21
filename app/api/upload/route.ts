import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { UPLOAD_BASE_PATH } from '../../../config/paths'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const targetNode = formData.get('targetNode') as string
    const targetPath = formData.get('targetPath') as string
    const uploadedFiles: { name: string; path: string; size: number }[] = []

    // Process all files in the form data
    const entries = Array.from(formData.entries())

    for (const [key, value] of entries) {
      if (key.startsWith('file') && value instanceof File) {
        const fileIndex = key.replace('file', '')
        const relativePath = formData.get(`path${fileIndex}`) as string || value.name

        // Create the full path where the file will be saved
        let fullPath = UPLOAD_BASE_PATH

        // If targetPath is specified, use the actual folder path from the tree
        if (targetPath && targetPath !== '') {
          fullPath = path.join(fullPath, targetPath)
        }

        // Create the directory structure based on the file's relative path
        const fileDir = path.dirname(relativePath)
        if (fileDir && fileDir !== '.') {
          fullPath = path.join(fullPath, fileDir)
        }

        // Ensure the directory exists
        try {
          await mkdir(fullPath, { recursive: true })
        } catch (error) {
          console.log('Directory already exists or error creating:', error)
        }

        // Write the file
        const fileName = path.basename(relativePath)
        const filePath = path.join(fullPath, fileName)
        const bytes = await value.arrayBuffer()
        const buffer = Buffer.from(bytes)

        await writeFile(filePath, buffer)

        uploadedFiles.push({
          name: fileName,
          path: filePath,
          size: value.size
        })

        console.log(`File uploaded: ${filePath}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    )
  }
}