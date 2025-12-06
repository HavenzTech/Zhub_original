import { memo } from "react"
import Image from "next/image"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Message } from "@/lib/hooks/useChat"
import {
  getMessageRoleName,
  getMessageRoleColor,
  getMessageAvatarBg,
  getMessageContentBg,
  getRelevanceScoreColor,
} from "../utils/chatHelpers"

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
          <User className="w-5 h-5 text-gray-600" />
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
          <span className="text-xs text-gray-500">{message.timestamp}</span>
          {message.company && (
            <Badge variant="outline" className="text-xs">
              {message.company}
            </Badge>
          )}
        </div>

        <div className={cn("p-4 rounded-lg border", getMessageContentBg(message.role))}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-900">
            {message.content}
          </p>

          {/* Generated Images */}
          {message.generatedImages && message.generatedImages.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-600 mb-2">Generated Images:</p>
              <div className="space-y-2">
                {message.generatedImages.map((img, i) => {
                  // Extract just the filename from path (handle both / and \ separators)
                  const filename =
                    img.image_path.split(/[/\\]/).pop() || img.image_path
                  const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/images/${filename}`
                  return (
                    <div
                      key={i}
                      className="bg-white p-2 rounded-lg border border-blue-200"
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
                        <p className="text-xs text-gray-600 mt-1">
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
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs text-blue-600 mb-2">
                Source Documents (Top 3):
              </p>
              <div className="space-y-2">
                {message.sourceDocuments.map((doc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <div
                      className="flex items-center gap-2 flex-1 cursor-pointer"
                      onClick={() => onDocumentPreview(doc)}
                    >
                      <FileText className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-blue-600 truncate hover:text-blue-800 transition-colors">
                          {doc.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {doc.parent_folder}
                        </p>
                      </div>
                      <Eye className="w-3 h-3 text-blue-500 opacity-60 hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getRelevanceScoreColor(
                          doc.relevance_score
                        )}`}
                      >
                        {doc.relevance_score.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            message.relatedDocuments && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-600 mb-2">
                  Related Documents:
                </p>
                <div className="flex flex-wrap gap-2">
                  {message.relatedDocuments.map((doc, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-blue-100"
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
              className="h-8 text-gray-500 hover:text-blue-600"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-gray-500 hover:text-blue-600"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-gray-500 hover:text-green-600"
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-gray-500 hover:text-red-600"
            >
              <ThumbsDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
})
