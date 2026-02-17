import { memo } from "react"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Bot,
  User,
  Copy,
  Download,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Eye,
  Clock,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/hooks/useChat"
import {
  getMessageRoleName,
  getMessageRoleColor,
  getMessageAvatarBg,
  getMessageContentBg,
} from "../utils/chatHelpers"

const TOOL_LABELS: Record<string, string> = {
  "smart_document_query": "RAG",
  "smart_business_query": "Business Query",
  "chat": "Chat",
  "chat_with_documents": "RAG",
  "list_files": "File Listing",
}

function formatTokens(usage: any): string | null {
  if (!usage) return null
  const total = (usage.input_tokens || 0) + (usage.output_tokens || 0) + (usage.chunks_retrieved || 0)
  if (total === 0) return null
  return total >= 1000 ? `${(total / 1000).toFixed(1)}k tokens` : `${total} tokens`
}

interface ChatMessageProps {
  message: Message
  onDocumentPreview: (doc: any) => void
}

export const ChatMessage = memo(function ChatMessage({ message, onDocumentPreview }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex gap-4",
        message.role === "user" && "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          getMessageAvatarBg(message.role)
        )}
      >
        {message.role === "user" ? (
          <User className="w-5 h-5 text-stone-600 dark:text-stone-300" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex-1 max-w-[80%]",
          message.role === "user" && "text-right"
        )}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("text-sm font-medium", getMessageRoleColor(message.role))}>
            {getMessageRoleName(message.role)}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400">{message.timestamp}</span>
          {message.company && (
            <Badge variant="outline" className="text-xs">
              {message.company}
            </Badge>
          )}
        </div>

        <div className={cn("p-4 rounded-lg border", getMessageContentBg(message.role))}>
          {message.role === "user" ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed text-stone-900 dark:text-stone-50">
              {message.content}
            </p>
          ) : (
            <div className="text-sm leading-relaxed text-stone-900 dark:text-stone-50 prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-table:text-sm prose-th:px-3 prose-th:py-1.5 prose-td:px-3 prose-td:py-1.5 prose-table:border-collapse prose-th:border prose-td:border prose-th:border-stone-300 prose-td:border-stone-300 dark:prose-th:border-stone-600 dark:prose-td:border-stone-600 prose-th:bg-stone-100 dark:prose-th:bg-stone-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Response Metadata */}
          {message.role !== "user" && (message.toolUsed || message.elapsedTime || message.tierUsed) && (
            <div className="mt-3 pt-2 border-t border-stone-200/50 dark:border-stone-700/50 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-stone-400 dark:text-stone-500">
              {message.toolUsed && (
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {TOOL_LABELS[message.toolUsed] || message.toolUsed}
                </span>
              )}
              {message.elapsedTime != null && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {message.elapsedTime.toFixed(1)}s
                </span>
              )}
              {formatTokens(message.tokenUsage) && (
                <span>{formatTokens(message.tokenUsage)}</span>
              )}
              {message.tierUsed && (
                <span>Tier: {message.tierUsed}</span>
              )}
            </div>
          )}

          {/* Generated Images */}
          {message.generatedImages && message.generatedImages.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
              <p className="text-xs text-accent-cyan mb-2">Generated Images:</p>
              <div className="space-y-2">
                {message.generatedImages.map((img, i) => {
                  // Extract just the filename from path (handle both / and \ separators)
                  const filename =
                    img.image_path.split(/[/\\]/).pop() || img.image_path
                  // Use Python AI backend URL (where images are served), not ASP.NET API URL
                  const imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${filename}`
                  return (
                    <div
                      key={i}
                      className="bg-white dark:bg-stone-800 p-2 rounded-lg border border-stone-200 dark:border-stone-700"
                    >
                      <Image
                        src={imageUrl}
                        alt={img.prompt || "Generated image"}
                        className="w-full h-auto rounded"
                        width={500}
                        height={500}
                        onError={(e) => {
                          console.error("Image load error:", imageUrl)
                          e.currentTarget.src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>'
                        }}
                      />
                      {img.model && (
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1">
                          Model: {img.model}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Source Documents */}
          {message.sourceDocuments && message.sourceDocuments.length > 0 ? (
            <div className="mt-3 pt-3 border-t border-accent-cyan/20">
              <p className="text-xs text-accent-cyan mb-2">
                Source Documents (Top 3):
              </p>
              <div className="space-y-2">
                {message.sourceDocuments.slice(0, 3).map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  >
                    <div
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                      onClick={() => onDocumentPreview(doc)}
                    >
                      <FileText className="w-3 h-3 text-accent-cyan flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-accent-cyan truncate hover:text-accent-cyan/80 transition-colors">
                          {doc.title}
                        </p>
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                          {doc.parent_folder} {doc.page_start ? `• p.${doc.page_start}${doc.page_end && doc.page_end !== doc.page_start ? `-${doc.page_end}` : ''}` : ''}
                        </p>
                      </div>
                      <Eye className="w-3 h-3 text-accent-cyan opacity-60 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            message.relatedDocuments && (
              <div className="mt-3 pt-3 border-t border-accent-cyan/20">
                <p className="text-xs text-accent-cyan mb-2">
                  Related Documents:
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.relatedDocuments.map((doc, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-stone-200 dark:hover:bg-stone-700"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      {doc}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        {/* Action Buttons for AI messages */}
        {message.role !== "user" && (
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-stone-500 hover:text-accent-cyan dark:text-stone-400 dark:hover:text-accent-cyan"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-stone-500 hover:text-accent-cyan dark:text-stone-400 dark:hover:text-accent-cyan"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-stone-500 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-400"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
})
