"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import type { ParsedTask } from "../../utils/importParsers"
import { buildCreateTaskRequest } from "../../utils/importParsers"

// Throttle: delay between requests to avoid 429s
const DELAY_MS = 300
// Send in batches — pause longer every N requests
const BATCH_SIZE = 10
const BATCH_PAUSE_MS = 1500
// On 429, wait this long then retry
const RETRY_DELAYS = [2000, 4000, 8000]
const MAX_RETRIES = RETRY_DELAYS.length

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface ImportProgressStepProps {
  tasks: ParsedTask[]
  projectId: string
  onComplete: () => void
  onClose: () => void
}

interface ImportResult {
  succeeded: number
  failed: number
  errors: string[]
  cancelled: boolean
}

export function ImportProgressStep({
  tasks,
  projectId,
  onComplete,
  onClose,
}: ImportProgressStepProps) {
  const [current, setCurrent] = useState(0)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [currentTitle, setCurrentTitle] = useState("")
  const [retrying, setRetrying] = useState(false)
  const cancelRef = useRef(false)
  const startedRef = useRef(false)

  const total = tasks.length
  const progress = total > 0 ? Math.round((current / total) * 100) : 0

  const createWithRetry = async (request: ReturnType<typeof buildCreateTaskRequest>) => {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        await bmsApi.tasks.create(request)
        return
      } catch (err) {
        const is429 =
          (err instanceof BmsApiError && err.status === 429) ||
          (err instanceof Error && err.message.includes("429"))
        if (is429 && attempt < MAX_RETRIES) {
          setRetrying(true)
          await sleep(RETRY_DELAYS[attempt])
          setRetrying(false)
          continue
        }
        throw err
      }
    }
  }

  const runImport = useCallback(async () => {
    if (startedRef.current) return
    startedRef.current = true

    let succeeded = 0
    let failed = 0
    const errors: string[] = []

    for (let i = 0; i < tasks.length; i++) {
      if (cancelRef.current) {
        setResult({ succeeded, failed, errors, cancelled: true })
        return
      }

      const task = tasks[i]
      setCurrentTitle(task.title)
      setCurrent(i)

      try {
        const request = buildCreateTaskRequest(task, projectId)
        await createWithRetry(request)
        succeeded++
      } catch (err) {
        failed++
        const msg = err instanceof Error ? err.message : "Unknown error"
        errors.push(`"${task.title}": ${msg}`)
      }

      setCurrent(i + 1)

      // Throttle between requests
      if (i < tasks.length - 1) {
        // Longer pause every BATCH_SIZE requests
        if ((i + 1) % BATCH_SIZE === 0) {
          await sleep(BATCH_PAUSE_MS)
        } else {
          await sleep(DELAY_MS)
        }
      }
    }

    setResult({ succeeded, failed, errors, cancelled: false })
  }, [tasks, projectId])

  useEffect(() => {
    runImport()
  }, [runImport])

  const handleCancel = () => {
    cancelRef.current = true
  }

  const handleDone = () => {
    onComplete()
    onClose()
  }

  // Still importing
  if (!result) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-3 text-accent-cyan animate-spin" />
          <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
            Importing task {current + 1} of {total}...
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 truncate max-w-[400px] mx-auto">
            {currentTitle}
          </p>
          {retrying && (
            <p className="text-xs text-amber-500 mt-1">Rate limited — waiting to retry...</p>
          )}
        </div>

        <Progress value={progress} className="h-2 bg-stone-200 dark:bg-stone-700 [&>div]:bg-accent-cyan" />

        <div className="text-center">
          <p className="text-xs text-stone-400 dark:text-stone-500 mb-3">
            {progress}% complete
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/30"
          >
            Cancel Import
          </Button>
        </div>
      </div>
    )
  }

  // Import complete
  const allSucceeded = result.succeeded === total && !result.cancelled
  const hasFailures = result.failed > 0
  const wasCancelled = result.cancelled

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        {allSucceeded ? (
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
        ) : wasCancelled ? (
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
        ) : (
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-amber-500" />
        )}

        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {allSucceeded
            ? "Import Complete!"
            : wasCancelled
            ? "Import Cancelled"
            : "Import Finished with Errors"}
        </h3>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6">
        {result.succeeded > 0 && (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-stone-700 dark:text-stone-300">
              {result.succeeded} imported
            </span>
          </div>
        )}
        {result.failed > 0 && (
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-stone-700 dark:text-stone-300">
              {result.failed} failed
            </span>
          </div>
        )}
        {wasCancelled && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-stone-700 dark:text-stone-300">
              {total - current} skipped
            </span>
          </div>
        )}
      </div>

      {/* Error details */}
      {hasFailures && result.errors.length > 0 && (
        <div className="max-h-[150px] overflow-auto p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
          <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-2">
            Failed tasks:
          </p>
          <ul className="space-y-1">
            {result.errors.map((err, i) => (
              <li key={i} className="text-xs text-red-600 dark:text-red-400">
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center">
        <Button
          onClick={handleDone}
          className="bg-accent-cyan hover:bg-accent-cyan/90 text-white"
        >
          Done
        </Button>
      </div>
    </div>
  )
}
