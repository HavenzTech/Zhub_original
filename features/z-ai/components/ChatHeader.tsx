import { Bot, MessageSquarePlus, Shield } from "lucide-react"

interface ChatHeaderProps {
  onNewChat?: () => void
}

export function ChatHeader({ onNewChat }: ChatHeaderProps) {
  return (
    <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 p-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-accent-cyan/10 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-accent-cyan" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Z AI Assistant</h1>
          <p className="text-stone-500 dark:text-stone-400">
            Your intelligent companion for Havenz Hub
          </p>
        </div>
        {onNewChat && (
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 rounded-lg border border-stone-200 dark:border-stone-700 px-3 py-2 text-sm text-stone-600 dark:text-stone-400 transition-colors hover:border-accent-cyan hover:text-accent-cyan dark:hover:border-accent-cyan dark:hover:text-accent-cyan"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        )}
      </div>

      <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
          <Shield className="w-4 h-4 text-accent-cyan" />
          <span>
            Internal Mode: Full access to your Havenz Hub data &bull; Secured
            &bull; On-premise processing
          </span>
        </div>
      </div>
    </div>
  )
}
