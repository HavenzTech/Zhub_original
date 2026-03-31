/**
 * Import parsers for converting external PM tool exports (Trello JSON, CSV, generic JSON)
 * into CreateTaskRequest objects for the HavenzHub API.
 */

import type { CreateTaskRequest } from "@/types/bms"

// ============================================
// Types
// ============================================

export interface ParsedTask {
  title: string
  description: string
  status: string
  priority: string
  dueDate: string
  startDate: string
  estimatedHours: string
  taskType: string
  tags: string
  notes: string
  _selected: boolean
  _sourceRow: number
}

export type ImportFormat = "trello-json" | "csv" | "generic-json" | "unknown"

export interface DetectionResult {
  format: ImportFormat
  tasks: ParsedTask[]
  headers?: string[]
  rows?: string[][]
  error?: string
}

// ============================================
// Constants
// ============================================

const VALID_STATUSES = ["todo", "in_progress", "in_review", "completed", "cancelled"]
const VALID_PRIORITIES = ["low", "medium", "high", "critical"]

/** Maps our task field names to common aliases found in PM tool exports */
const FIELD_ALIASES: Record<string, string[]> = {
  title: ["title", "name", "summary", "subject", "task_name", "task name", "card name", "issue", "issue key", "key", "task"],
  description: ["description", "desc", "body", "details", "content", "note", "notes"],
  status: ["status", "state", "stage", "column", "list", "list name", "workflow", "board column"],
  priority: ["priority", "importance", "severity", "urgency", "level"],
  dueDate: ["duedate", "due_date", "due", "deadline", "end_date", "end date", "due date", "target date"],
  startDate: ["startdate", "start_date", "start", "start date", "created", "created_at", "created date"],
  estimatedHours: ["estimatedhours", "estimated_hours", "estimate", "hours", "story_points", "story points", "points", "time estimate"],
  taskType: ["tasktype", "task_type", "type", "issue type", "issue_type", "category", "kind"],
  tags: ["tags", "labels", "label", "components", "component", "categories"],
}

/** Trello label colors mapped to priorities */
const TRELLO_COLOR_PRIORITY: Record<string, string> = {
  red: "critical",
  orange: "high",
  yellow: "medium",
  green: "low",
  purple: "high",
  pink: "high",
}

// ============================================
// Normalizers
// ============================================

export function normalizeStatus(raw?: string | null): string {
  if (!raw) return "todo"
  const lower = raw.toLowerCase().replace(/[\s\-]+/g, "_")
  if (VALID_STATUSES.includes(lower)) return lower

  if (/done|complete|closed|resolved|finished|shipped/.test(lower)) return "completed"
  if (/progress|doing|active|started|wip|working/.test(lower)) return "in_progress"
  if (/review|testing|qa|verify|validation|staged/.test(lower)) return "in_review"
  if (/cancel|archive|dropped|removed|wontfix|won.t_fix/.test(lower)) return "cancelled"
  return "todo"
}

export function normalizePriority(raw?: string | null): string {
  if (!raw) return "medium"
  const lower = raw.toLowerCase().trim()
  if (VALID_PRIORITIES.includes(lower)) return lower

  if (/urgent|critical|highest|blocker|p[01]|showstopper/.test(lower)) return "critical"
  if (/high|important|major|p2/.test(lower)) return "high"
  if (/low|lowest|minor|trivial|p4|p5/.test(lower)) return "low"
  return "medium"
}

// ============================================
// CSV Parser (RFC 4180)
// ============================================

export function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = parseCSVLines(text)
  if (lines.length === 0) return { headers: [], rows: [] }
  return { headers: lines[0], rows: lines.slice(1).filter((r) => r.some((c) => c.trim())) }
}

function parseCSVLines(text: string): string[][] {
  const results: string[][] = []
  let current: string[] = []
  let field = ""
  let inQuotes = false
  const chars = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < chars.length && chars[i + 1] === '"') {
          field += '"'
          i++ // skip escaped quote
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ",") {
        current.push(field)
        field = ""
      } else if (ch === "\n") {
        current.push(field)
        results.push(current)
        current = []
        field = ""
      } else {
        field += ch
      }
    }
  }
  // Last field/row
  if (field || current.length > 0) {
    current.push(field)
    results.push(current)
  }
  return results
}

