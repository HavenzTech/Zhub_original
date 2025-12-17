// features/documents/components/DocumentChatPanel.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Document } from "@/types/bms";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { bmsApi } from "@/lib/services/bmsApi";
import {
  MessageCircle,
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

      const pythonApiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";

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

      console.log("[Chat] Using Python API URL:", pythonApiUrl);

      // Page analysis modes:
      // -30 = Quick (first 30 pages) - fast, covers ToC + intro
      // -50 = Deep (first 50 pages) - slower, more comprehensive
      const pageNum = deepAnalysis ? -50 : -30;
      console.log(`[Chat] Analysis mode: ${deepAnalysis ? 'Deep (50 pages)' : 'Quick (30 pages)'}`);

      const response = await fetch(`${pythonApiUrl}/analyze-document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: documentIdentifier, // Signed URL, local path, or document_id (UUID)
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
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full p-12">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No document selected
            </h3>
            <p className="text-sm text-gray-500">
              Select a document to start chatting about it
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col border rounded-lg bg-white" style={{ height: '95vh', maxHeight: '95vh', overflow: 'hidden' }}>
      <div className="pb-3 p-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-semibold">Ask about this document</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </div>

      {/* Messages Area - with explicit height and scrolling */}
      <style jsx>{`
        .chat-messages::-webkit-scrollbar {
          width: 8px;
        }
        .chat-messages::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .chat-messages::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        .chat-messages::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      <div
        className="chat-messages overflow-y-auto px-4 pt-4 pb-2"
        ref={scrollRef}
        style={{ flex: '1 1 0', minHeight: 0, overflow: 'auto' }}
      >
        <div className="space-y-4 pb-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
                style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
              >
                <p className="text-sm whitespace-pre-wrap" style={{ wordBreak: 'break-word' }}>{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 border-t bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
          <div className="flex gap-2 flex-wrap">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(action.query)}
                className="text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t flex-shrink-0">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && !loading && handleSend()}
            placeholder="Ask about this document..."
            disabled={loading}
            className="flex-1"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={deepAnalysis ? "default" : "outline"}
                  size="icon"
                  onClick={() => setDeepAnalysis(!deepAnalysis)}
                  disabled={loading}
                  className={deepAnalysis ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {deepAnalysis ? (
                    <Search className="w-4 h-4" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="text-xs">
                  {deepAnalysis
                    ? "Deep Analysis: 50 pages (slower, more thorough)"
                    : "Quick Analysis: 30 pages (faster)"}
                </p>
                <p className="text-xs text-gray-400">Click to toggle</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-500">
            Currently viewing:{" "}
            <span className="font-medium">{document.name}</span>
          </p>
          <Badge
            variant={deepAnalysis ? "default" : "secondary"}
            className={`text-xs ${deepAnalysis ? "bg-purple-100 text-purple-700" : ""}`}
          >
            {deepAnalysis ? (
              <>
                <Search className="w-3 h-3 mr-1" />
                Deep (50 pages)
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 mr-1" />
                Quick (30 pages)
              </>
            )}
          </Badge>
        </div>
      </div>
    </div>
  );
}
