// features/documents/components/DocumentChatPanel.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Document } from "@/types/bms";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { bmsApi } from "@/lib/services/bmsApi";
import {
  Send,
  Sparkles,
  Loader2,
  User,
  Bot,
  Zap,
  Search,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface DocumentChatPanelProps {
  document: Document | null;
}

export default function DocumentChatPanel({
  document,
}: DocumentChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [deepAnalysis, setDeepAnalysis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Reset chat when document changes
  useEffect(() => {
    if (document) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `Hi! I can help you understand "${document.name}". Ask me anything about this document!`,
          timestamp: new Date(),
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [document]);

  const handleSend = async () => {
    if (!input.trim() || !document) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      console.log(
        "[Chat] Analyzing document:",
        document.name,
        "ID:",
        document.id
      );

      // Strategy: Use same approach as DocumentPreview
      // 1. Check if local file (storagePath contains local path)
      // 2. If GCS file, get signed URL from ASP.NET
      // 3. Fall back to document_id (Python will check cache/ChromaDB)

      let documentIdentifier = document.id!;
      const storagePath = document.storagePath || "";
      const isLocalFile = storagePath && (
        storagePath.includes("example_files") ||
        storagePath.includes("local_uploads") ||
        storagePath.toLowerCase().startsWith("c:") ||
        storagePath.startsWith("/") ||
        storagePath.match(/^[a-zA-Z]:/)
      );

      if (isLocalFile && storagePath) {
        // Local file - use storage path directly
        documentIdentifier = storagePath;
        console.log("[Chat] Using local file path:", storagePath);
      } else {
        // GCS file - try to get signed URL, fall back to document_id
        try {
          console.log("[Chat] Getting signed URL for document:", document.id);
          const downloadData = await bmsApi.documents.getDownloadUrl(document.id!);
          if (downloadData.downloadUrl) {
            documentIdentifier = downloadData.downloadUrl;
            console.log("[Chat] Got signed GCS URL:", downloadData.downloadUrl.substring(0, 100) + "...");
          }
        } catch (urlError) {
          console.log("[Chat] Could not get signed URL, using document_id:", document.id);
          // Fall back to document_id - Python backend will fetch from GCS using ChromaDB metadata
        }
      }

      // Page analysis modes:
      // -30 = Quick (first 30 pages) - fast, covers ToC + intro
      // -50 = Deep (first 50 pages) - slower, more comprehensive
      const pageNum = deepAnalysis ? -50 : -30;
      console.log(`[Chat] Analysis mode: ${deepAnalysis ? 'Deep (50 pages)' : 'Quick (30 pages)'}`);

      // Use Next.js API proxy to avoid CORS/mixed-content issues
      const response = await fetch("/api/analyze-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: documentIdentifier,
          query: input,
          page_num: pageNum,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from AI");
      }

      const data = await response.json();

      // Check if there was an error
      if (data.error) {
        throw new Error(data.answer || "AI analysis failed");
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.answer || "Sorry, I could not generate a response.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "Summarize", query: "Summarize this document" },
    { label: "Key Points", query: "What are the key points in this document?" },
    { label: "Explain", query: "Explain this document to me" },
  ];

  const handleQuickAction = (query: string) => {
    setInput(query);
  };

  if (!document) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <Sparkles className="h-10 w-10 text-stone-300 dark:text-stone-600 mb-3" />
        <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">
          AI Assistant
        </h3>
        <p className="text-xs text-stone-400 dark:text-stone-500 text-center">
          Select a document to start chatting about it
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white dark:bg-stone-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent-cyan" />
          <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">
            AI Assistant
          </span>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          AI Powered
        </Badge>
      </div>

      {/* Messages Area */}
      <div
        className="scrollbar-modern flex-1 overflow-y-auto px-4 pt-4 pb-2"
        ref={scrollRef}
        style={{ minHeight: 0 }}
      >
        <div className="space-y-4 pb-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2.5 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-cyan/10">
                  <Bot className="h-4 w-4 text-accent-cyan" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl px-4 py-2.5 ${
                  message.role === "user"
                    ? "bg-accent-cyan text-white"
                    : "bg-stone-100 text-stone-900 dark:bg-stone-800 dark:text-stone-50"
                }`}
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              >
                <p className="whitespace-pre-wrap text-[13px] leading-relaxed" style={{ wordBreak: 'break-word' }}>
                  {message.content}
                </p>
                <span className="mt-1 block text-[10px] opacity-60">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {message.role === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-700">
                  <User className="h-4 w-4 text-stone-600 dark:text-stone-300" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 justify-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-cyan/10">
                <Bot className="h-4 w-4 text-accent-cyan" />
              </div>
              <div className="rounded-xl bg-stone-100 px-3.5 py-2.5 dark:bg-stone-800">
                <Loader2 className="h-4 w-4 animate-spin text-stone-500" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="border-t border-stone-200 bg-stone-50 px-4 py-2.5 dark:border-stone-700 dark:bg-stone-800/50">
          <p className="mb-2 text-[11px] text-stone-500 dark:text-stone-400">Quick actions:</p>
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.query)}
                className="h-7 text-[11px] border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:border-stone-600 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200"
              >
                <Sparkles className="mr-1 h-3 w-3 text-accent-cyan" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-stone-200 p-3 dark:border-stone-700">
        <div className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // Auto-grow
              const el = e.target;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight + 2, window.innerHeight / 3) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !loading) {
                e.preventDefault();
                handleSend();
                // Reset height after sending
                if (textareaRef.current) {
                  textareaRef.current.style.height = "auto";
                }
              }
            }}
            placeholder="Ask about documents..."
            disabled={loading}
            rows={1}
            className="flex-1 text-[13px] min-h-[36px] max-h-[33vh] resize-none border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus-visible:ring-accent-cyan dark:border-stone-600 dark:bg-stone-800 dark:text-stone-50 dark:placeholder:text-stone-500"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={deepAnalysis ? "default" : "outline"}
                  size="icon"
                  onClick={() => setDeepAnalysis(!deepAnalysis)}
                  disabled={loading}
                  className={`h-9 w-9 ${deepAnalysis ? "bg-accent-cyan hover:bg-accent-cyan/90 text-white" : "border-stone-300 text-stone-500 hover:bg-stone-100 hover:text-stone-700 dark:border-stone-600 dark:text-stone-400 dark:hover:bg-stone-700 dark:hover:text-stone-200"}`}
                >
                  {deepAnalysis ? (
                    <Search className="h-3.5 w-3.5" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">
                  {deepAnalysis
                    ? "Deep Analysis: 50 pages (slower, more thorough)"
                    : "Quick Analysis: 30 pages (faster)"}
                </p>
                <p className="text-xs text-stone-400">Click to toggle</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-9 w-9 bg-accent-cyan hover:bg-accent-cyan/90"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="truncate text-[11px] text-stone-500 dark:text-stone-400">
            Viewing:{" "}
            <span className="font-medium">{document.name}</span>
          </p>
          <Badge
            variant={deepAnalysis ? "default" : "secondary"}
            className={`text-[10px] ${deepAnalysis ? "bg-accent-cyan/10 text-accent-cyan" : ""}`}
          >
            {deepAnalysis ? (
              <>
                <Search className="mr-1 h-2.5 w-2.5" />
                Deep
              </>
            ) : (
              <>
                <Zap className="mr-1 h-2.5 w-2.5" />
                Quick
              </>
            )}
          </Badge>
        </div>
      </div>
    </div>
  );
}
