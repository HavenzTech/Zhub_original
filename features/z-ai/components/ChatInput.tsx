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
    <div className="border-t border-stone-200 dark:border-stone-700 p-4 bg-white dark:bg-stone-900">
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
            className="min-h-[60px] max-h-32 bg-stone-50 dark:bg-stone-800 border-stone-300 dark:border-stone-600 text-stone-900 dark:text-stone-50 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:border-accent-cyan focus:ring-accent-cyan/50 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <Button
            onClick={onSend}
            disabled={!input.trim() || isLoading}
            className="px-6 bg-accent-cyan hover:bg-accent-cyan/90 text-white self-end disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Send
          </Button>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-stone-500 dark:text-stone-400">
          <div>Press Enter to send &bull; Shift+Enter for new line</div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isLoading
                  ? "animate-pulse bg-amber-500"
                  : "bg-accent-cyan"
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
