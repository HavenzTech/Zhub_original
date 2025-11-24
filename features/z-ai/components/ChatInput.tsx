import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

interface ChatInputProps {
  input: string
  aiMode: "internal" | "external"
  isLoading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onKeyPress: (e: React.KeyboardEvent) => void
}

export function ChatInput({
  input,
  aiMode,
  isLoading,
  onInputChange,
  onSend,
  onKeyPress,
}: ChatInputProps) {
  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3">
          <Textarea
            placeholder={
              aiMode === "internal"
                ? "Ask Z about your companies, projects, documents, or analytics..."
                : "Ask Z to research market data, trends, or external information..."
            }
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyPress={onKeyPress}
            className="min-h-[60px] max-h-32 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <Button
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            className="px-6 bg-blue-600 hover:bg-blue-700 text-white self-end disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send
          </Button>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div>Press Enter to send • Shift+Enter for new line</div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isLoading
                  ? "animate-pulse bg-orange-500"
                  : aiMode === "internal"
                  ? "bg-blue-500"
                  : "bg-purple-500"
              }`}
            ></div>
            <span>
              Z AI {aiMode === "internal" ? "Internal" : "External"}{" "}
              {isLoading ? "Processing..." : "Ready"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
