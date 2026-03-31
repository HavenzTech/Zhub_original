"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { FileJson, Check } from "lucide-react"
import { FileUploadStep } from "./FileUploadStep"
import { ColumnMappingStep } from "./ColumnMappingStep"
import { PreviewEditStep } from "./PreviewEditStep"
import { ImportProgressStep } from "./ImportProgressStep"
import type { ParsedTask, DetectionResult } from "../../utils/importParsers"

type ImportStep = "upload" | "column-mapping" | "preview" | "importing"

interface StepDef {
  key: ImportStep
  label: string
  number: number
}

interface ImportTasksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  onImportComplete: () => void
}

export function ImportTasksDialog({
  open,
  onOpenChange,
  projectId,
  onImportComplete,
}: ImportTasksDialogProps) {
  const [step, setStep] = useState<ImportStep>("upload")
  const [importDone, setImportDone] = useState(false)
  const [tasks, setTasks] = useState<ParsedTask[]>([])
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRows, setCsvRows] = useState<string[][]>([])
  const [detectedSource, setDetectedSource] = useState("")
  const [uploadError, setUploadError] = useState("")

  const reset = useCallback(() => {
    setStep("upload")
    setImportDone(false)
    setTasks([])
    setCsvHeaders([])
    setCsvRows([])
    setDetectedSource("")
    setUploadError("")
  }, [])

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        // Block closing mid-import (but allow after import finishes)
        if (step === "importing" && !importDone) return
        reset()
      }
      onOpenChange(open)
    },
    [onOpenChange, reset, step, importDone]
  )

  const handleFileParsed = useCallback(
    (result: DetectionResult, _fileName: string) => {
      if (result.format === "csv" && result.headers) {
        setCsvHeaders(result.headers)
        setCsvRows(result.rows || [])
        setDetectedSource("CSV")
        setStep("column-mapping")
      } else if (result.format === "trello-json") {
        setTasks(result.tasks)
        setDetectedSource("Trello")
        setStep("preview")
      } else if (result.format === "generic-json") {
        setTasks(result.tasks)
        setDetectedSource("JSON")
        setStep("preview")
      }
    },
    []
  )

  const handleMappingComplete = useCallback((mappedTasks: ParsedTask[]) => {
    setTasks(mappedTasks)
    setStep("preview")
  }, [])

  const handleConfirmImport = useCallback(() => {
    const selected = tasks.filter((t) => t._selected)
    setTasks(selected)
    setStep("importing")
  }, [tasks])

  const handleImportComplete = useCallback(() => {
    setImportDone(true)
    onImportComplete()
  }, [onImportComplete])

  // Build visible steps
  const allSteps: StepDef[] = csvHeaders.length > 0
    ? [
        { key: "upload", label: "Upload", number: 1 },
        { key: "column-mapping", label: "Map Columns", number: 2 },
        { key: "preview", label: "Review", number: 3 },
        { key: "importing", label: "Import", number: 4 },
      ]
    : [
        { key: "upload", label: "Upload", number: 1 },
        { key: "preview", label: "Review", number: 2 },
        { key: "importing", label: "Import", number: 3 },
      ]

  const currentStepIdx = allSteps.findIndex((s) => s.key === step)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`${step === "preview" || step === "importing" ? "max-w-5xl h-[90vh]" : "max-w-xl"} max-h-[90vh] !flex !flex-col !gap-0 p-0 overflow-hidden transition-all duration-300`}>
        {/* Fixed header */}
        <div className="shrink-0 px-6 pt-6 pb-4 border-b border-stone-200 dark:border-stone-700">
          <DialogHeader className="mb-4">
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="w-5 h-5" />
              Import Tasks
            </DialogTitle>
            <DialogDescription>
              Upload tasks from Trello, Jira, Asana, or any tool that exports CSV/JSON.
            </DialogDescription>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-0">
            {allSteps.map((s, i) => {
              const isActive = s.key === step
              const isPast = currentStepIdx > i
              return (
                <div key={s.key} className="flex items-center">
                  {i > 0 && (
                    <div className={`w-8 h-px ${isPast ? "bg-accent-cyan" : "bg-stone-200 dark:bg-stone-700"}`} />
                  )}
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors ${
                        isActive
                          ? "bg-accent-cyan text-white"
                          : isPast
                          ? "bg-accent-cyan/20 text-accent-cyan"
                          : "bg-stone-200 dark:bg-stone-700 text-stone-500 dark:text-stone-400"
                      }`}
                    >
                      {isPast ? <Check className="w-3 h-3" /> : s.number}
                    </div>
                    <span
                      className={`text-xs transition-colors ${
                        isActive
                          ? "text-accent-cyan font-medium"
                          : isPast
                          ? "text-accent-cyan/70"
                          : "text-stone-400 dark:text-stone-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Scrollable content area */}
        <div className={`${step === "preview" || step === "importing" ? "flex-1 min-h-0" : ""} overflow-y-auto px-6 py-4`}>
          {step === "upload" && (
            <FileUploadStep
              onFileParsed={handleFileParsed}
              error={uploadError}
              onError={setUploadError}
            />
          )}

          {step === "column-mapping" && (
            <ColumnMappingStep
              headers={csvHeaders}
              rows={csvRows}
              onMappingComplete={handleMappingComplete}
              onBack={() => {
                setStep("upload")
                setCsvHeaders([])
                setCsvRows([])
              }}
            />
          )}

          {step === "preview" && (
            <PreviewEditStep
              tasks={tasks}
              onTasksChange={setTasks}
              onConfirm={handleConfirmImport}
              onBack={() => {
                if (csvHeaders.length > 0) {
                  setStep("column-mapping")
                } else {
                  setStep("upload")
                  setTasks([])
                }
              }}
              detectedSource={detectedSource}
            />
          )}

          {step === "importing" && (
            <ImportProgressStep
              tasks={tasks}
              projectId={projectId}
              onComplete={handleImportComplete}
              onClose={() => handleClose(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
