"use client"

import { useState, useCallback } from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { TaskCard } from "./TaskCard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  CheckSquare,
  Grid3X3,
  List,
  Minus,
  Search,
  Filter,
  X,
} from "lucide-react"
import type { TaskDto } from "@/types/bms"
import {
  getTaskStatusColor,
  getTaskStatusLabel,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from "../utils/taskHelpers"

interface TaskListProps {
  tasks: TaskDto[]
  loading?: boolean
  onStatusChange?: (task: TaskDto, status: string) => void
  onEdit?: (task: TaskDto) => void
  onDelete?: (task: TaskDto) => void
  onClick?: (task: TaskDto) => void
  onToggleComplete?: (task: TaskDto) => void
  showProject?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canChangeStatus?: boolean
  emptyMessage?: string
}

export function TaskList({
  tasks,
  loading,
  onStatusChange,
  onEdit,
  onDelete,
  onClick,
  onToggleComplete,
  showProject = true,
  canEdit = true,
  canDelete = true,
  canChangeStatus = true,
  emptyMessage = "No tasks found",
}: TaskListProps) {
  const [view, setView] = useState<"list" | "kanban">("list")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [prioritySort, setPrioritySort] = useState<"none" | "desc" | "asc">("none")

  // Priority order: critical > high > medium > low
  const PRIORITY_ORDER: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchTerm ||
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority =
      priorityFilter === "all" || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Sort by priority if enabled
  const sortedTasks = prioritySort === "none"
    ? filteredTasks
    : [...filteredTasks].sort((a, b) => {
        const aOrder = PRIORITY_ORDER[a.priority?.toLowerCase() ?? "medium"] ?? 2
        const bOrder = PRIORITY_ORDER[b.priority?.toLowerCase() ?? "medium"] ?? 2
        return prioritySort === "desc" ? aOrder - bOrder : bOrder - aOrder
      })

  // Group tasks by status for kanban view
  const tasksByStatus = TASK_STATUS_OPTIONS.reduce((acc, status) => {
    acc[status.value] = sortedTasks.filter((t) => t.status === status.value)
    return acc
  }, {} as Record<string, TaskDto[]>)

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, draggableId } = result
    if (!destination) return

    const newStatus = destination.droppableId
    const task = sortedTasks.find((t) => t.id === draggableId)
    if (!task || task.status === newStatus) return

    onStatusChange?.(task, newStatus)
  }, [sortedTasks, onStatusChange])

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setPriorityFilter("all")
  }

  const hasFilters = searchTerm || statusFilter !== "all" || priorityFilter !== "all"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-cyan mx-auto mb-4"></div>
          <p className="text-sm text-stone-600 dark:text-stone-400">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-48">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400 dark:text-stone-500" />
            <Input
              placeholder="Search tasks..."
              className="pl-10 border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-50 dark:placeholder:text-stone-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? "" : "border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:border-stone-600 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200"}
          >
            <Filter className="w-4 h-4 mr-1" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          {showFilters && (
            <>
              <div className="w-36">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 border-stone-300 bg-white text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
                    <SelectItem value="all">All Statuses</SelectItem>
                    {TASK_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-36">
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-9 border-stone-300 bg-white text-stone-900 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-50">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-800">
                    <SelectItem value="all">All Priorities</SelectItem>
                    {TASK_PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={prioritySort !== "none" ? "secondary" : "outline"}
            size="sm"
            onClick={() =>
              setPrioritySort((prev) =>
                prev === "none" ? "desc" : prev === "desc" ? "asc" : "none"
              )
            }
            className={prioritySort !== "none" ? "" : "border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:border-stone-600 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200"}
            title={
              prioritySort === "none"
                ? "Sort by priority"
                : prioritySort === "desc"
                ? "Critical first"
                : "Low first"
            }
          >
            {prioritySort === "desc" ? (
              <ArrowDownWideNarrow className="w-4 h-4 mr-1" />
            ) : prioritySort === "asc" ? (
              <ArrowUpWideNarrow className="w-4 h-4 mr-1" />
            ) : (
              <Minus className="w-4 h-4 mr-1" />
            )}
            {prioritySort === "desc"
              ? "Critical First"
              : prioritySort === "asc"
              ? "Critical Last"
              : "Sort Priority"}
          </Button>
          <Badge variant="secondary">
            {sortedTasks.length} {sortedTasks.length === 1 ? "task" : "tasks"}
          </Badge>
          <Tabs value={view} onValueChange={(v) => setView(v as "list" | "kanban")}>
            <TabsList className="h-8">
              <TabsTrigger value="list" className="px-2">
                <List className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="kanban" className="px-2">
                <Grid3X3 className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Task Views */}
      {sortedTasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-stone-400 dark:text-stone-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-2">
            {emptyMessage}
          </h3>
          {hasFilters && (
            <p className="text-stone-600 dark:text-stone-400 mb-4">Try adjusting your filters</p>
          )}
        </div>
      ) : view === "list" ? (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onClick}
              onToggleComplete={onToggleComplete}
              showProject={showProject}
              canEdit={canEdit}
              canDelete={canDelete}
              canChangeStatus={canChangeStatus}
            />
          ))}
        </div>
      ) : (
        // Kanban view with drag and drop
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
            {TASK_STATUS_OPTIONS.filter(s => s.value !== "cancelled").map((status) => (
              <Droppable key={status.value} droppableId={status.value}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-lg p-3 min-w-[250px] border transition-colors ${
                      snapshot.isDraggingOver
                        ? "bg-accent-cyan/5 border-accent-cyan/30 dark:bg-accent-cyan/10"
                        : "bg-stone-50 dark:bg-stone-800/50 border-stone-200 dark:border-stone-700"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getTaskStatusColor(status.value)}>
                        {status.label}
                      </Badge>
                      <span className="text-sm text-stone-500 dark:text-stone-400">
                        {tasksByStatus[status.value]?.length || 0}
                      </span>
                    </div>
                    <div className="space-y-2 min-h-[60px]">
                      {tasksByStatus[status.value]?.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id || `task-${index}`}
                          index={index}
                          isDragDisabled={!canChangeStatus}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`transition-shadow ${
                                dragSnapshot.isDragging ? "shadow-lg ring-2 ring-accent-cyan/30 rounded-xl" : ""
                              }`}
                            >
                              <TaskCard
                                task={task}
                                onStatusChange={onStatusChange}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onClick={onClick}
                                onToggleComplete={onToggleComplete}
                                showProject={showProject}
                                canEdit={canEdit}
                                canDelete={canDelete}
                                canChangeStatus={canChangeStatus}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {!tasksByStatus[status.value]?.length && !snapshot.isDraggingOver && (
                        <p className="text-sm text-stone-400 dark:text-stone-500 text-center py-4">
                          No tasks
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  )
}