// ============================================
// Trello JSON Parser
// ============================================

interface TrelloCard {
  name: string
  desc?: string
  due?: string | null
  dueComplete?: boolean
  closed?: boolean
  idList?: string
  labels?: { name?: string; color?: string }[]
  // Extra fields we'll preserve in notes
  [key: string]: unknown
}

interface TrelloList {
  id: string
  name: string
  closed?: boolean
}

interface TrelloExport {
  cards?: TrelloCard[]
  lists?: TrelloList[]
  [key: string]: unknown
}

// Skip all Trello internal/metadata fields — only preserve truly user-meaningful extras
// Instead of whitelisting known fields, we blacklist prefixes and known junk
const TRELLO_SKIP_PREFIXES = ["id", "shortLink", "shortUrl", "url", "pos", "nodeId"]
const TRELLO_SKIP_FIELDS = new Set([
  // Core fields we already map
  "name", "desc", "due", "dueComplete", "closed", "idList", "labels",
  // Internal Trello metadata
  "id", "idBoard", "idMembers", "idShort", "idAttachmentCover", "idList",
  "idChecklists", "idLabels", "idMemberCreator", "idOrganization",
  "idMembersVoted", "idAttachmentCover",
  "pos", "dateLastActivity", "shortLink", "shortUrl", "url",
  "subscribed", "badges", "checkItemStates", "cover", "isTemplate",
  "cardRole", "attachments", "pluginData", "customFieldItems",
  "manualCoverAttachment", "coordinates", "start", "address", "locationName",
  "email", "pinned", "nodeId", "limits", "stickers",
  // Nested objects that aren't useful as text
  "descData", "cardData",
])

export function parseTrelloJson(data: TrelloExport): ParsedTask[] {
  const listsMap = new Map<string, string>()
  if (data.lists) {
    for (const list of data.lists) {
      if (!list.closed) listsMap.set(list.id, list.name)
    }
  }

  return (data.cards || [])
    .filter((card) => !card.closed)
    .map((card, index) => {
      const listName = card.idList ? listsMap.get(card.idList) : undefined

      // Extract tags from labels
      const labelNames = card.labels?.map((l) => l.name).filter(Boolean) || []
      const tags = labelNames.join(", ")

      // Detect priority from labels
      let priority = "medium"
      if (card.labels?.length) {
        for (const label of card.labels) {
          const name = label.name?.toLowerCase() || ""
          if (VALID_PRIORITIES.includes(name)) {
            priority = name
            break
          }
          if (/urgent|critical|blocker/.test(name)) { priority = "critical"; break }
          if (/important|major/.test(name)) { priority = "high"; break }
          if (label.color && TRELLO_COLOR_PRIORITY[label.color] && priority === "medium") {
            priority = TRELLO_COLOR_PRIORITY[label.color]
          }
        }
      }

      // Collect unmapped Trello fields into notes (skip internal metadata)
      const extraParts: string[] = []

      // Capture checklist count from badges if present
      const badges = card.badges as Record<string, unknown> | undefined
      if (badges) {
        if (typeof badges.checkItems === "number" && badges.checkItems > 0) {
          extraParts.push(`Checklist items: ${badges.checkItemsChecked}/${badges.checkItems}`)
        }
      }

      return {
        title: card.name,
        description: card.desc || "",
        status: card.dueComplete ? "completed" : normalizeStatus(listName),
        priority,
        dueDate: card.due ? card.due.split("T")[0] : "",
        startDate: "",
        estimatedHours: "",
        taskType: "",
        tags,
        notes: extraParts.length > 0 ? extraParts.join(" | ") : "",
        _selected: true,
        _sourceRow: index + 1,
      }
    })
}

// ============================================
// Generic JSON Parser
// ============================================

function findFieldValue(obj: Record<string, unknown>, aliases: string[]): string {
  for (const alias of aliases) {
    for (const key of Object.keys(obj)) {
      if (key.toLowerCase().replace(/[\s_\-]/g, "") === alias.replace(/[\s_\-]/g, "")) {
        const val = obj[key]
        if (val == null) return ""
        if (Array.isArray(val)) return val.map(String).join(", ")
        return String(val)
      }
    }
  }
  return ""
}

