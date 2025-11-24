// app/z-ai/page.tsx
"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, useChat } from "@/lib/hooks/useChat";
import { ChatHeader } from "@/features/z-ai/components/ChatHeader";
import { ChatMessage } from "@/features/z-ai/components/ChatMessage";
import { ChatInput } from "@/features/z-ai/components/ChatInput";
import { QuickActionsSidebar } from "@/features/z-ai/components/QuickActionsSidebar";
import { DocumentPreviewPanel } from "@/features/z-ai/components/DocumentPreviewPanel";

interface PreviewPanelState {
  isOpen: boolean;
  document: any;
  content: string;
  loading: boolean;
  error: string | null;
  downloadUrl?: string;
}

export default function ZAiPage() {
  const [input, setInput] = useState("");
  const [aiMode, setAiMode] = useState<"internal" | "external">("internal");
  const [previewPanel, setPreviewPanel] = useState<PreviewPanelState>({
    isOpen: false,
    document: null,
    content: "",
    loading: false,
    error: null,
    downloadUrl: undefined,
  });

  const {
    messages: chatMessages,
    isLoading: chatIsLoading,
    sendMessage,
  } = useChat();
  const [messages, setMessages] = useState<Message[]>(chatMessages || []);
  const [isLoading, setIsLoading] = useState(false);

  // Keep local messages state in sync with the messages from the hook if it updates externally
  useEffect(() => {
    setMessages(chatMessages || []);
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!input.trim() || chatIsLoading || isLoading) return;

    const newMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    const currentInput = input;
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (aiMode === "internal") {
        // Use RAG backend for Internal Z mode
        // Convert messages to backend chat_history format
        const formattedHistory = messages
          .filter((msg) => msg.role === "user" || msg.role === "internal-z")
          .map((msg) => ({
            role: msg.role === "user" ? "user" : "assistant",
            text: msg.content,
          }));

        // Get auth token from localStorage
        const authData = localStorage.getItem("auth");
        const token = authData ? JSON.parse(authData).token : null;

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch("/api/chat", {
          method: "POST",
          headers,
          body: JSON.stringify({
            query: currentInput,
            chat_history: formattedHistory,
            search_type: "general",
            user_email: "", // Will be extracted from token by backend
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log("[Z-AI] Backend response:", data);
        console.log("[Z-AI] Source documents:", data.source_documents);
        if (data.source_documents && data.source_documents.length > 0) {
          console.log(
            "[Z-AI] First document metadata:",
            data.source_documents[0].metadata
          );
        }
        console.log("[Z-AI] Generated images:", data.generated_images);
        console.log(
          "[Z-AI] Generated images length:",
          data.generated_images?.length
        );

        const aiResponse: Message = {
          role: "internal-z",
          content:
            data.response ||
            data.answer ||
            "I apologize, but I couldn't process your request at the moment.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: "analysis",
          sourceDocuments:
            data.source_documents?.map((doc: any) => {
              console.log("[Z-AI] Processing doc:", doc);
              console.log("[Z-AI] Doc metadata:", doc.metadata);

              // Temporarily just use title as-is for debugging
              let displayName = doc.metadata?.title || "Unknown Document";

              console.log("[Z-AI] Display name:", displayName);

              return {
                title: displayName,
                relevance_score: doc.metadata?.relevance_score || 0,
                parent_folder: doc.metadata?.parent_folder || "",
              };
            }) || [],
          generatedImages: data.generated_images || [],
        };

        console.log("[Z-AI] AI Response message:", aiResponse);
        console.log(
          "[Z-AI] AI Response generatedImages:",
          aiResponse.generatedImages
        );

        setMessages((prev) => [...prev, aiResponse]);
      } else {
        // Use simulated response for External Z mode
        setTimeout(() => {
          const responseContent = generateExternalResponse(currentInput);

          const aiResponse: Message = {
            role: "external-z",
            content: responseContent,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "analysis",
          };
          setMessages((prev) => [...prev, aiResponse]);
        }, 1500);
      }
    } catch (error) {
      console.error("Error calling RAG backend:", error);

      // Fallback to simulated response for Internal Z on error
      const fallbackResponse: Message = {
        role: "internal-z",
        content: `Error: was not able to generate answer due to ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        type: "analysis",
        sourceDocuments: [],
      };

      setMessages((prev) => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInternalResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes("budget") || lowerQuery.includes("financial")) {
      return "FINANCIAL ANALYSIS SUMMARY\n\nAcross all companies:\n• Total Revenue: $5.15M (+12% YoY)\n• AHI Red Deer: $2.4M (46.6% of total)\n• Havenz Tech: $1.8M (35% of total)\n• Denvr Dataworks: $950K (18.4% of total)\n\nBudget burn rates:\n• Q1 2025: 23% of annual budget utilized\n• On track for projected targets\n• Recommended: Increase marketing spend for Havenz Tech\n\nWould you like detailed breakdown by department or project?";
    }

    if (lowerQuery.includes("project") || lowerQuery.includes("deadline")) {
      return "PROJECT STATUS OVERVIEW\n\n🟢 On Track: 18 projects\n🟡 At Risk: 5 projects\n🔴 Overdue: 2 projects\n\nCritical attention needed:\n• Havenz Tech - Mobile App (3 days overdue)\n• AHI Red Deer - Infrastructure Upgrade (deadline tomorrow)\n\nNext milestones:\n• Data Center Migration (Feb 15)\n• Security Audit Completion (Feb 20)\n• Q1 Financial Review (March 1)\n\nShall I dive deeper into any specific project?";
    }

    return "I've analyzed your query against the Havenz Hub database. Based on your organization's data, I found relevant information across multiple companies and projects. Would you like me to provide specific details or generate a detailed report?";
  };

  const generateExternalResponse = (query: string) => {
    return "EXTERNAL RESEARCH RESULTS\n\nI've searched public databases and market intelligence without exposing your internal data. Here's what I found:\n\n• Market trends in your industry sector\n• Competitive analysis and benchmarking\n• Regulatory updates that may affect operations\n• Technology developments relevant to your business\n\nNote: This information is gathered from public sources. Your internal data remains secure and was not shared externally.\n\nWould you like me to cross-reference this with your internal capabilities?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  const handleDocumentPreview = async (doc: any) => {
    setPreviewPanel({
      isOpen: true,
      document: doc,
      content: "",
      loading: true,
      error: null,
      downloadUrl: undefined,
    });

    try {
      const response = await fetch(
        `/api/document-preview/${encodeURIComponent(doc.title)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        if (data.content && data.content.trim()) {
          setPreviewPanel((prev) => ({
            ...prev,
            loading: false,
            content: data.content,
            downloadUrl: data.downloadUrl,
          }));
        } else if (data.type === "pdf" && data.downloadUrl) {
          setPreviewPanel((prev) => ({
            ...prev,
            loading: false,
            content: "pdf_embedded",
            downloadUrl: data.downloadUrl,
          }));
        } else {
          setPreviewPanel((prev) => ({
            ...prev,
            loading: false,
            content: `Unsupported file type: ${data.type}\n\nPlease download the file to view its contents.`,
            downloadUrl: data.downloadUrl,
          }));
        }
      } else {
        throw new Error(data.error || "Failed to load preview");
      }
    } catch (error) {
      setPreviewPanel((prev) => ({
        ...prev,
        loading: false,
        error: `Failed to load document: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      }));
    }
  };

  const closePreviewPanel = () => {
    setPreviewPanel({
      isOpen: false,
      document: null,
      content: "",
      loading: false,
      error: null,
      downloadUrl: undefined,
    });
  };

  return (
    <AppLayout>
      <div className="h-full flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          <ChatHeader aiMode={aiMode} onModeChange={setAiMode} />

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  message={message}
                  onDocumentPreview={handleDocumentPreview}
                />
              ))}
            </div>
          </ScrollArea>

          <ChatInput
            input={input}
            aiMode={aiMode}
            isLoading={chatIsLoading || isLoading}
            onInputChange={setInput}
            onSend={handleSendMessage}
            onKeyPress={handleKeyPress}
          />
        </div>

        {/* Quick Actions Sidebar */}
        <QuickActionsSidebar onQuickAction={handleQuickAction} />

        {/* Document Preview Panel */}
        <DocumentPreviewPanel
          previewPanel={previewPanel}
          onClose={closePreviewPanel}
        />
      </div>
    </AppLayout>
  );
}
