"use client"

import { useState } from "react"
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
  CheckSquare,
  Grid3X3,
  List,
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

  // Group tasks by status for kanban view
  const tasksByStatus = TASK_STATUS_OPTIONS.reduce((acc, status) => {
    acc[status.value] = filteredTasks.filter((t) => t.status === status.value)
    return acc
  }, {} as Record<string, TaskDto[]>)

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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="secondary">
            {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
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

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {TASK_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {TASK_PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Task Views */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {emptyMessage}
          </h3>
          {hasFilters && (
            <p className="text-gray-600 mb-4">Try adjusting your filters</p>
          )}
        </div>
      ) : view === "list" ? (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onEdit={onEdit}
              onDelete={onDelete}
              onClick={onClick}
              showProject={showProject}
              canEdit={canEdit}
              canDelete={canDelete}
              canChangeStatus={canChangeStatus}
            />
          ))}
        </div>
      ) : (
        // Kanban view
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {TASK_STATUS_OPTIONS.filter(s => s.value !== "cancelled").map((status) => (
            <div
              key={status.value}
              className="bg-gray-50 rounded-lg p-3 min-w-[250px]"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge className={getTaskStatusColor(status.value)}>
                  {status.label}
                </Badge>
                <span className="text-sm text-gray-500">
                  {tasksByStatus[status.value]?.length || 0}
                </span>
              </div>
              <div className="space-y-2">
                {tasksByStatus[status.value]?.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onClick={onClick}
                    showProject={showProject}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    canChangeStatus={canChangeStatus}
                  />
                ))}
                {!tasksByStatus[status.value]?.length && (
                  <p className="text-sm text-gray-400 text-center py-4">
                    No tasks
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
