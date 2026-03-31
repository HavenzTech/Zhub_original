"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Trash2,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  X,
} from "lucide-react"
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from "../../utils/taskHelpers"
import type { ParsedTask } from "../../utils/importParsers"

interface PreviewEditStepProps {
  tasks: ParsedTask[]
  onTasksChange: (tasks: ParsedTask[]) => void
  onConfirm: () => void
  onBack: () => void
  detectedSource: string
}

const PAGE_SIZE = 50

const STATUS_COLORS: Record<string, string> = {
  todo: "bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  in_review: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-stone-100 text-stone-600 dark:bg-stone-700 dark:text-stone-400",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
}

export function PreviewEditStep({
  tasks,
  onTasksChange,
  onConfirm,
  onBack,
  detectedSource,
}: PreviewEditStepProps) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [editingRow, setEditingRow] = useState<number | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const selectedCount = tasks.filter((t) => t._selected).length
  const allSelected = tasks.length > 0 && selectedCount === tasks.length
  const someSelected = selectedCount > 0 && !allSelected
  const invalidTasks = tasks.filter((t) => t._selected && !t.title.trim())

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const t of tasks) {
      counts[t.status] = (counts[t.status] || 0) + 1
    }
    return counts
  }, [tasks])

  // Filtered tasks (search + status filter)
  const filteredIndices = useMemo(() => {
    const lowerSearch = search.toLowerCase()
    return tasks
      .map((t, i) => ({ task: t, index: i }))
      .filter(({ task }) => {
        if (statusFilter && task.status !== statusFilter) return false
        if (search && !task.title.toLowerCase().includes(lowerSearch) && !task.description.toLowerCase().includes(lowerSearch)) return false
        return true
      })
      .map(({ index }) => index)
  }, [tasks, search, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredIndices.length / PAGE_SIZE)
  const pageIndices = filteredIndices.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Reset page when search/filter changes
  const handleSearch = (val: string) => {
    setSearch(val)
    setPage(0)
  }
  const handleStatusFilter = (status: string | null) => {
    setStatusFilter(status)
    setPage(0)
  }

  const updateTask = (globalIndex: number, updates: Partial<ParsedTask>) => {
    const updated = [...tasks]
    updated[globalIndex] = { ...updated[globalIndex], ...updates }
    onTasksChange(updated)
  }

  const removeTask = (globalIndex: number) => {
    onTasksChange(tasks.filter((_, i) => i !== globalIndex))
    setEditingRow(null)
  }

  const toggleAll = () => {
    const newVal = !allSelected
    onTasksChange(tasks.map((t) => ({ ...t, _selected: newVal })))
  }

  // Toggle selection for only visible/filtered tasks
  const toggleFiltered = () => {
    const allFilteredSelected = filteredIndices.every((i) => tasks[i]._selected)
    const updated = [...tasks]
    for (const i of filteredIndices) {
      updated[i] = { ...updated[i], _selected: !allFilteredSelected }
    }
    onTasksChange(updated)
  }

  // Bulk actions on visible selected tasks
  const bulkSetStatus = (status: string) => {
    const updated = [...tasks]
    for (const i of filteredIndices) {
      if (updated[i]._selected) updated[i] = { ...updated[i], status }
    }
    onTasksChange(updated)
  }
  const bulkSetPriority = (priority: string) => {
    const updated = [...tasks]
    for (const i of filteredIndices) {
      if (updated[i]._selected) updated[i] = { ...updated[i], priority }
    }
    onTasksChange(updated)
  }

  const filteredSelectedCount = filteredIndices.filter((i) => tasks[i]._selected).length

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Top bar: counts + source badge */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            {tasks.length} tasks
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {selectedCount} selected
          </span>
          {detectedSource && (
            <span className="text-xs px-2 py-0.5 rounded-md border border-accent-cyan/30 text-accent-cyan font-medium">
              {detectedSource}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected ? true : someSelected ? "indeterminate" : false}
            onCheckedChange={toggleAll}
          />
          <span className="text-xs text-stone-500 dark:text-stone-400">All</span>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
        <button
          onClick={() => handleStatusFilter(null)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
            !statusFilter
              ? "text-accent-cyan border-accent-cyan bg-accent-cyan/5"
              : "text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500"
          }`}
        >
          All ({tasks.length})
        </button>
        {TASK_STATUS_OPTIONS.map((opt) => {
          const count = statusBreakdown[opt.value] || 0
          if (count === 0) return null
          return (
            <button
              key={opt.value}
              onClick={() => handleStatusFilter(statusFilter === opt.value ? null : opt.value)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                statusFilter === opt.value
                  ? "text-accent-cyan border-accent-cyan bg-accent-cyan/5"
                  : "text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500"
              }`}
            >
              {opt.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Search + bulk actions */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search tasks..."
            className="h-8 text-xs pl-8"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {filteredSelectedCount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-stone-400 shrink-0">Bulk:</span>
            <Select onValueChange={bulkSetStatus}>
              <SelectTrigger className="h-8 text-xs w-[110px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={bulkSetPriority}>
              <SelectTrigger className="h-8 text-xs w-[100px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {TASK_PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={toggleFiltered}
            >
              {filteredIndices.every((i) => tasks[i]._selected) ? "Deselect" : "Select"} shown
            </Button>
          </div>
        )}
      </div>

      {/* Task table */}
      <div className="flex-1 min-h-0 overflow-auto border border-stone-200 dark:border-stone-700 rounded-lg">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
            <tr>
              <th className="w-8 px-2 py-2" />
              <th className="text-left px-2 py-2 font-medium text-stone-600 dark:text-stone-400 w-10">#</th>
              <th className="text-left px-2 py-2 font-medium text-stone-600 dark:text-stone-400">Title</th>
              <th className="text-left px-2 py-2 font-medium text-stone-600 dark:text-stone-400 w-[100px]">Status</th>
              <th className="text-left px-2 py-2 font-medium text-stone-600 dark:text-stone-400 w-[90px]">Priority</th>
              <th className="text-left px-2 py-2 font-medium text-stone-600 dark:text-stone-400 w-[110px]">Due Date</th>
              <th className="w-16 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {pageIndices.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-sm text-stone-400 dark:text-stone-500">
                  {search ? "No tasks match your search." : "No tasks to show."}
                </td>
              </tr>
            )}
            {pageIndices.map((globalIdx) => {
              const task = tasks[globalIdx]
              const hasError = task._selected && !task.title.trim()
              const isEditing = editingRow === globalIdx

              return (
                <tr
                  key={globalIdx}
                  className={`border-b border-stone-100 dark:border-stone-800 last:border-0 transition-colors ${
                    !task._selected ? "opacity-40" : ""
                  } ${hasError ? "bg-red-50/50 dark:bg-red-950/10" : "hover:bg-stone-50/50 dark:hover:bg-stone-800/30"}`}
                >
                  {/* Checkbox */}
                  <td className="px-2 py-1.5 align-top">
                    <Checkbox
                      checked={task._selected}
                      onCheckedChange={(checked) => updateTask(globalIdx, { _selected: !!checked })}
                    />
                  </td>

                  {/* Row number */}
                  <td className="px-2 py-1.5 text-xs text-stone-400 align-top pt-2.5">
                    {globalIdx + 1}
                  </td>

                  {/* Title + description */}
                  <td className="px-2 py-1.5">
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <Input
                          autoFocus
                          value={task.title}
                          onChange={(e) => updateTask(globalIdx, { title: e.target.value })}
                          className={`h-7 text-xs ${hasError ? "border-red-300 dark:border-red-700" : ""}`}
                          placeholder="Task title (required)"
                        />
                        <textarea
                          value={task.description}
                          onChange={(e) => updateTask(globalIdx, { description: e.target.value })}
                          className="w-full text-xs p-2 rounded border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 resize-y"
                          rows={2}
                          placeholder="Description..."
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <Input
                            type="date"
                            value={task.dueDate}
                            onChange={(e) => updateTask(globalIdx, { dueDate: e.target.value })}
                            className="h-7 text-xs"
                          />
                          <Input
                            value={task.tags}
                            onChange={(e) => updateTask(globalIdx, { tags: e.target.value })}
                            className="h-7 text-xs"
                            placeholder="Tags"
                          />
                        </div>
                        {task.notes && (
                          <textarea
                            value={task.notes}
                            onChange={(e) => updateTask(globalIdx, { notes: e.target.value })}
                            className="w-full text-xs p-2 rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400 resize-y"
                            rows={2}
                            placeholder="Notes (unmapped fields)"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="max-w-[300px]">
                        <p className={`text-sm text-stone-900 dark:text-stone-100 leading-tight truncate ${hasError ? "text-red-600 dark:text-red-400" : ""}`}>
                          {task.title || <span className="italic text-red-400">Missing title</span>}
                        </p>
                        {task.description && (
                          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                            {task.description}
                          </p>
                        )}
                        {task.tags && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {task.tags.split(",").slice(0, 3).map((tag, ti) => (
                              <span key={ti} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400">
                                {tag.trim()}
                              </span>
                            ))}
                            {task.tags.split(",").length > 3 && (
                              <span className="text-[10px] text-stone-400">+{task.tags.split(",").length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-2 py-1.5 align-top">
                    {isEditing ? (
                      <Select value={task.status} onValueChange={(v) => updateTask(globalIdx, { status: v })}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TASK_STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium whitespace-nowrap ${STATUS_COLORS[task.status] || ""}`}>
                        {task.status.replace(/_/g, " ")}
                      </span>
                    )}
                  </td>

                  {/* Priority */}
                  <td className="px-2 py-1.5 align-top">
                    {isEditing ? (
                      <Select value={task.priority} onValueChange={(v) => updateTask(globalIdx, { priority: v })}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TASK_PRIORITY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${PRIORITY_COLORS[task.priority] || ""}`}>
                        {task.priority}
                      </span>
                    )}
                  </td>

                  {/* Due Date */}
                  <td className="px-2 py-1.5 text-xs text-stone-500 dark:text-stone-400 align-top pt-2.5">
                    {task.dueDate || <span className="text-stone-300 dark:text-stone-600">&mdash;</span>}
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-1.5 align-top">
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-stone-400 hover:text-accent-cyan"
                        onClick={() => setEditingRow(isEditing ? null : globalIdx)}
                      >
                        {isEditing ? <X className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-stone-400 hover:text-red-500"
                        onClick={() => removeTask(globalIdx)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination + validation + actions */}
      <div className="shrink-0 space-y-2">
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Showing {page * PAGE_SIZE + 1}&ndash;{Math.min((page + 1) * PAGE_SIZE, filteredIndices.length)} of {filteredIndices.length}
              {filteredIndices.length !== tasks.length && ` (filtered from ${tasks.length})`}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 0} onClick={() => setPage(0)}>
                <ChevronsLeft className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 0} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs text-stone-600 dark:text-stone-400 px-2">
                {page + 1} / {totalPages}
              </span>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
              <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
                <ChevronsRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Validation warning */}
        {invalidTasks.length > 0 && (
          <div className="flex items-start gap-2 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-400">
              {invalidTasks.length} selected task{invalidTasks.length !== 1 ? "s" : ""} missing a title.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-1">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={selectedCount === 0 || invalidTasks.length > 0}
            className="bg-accent-cyan hover:bg-accent-cyan/90 text-white"
          >
            Import {selectedCount} Task{selectedCount !== 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </div>
  )
}
