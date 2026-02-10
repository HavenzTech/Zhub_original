"use client";

import { useState, useRef, useEffect } from "react";
import {
  Bot,
  PanelRightClose,
  PanelRightOpen,
  Send,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat, type Message } from "@/lib/hooks/useChat";

export function AiAssistantSidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, isLoading, sendMessage, setMessages } = useChat();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (!collapsed) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, collapsed]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim(), "internal");
    setInput("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  // Auto-resize textarea
  const handleInputChange = (value: string) => {
    setInput(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight + 2, 96) + "px";
    }
  };

  const formatTime = (timestamp: string) => {
    return timestamp || "";
  };

  return (
    <div
      className={`${
        collapsed ? "w-12" : "w-80"
      } bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-800 flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className="p-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between">
          <div className={`${collapsed ? "hidden" : "flex items-center gap-2 flex-1 min-w-0"}`}>
            <div className="w-7 h-7 rounded-lg bg-accent-cyan/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-accent-cyan" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 truncate">
                Z AI Assistant
              </h3>
            </div>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0 flex-shrink-0 text-stone-400 hover:text-red-500"
                title="Clear chat"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            {collapsed ? (
              <Bot className="w-4 h-4 text-accent-cyan" />
            ) : (
              <PanelRightClose className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        className={`flex-1 overflow-auto ${collapsed ? "hidden" : ""}`}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center mb-3">
              <Bot className="w-6 h-6 text-accent-cyan" />
            </div>
            <p className="text-sm font-medium text-stone-900 dark:text-stone-50 mb-1">
              Ask Z anything
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 leading-relaxed">
              Search documents, analyze projects, or get quick answers about your data.
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 px-3 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-cyan" />
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  Z is thinking...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div
        className={`${collapsed ? "hidden" : ""} border-t border-stone-200 dark:border-stone-800 p-3`}
      >
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            placeholder="Ask Z..."
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
            className="flex-1 resize-none rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-sm text-stone-900 dark:text-stone-50 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 focus:border-accent-cyan disabled:opacity-50"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="sm"
            className="h-auto px-3 bg-accent-cyan hover:bg-accent-cyan/90 text-white self-end"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-stone-400 dark:text-stone-500">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              isLoading ? "animate-pulse bg-amber-500" : "bg-accent-cyan"
            }`}
          />
          <span>{isLoading ? "Processing..." : "Ready"}</span>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
          isUser
            ? "bg-accent-cyan text-white"
            : "bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-50"
        }`}
      >
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        {/* Source documents */}
        {!isUser && message.sourceDocuments && message.sourceDocuments.length > 0 && (
          <div className="mt-2 pt-2 border-t border-stone-200/50 dark:border-stone-700/50">
            <div className="text-[10px] text-stone-500 dark:text-stone-400 mb-1 font-medium">
              Sources:
            </div>
            {message.sourceDocuments.slice(0, 3).map((doc, i) => (
              <div
                key={i}
                className="text-[10px] text-stone-500 dark:text-stone-400 truncate"
              >
                {doc.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