function getAllMappedKeys(obj: Record<string, unknown>): Set<string> {
  const mapped = new Set<string>()
  for (const aliases of Object.values(FIELD_ALIASES)) {
    for (const alias of aliases) {
      for (const key of Object.keys(obj)) {
        if (key.toLowerCase().replace(/[\s_\-]/g, "") === alias.replace(/[\s_\-]/g, "")) {
          mapped.add(key)
        }
      }
    }
  }
  return mapped
}

export function parseGenericJson(items: Record<string, unknown>[]): ParsedTask[] {
  return items.map((item, index) => {
    const title = findFieldValue(item, FIELD_ALIASES.title)
    const description = findFieldValue(item, FIELD_ALIASES.description)
    const rawStatus = findFieldValue(item, FIELD_ALIASES.status)
    const rawPriority = findFieldValue(item, FIELD_ALIASES.priority)
    const dueDate = findFieldValue(item, FIELD_ALIASES.dueDate)
    const startDate = findFieldValue(item, FIELD_ALIASES.startDate)
    const estimatedHours = findFieldValue(item, FIELD_ALIASES.estimatedHours)
    const taskType = findFieldValue(item, FIELD_ALIASES.taskType)
    const tags = findFieldValue(item, FIELD_ALIASES.tags)

    // Collect unmapped fields into notes
    const mappedKeys = getAllMappedKeys(item)
    // Also skip common meta fields
    const skipKeys = new Set(["id", "key", "url", "link", "created_at", "updated_at", "createdat", "updatedat"])
    const extraParts: string[] = []
    for (const [key, value] of Object.entries(item)) {
      if (mappedKeys.has(key)) continue
      if (skipKeys.has(key.toLowerCase().replace(/[\s_\-]/g, ""))) continue
      if (value == null || value === "") continue
      if (typeof value === "object" && !Array.isArray(value)) continue
      if (Array.isArray(value) && value.length === 0) continue
      const display = Array.isArray(value) ? value.join(", ") : String(value)
      extraParts.push(`${key}: ${display}`)
    }

    return {
      title,
      description,
      status: normalizeStatus(rawStatus),
      priority: normalizePriority(rawPriority),
      dueDate: dueDate ? dueDate.split("T")[0] : "",
      startDate: startDate ? startDate.split("T")[0] : "",
      estimatedHours,
      taskType,
      tags,
      notes: extraParts.length > 0 ? extraParts.join(" | ") : "",
      _selected: true,
      _sourceRow: index + 1,
    }
  })
}

// ============================================
// Format Detection
// ============================================

function findJsonArray(data: unknown): Record<string, unknown>[] | null {
  if (Array.isArray(data)) return data as Record<string, unknown>[]
  if (typeof data === "object" && data !== null) {
    const obj = data as Record<string, unknown>
    for (const key of ["tasks", "items", "data", "issues", "cards", "records", "rows", "results", "entries"]) {
      if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[]
    }
  }
  return null
}

export function detectFormat(content: string, fileName: string): DetectionResult {
  const trimmed = content.trim()

  // Try JSON first
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const data = JSON.parse(trimmed)

      // Check for Trello format
      if (
        typeof data === "object" &&
        !Array.isArray(data) &&
        Array.isArray(data.cards) &&
        Array.isArray(data.lists)
      ) {
        const tasks = parseTrelloJson(data as TrelloExport)
        if (tasks.length === 0) {
          return { format: "trello-json", tasks: [], error: "Trello board has no active cards." }
        }
        return { format: "trello-json", tasks }
      }

      // Try generic JSON
      const items = findJsonArray(data)
      if (items && items.length > 0) {
        const tasks = parseGenericJson(items)
        // Validate that at least some tasks have titles
        const withTitles = tasks.filter((t) => t.title.trim())
        if (withTitles.length === 0) {
          return {
            format: "generic-json",
            tasks: [],
            error: "No tasks with titles found. Each item needs a \"title\" or \"name\" field.",
          }
        }
        return { format: "generic-json", tasks }
      }

      return { format: "unknown", tasks: [], error: "Could not find an array of tasks in the JSON. Expected an array or an object with a \"tasks\", \"items\", or \"data\" key." }
    } catch {
      return { format: "unknown", tasks: [], error: "Invalid JSON file. Please check the file format." }
    }
  }

  // Treat as CSV
  if (fileName.endsWith(".csv") || trimmed.includes(",")) {
    const { headers, rows } = parseCSV(trimmed)
    if (headers.length === 0) {
      return { format: "csv", tasks: [], error: "CSV file appears to be empty." }
    }
    if (rows.length === 0) {
      return { format: "csv", tasks: [], headers, rows: [], error: "CSV file has headers but no data rows." }
    }
    return { format: "csv", tasks: [], headers, rows }
  }

  return { format: "unknown", tasks: [], error: "Unsupported file format. Please upload a .csv or .json file." }
}

