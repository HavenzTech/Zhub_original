"use client"

import { useState, useRef, useCallback } from "react"
import { Upload, FileJson, FileSpreadsheet, AlertCircle, File, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DetectionResult } from "../../utils/importParsers"
import { detectFormat } from "../../utils/importParsers"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

interface FileUploadStepProps {
  onFileParsed: (result: DetectionResult, fileName: string) => void
  error?: string
  onError: (message: string) => void
}

export function FileUploadStep({ onFileParsed, error, onError }: FileUploadStepProps) {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        onError("File is too large. Maximum size is 5MB.")
        return
      }

      const isJson = file.name.endsWith(".json") || file.type === "application/json"
      const isCsv = file.name.endsWith(".csv") || file.type === "text/csv"
      if (!isJson && !isCsv) {
        onError("Unsupported file type. Please upload a .csv or .json file.")
        return
      }

      setSelectedFile(file)
      setProcessing(true)
      onError("")

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const result = detectFormat(content, file.name)
        setProcessing(false)
        if (result.error && result.tasks.length === 0 && !result.headers) {
          onError(result.error)
          return
        }
        onFileParsed(result, file.name)
      }
      reader.onerror = () => {
        setProcessing(false)
        onError("Failed to read the file.")
      }
      reader.readAsText(file)
    },
    [onFileParsed, onError]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const clearFile = () => {
    setSelectedFile(null)
    onError("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-accent-cyan bg-accent-cyan/5"
            : "border-stone-300 dark:border-stone-600 hover:border-accent-cyan/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-10 h-10 mx-auto mb-3 text-stone-400 dark:text-stone-500" />
        <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
          Drop your CSV or JSON file here, or click to browse
        </p>
        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
          Supports Trello, Jira, Asana, Monday, ClickUp, and more (max 5MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json,application/json,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) processFile(file)
          }}
        />
      </div>

      {/* Selected file preview */}
      {selectedFile && !processing && (
        <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
          {selectedFile.name.endsWith(".json") ? (
            <FileJson className="w-5 h-5 text-accent-cyan shrink-0" />
          ) : (
            <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {formatSize(selectedFile.size)}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearFile() }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Processing indicator */}
      {processing && (
        <div className="flex items-center justify-center gap-2 p-4">
          <div className="w-4 h-4 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-stone-500 dark:text-stone-400">Processing file...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Format help */}
      <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg text-xs text-stone-500 dark:text-stone-400 space-y-2">
        <p className="font-medium text-stone-700 dark:text-stone-300">Supported formats:</p>
        <div className="flex items-start gap-2">
          <FileJson className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p>
            <strong>Trello JSON</strong> &mdash; Export from Board Menu &rarr; More &rarr; Print and Export &rarr; Export as JSON
          </p>
        </div>
        <div className="flex items-start gap-2">
          <FileSpreadsheet className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p>
            <strong>CSV</strong> &mdash; Works with exports from Jira, Asana, Monday, ClickUp, Linear, and most PM tools. You&apos;ll map columns to task fields.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <File className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p>
            <strong>Generic JSON</strong> &mdash; Any JSON array of objects with a &quot;title&quot; or &quot;name&quot; field.
          </p>
        </div>
        <p className="text-stone-400 dark:text-stone-500 pt-1">
          Fields that don&apos;t map to our task fields are preserved in the Notes field.
        </p>
      </div>
    </div>
  )
}
