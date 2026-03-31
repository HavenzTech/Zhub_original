"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, ArrowRight, AlertCircle } from "lucide-react"
import {
  autoSuggestMapping,
  applyColumnMapping,
  TASK_FIELD_OPTIONS,
  type ParsedTask,
} from "../../utils/importParsers"

interface ColumnMappingStepProps {
  headers: string[]
  rows: string[][]
  onMappingComplete: (tasks: ParsedTask[]) => void
  onBack: () => void
}

const SKIP_VALUE = "__skip__"

export function ColumnMappingStep({
  headers,
  rows,
  onMappingComplete,
  onBack,
}: ColumnMappingStepProps) {
  // Auto-suggest initial mapping
  const initialMapping = useMemo(() => autoSuggestMapping(headers), [headers])

  // mapping: task field name → column index (or -1 for skip)
  const [mapping, setMapping] = useState<Record<string, number>>(() => {
    const m: Record<string, number> = {}
    for (const field of TASK_FIELD_OPTIONS) {
      m[field.value] = initialMapping[field.value] ?? -1
    }
    return m
  })

  const sampleRow = rows[0] || []
  const titleMapped = mapping.title >= 0

  // Reverse mapping: column index → field name (to show which columns are taken)
  const columnToField = useMemo(() => {
    const map = new Map<number, string>()
    for (const [field, colIdx] of Object.entries(mapping)) {
      if (colIdx >= 0) map.set(colIdx, field)
    }
    return map
  }, [mapping])

  const unmappedCount = headers.filter((_, i) => !columnToField.has(i)).length

  const handleFieldMapping = (field: string, value: string) => {
    setMapping((prev) => ({
      ...prev,
      [field]: value === SKIP_VALUE ? -1 : parseInt(value, 10),
    }))
  }

  const handleContinue = () => {
    // Filter out skipped fields
    const activeMapping: Record<string, number> = {}
    for (const [field, colIdx] of Object.entries(mapping)) {
      if (colIdx >= 0) activeMapping[field] = colIdx
    }
    const tasks = applyColumnMapping(headers, rows, activeMapping)
    onMappingComplete(tasks)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-stone-700 dark:text-stone-300">
            Map your CSV columns to task fields
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            {headers.length} columns detected &middot; {rows.length} data rows
            {unmappedCount > 0 && (
              <span> &middot; {unmappedCount} unmapped columns will go to Notes</span>
            )}
          </p>
        </div>
      </div>

      {/* Mapping table */}
      <div className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
            <tr>
              <th className="text-left px-3 py-2 font-medium text-stone-600 dark:text-stone-400 w-[140px]">
                Task Field
              </th>
              <th className="text-left px-3 py-2 font-medium text-stone-600 dark:text-stone-400">
                CSV Column
              </th>
              <th className="text-left px-3 py-2 font-medium text-stone-600 dark:text-stone-400">
                Preview (Row 1)
              </th>
            </tr>
          </thead>
          <tbody>
            {TASK_FIELD_OPTIONS.map((field) => {
              const colIdx = mapping[field.value]
              const previewValue = colIdx >= 0 ? sampleRow[colIdx] || "" : ""
              return (
                <tr
                  key={field.value}
                  className="border-b border-stone-100 dark:border-stone-800 last:border-0"
                >
                  <td className="px-3 py-2">
                    <span className="text-stone-900 dark:text-stone-100">
                      {field.label}
                      {"required" in field && field.required && <span className="text-red-500 ml-0.5">*</span>}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <Select
                      value={colIdx >= 0 ? String(colIdx) : SKIP_VALUE}
                      onValueChange={(v) => handleFieldMapping(field.value, v)}
                    >
                      <SelectTrigger className="h-8 text-xs w-full max-w-[220px]">
                        <SelectValue placeholder="-- Skip --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SKIP_VALUE}>
                          <span className="text-stone-400">-- Skip --</span>
                        </SelectItem>
                        {headers.map((header, i) => {
                          const takenBy = columnToField.get(i)
                          const isTaken = takenBy !== undefined && takenBy !== field.value
                          return (
                            <SelectItem key={i} value={String(i)} disabled={isTaken}>
                              {header}
                              {isTaken && (
                                <span className="text-stone-400 ml-1">
                                  (used)
                                </span>
                              )}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-3 py-2 text-xs text-stone-500 dark:text-stone-400 max-w-[200px] truncate">
                    {previewValue || (
                      <span className="text-stone-300 dark:text-stone-600 italic">empty</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Title required warning */}
      {!titleMapped && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            The <strong>Title</strong> field is required. Please map a CSV column to it.
          </p>
        </div>
      )}

      {/* Unmapped info */}
      {unmappedCount > 0 && (
        <p className="text-xs text-stone-400 dark:text-stone-500">
          {unmappedCount} unmapped column{unmappedCount !== 1 ? "s" : ""} will be preserved as key-value pairs in each task&apos;s Notes field.
        </p>
      )}

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button
          onClick={handleContinue}
          disabled={!titleMapped}
          className="bg-accent-cyan hover:bg-accent-cyan/90 text-white"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