// ============================================
// CSV Column Mapping
// ============================================

/** Auto-suggest a mapping from CSV headers to task fields */
export function autoSuggestMapping(headers: string[]): Record<string, number> {
  const mapping: Record<string, number> = {}
  const usedColumns = new Set<number>()

  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    for (let i = 0; i < headers.length; i++) {
      if (usedColumns.has(i)) continue
      const headerNorm = headers[i].toLowerCase().replace(/[\s_\-]/g, "")
      for (const alias of aliases) {
        const aliasNorm = alias.replace(/[\s_\-]/g, "")
        if (headerNorm === aliasNorm || headerNorm.includes(aliasNorm) || aliasNorm.includes(headerNorm)) {
          mapping[field] = i
          usedColumns.add(i)
          break
        }
      }
      if (mapping[field] !== undefined) break
    }
  }

  return mapping
}

/** Apply user's column mapping to CSV rows, collecting unmapped columns into notes */
export function applyColumnMapping(
  headers: string[],
  rows: string[][],
  mapping: Record<string, number>
): ParsedTask[] {
  const mappedIndices = new Set(Object.values(mapping))

  return rows.map((row, index) => {
    const get = (field: string) => {
      const colIdx = mapping[field]
      if (colIdx === undefined || colIdx < 0) return ""
      return (row[colIdx] || "").trim()
    }

    // Collect unmapped columns into notes
    const extraParts: string[] = []
    for (let i = 0; i < headers.length; i++) {
      if (mappedIndices.has(i)) continue
      const val = (row[i] || "").trim()
      if (!val) continue
      extraParts.push(`${headers[i]}: ${val}`)
    }

    const rawEstimated = get("estimatedHours")

    return {
      title: get("title"),
      description: get("description"),
      status: normalizeStatus(get("status")),
      priority: normalizePriority(get("priority")),
      dueDate: get("dueDate"),
      startDate: get("startDate"),
      estimatedHours: rawEstimated && !isNaN(parseFloat(rawEstimated)) ? rawEstimated : "",
      taskType: get("taskType"),
      tags: get("tags"),
      notes: extraParts.length > 0 ? extraParts.join(" | ") : "",
      _selected: true,
      _sourceRow: index + 1,
    }
  })
}

// ============================================
// Build API Request
// ============================================

export function buildCreateTaskRequest(task: ParsedTask, projectId: string): CreateTaskRequest {
  const req: CreateTaskRequest = {
    title: task.title.trim(),
    projectId,
    status: VALID_STATUSES.includes(task.status) ? task.status : "todo",
    priority: VALID_PRIORITIES.includes(task.priority) ? task.priority : "medium",
  }

  if (task.description.trim()) req.description = task.description.trim()
  if (task.dueDate.trim()) req.dueDate = task.dueDate.trim()
  if (task.startDate.trim()) req.startDate = task.startDate.trim()
  if (task.estimatedHours && !isNaN(parseFloat(task.estimatedHours))) {
    req.estimatedHours = parseFloat(task.estimatedHours)
  }
  if (task.taskType.trim()) req.taskType = task.taskType.trim()
  // Always include "imported" tag so these tasks are identifiable
  const existingTags = task.tags.trim()
  req.tags = existingTags ? `${existingTags}, imported` : "imported"
  if (task.notes.trim()) req.notes = task.notes.trim()

  return req
}

/** Task field labels for the column mapping UI */
export const TASK_FIELD_OPTIONS = [
  { value: "title", label: "Title", required: true },
  { value: "description", label: "Description" },
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "dueDate", label: "Due Date" },
  { value: "startDate", label: "Start Date" },
  { value: "estimatedHours", label: "Estimated Hours" },
  { value: "taskType", label: "Task Type" },
  { value: "tags", label: "Tags" },
] as const
