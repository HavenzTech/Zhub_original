// app/z-ai/page.tsx
"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "@/lib/hooks/useChat";
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

  const { messages, isLoading, sendMessage } = useChat();

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput("");
    await sendMessage(currentInput, aiMode);
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

          {/* Input Area */}
          <ChatInput
            input={input}
            aiMode={aiMode}
            isLoading={isLoading}
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
