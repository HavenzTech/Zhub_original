// app/z-ai/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, useChat } from "@/lib/hooks/useChat";
import { ChatHeader } from "@/features/z-ai/components/ChatHeader";
import { ChatMessage } from "@/features/z-ai/components/ChatMessage";
import { ChatInput } from "@/features/z-ai/components/ChatInput";
import { TypingIndicator } from "@/features/z-ai/components/TypingIndicator";
import { Bot, FolderOpen, FileText, Clock, Users } from "lucide-react";
import { PageTour } from "@/components/tour/PageTour";
import { TOUR_KEYS } from "@/lib/tour/tour-keys";
import { getZAiSteps } from "@/lib/tour/steps";
import DocumentViewModal from "@/features/documents/components/DocumentViewModal";
import { bmsApi } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import type { Document } from "@/types/bms";

export default function ZAiPage() {
  const [input, setInput] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentInitialPage, setDocumentInitialPage] = useState(1);

  const {
    messages: chatMessages,
    isLoading: chatIsLoading,
    sendMessage,
  } = useChat();
  const [messages, setMessages] = useState<Message[]>(chatMessages || []);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      // Find the viewport element inside ScrollArea (Radix adds this)
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth"
        });
      }
    }
  }, [messages]);

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
      {
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
        const auth = authData ? JSON.parse(authData) : null;

        // Auth context loaded for API request

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
            // Multi-level access control
            company_id: auth?.currentCompanyId || "",
            department_ids: auth?.departmentIds || [],
            project_id: auth?.currentProjectId || "",
            user_id: auth?.userId || "",
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Response received from backend

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
              const meta = doc.metadata || {};

              return {
                // Display info - check flat fields FIRST, then fall back to metadata
                title: doc.section_title || meta.section_title || meta.title || "Unknown Section",
                name: doc.document_name || meta.name || meta.source || "Unknown Document",  // Filename
                relevance_score: doc.relevance_score || meta.relevance_score || 0,
                parent_folder: doc.parent_folder || meta.parent_folder || "",
                // For document preview
                document_id: doc.document_id || meta.document_id || "",
                page_start: doc.page_number || meta.page_start || 1,
                page_end: doc.page_end || meta.page_end || meta.page_start || 1,
                // Local PDF path (for local files not in PostgreSQL)
                pdf_path: doc.pdf_path || "",
              };
            }) || [],
          generatedImages: data.generated_images || [],
        };

        setMessages((prev) => [...prev, aiResponse]);
      }
    } catch (error) {
      // Error handled by UI state

      // Build a user-friendly error message based on the failure type
      let errorContent: string;
      if (error instanceof Error && error.message.includes("504")) {
        errorContent = "The request took too long. The AI is processing — please try again in a moment.";
      } else if (error instanceof Error && error.message.includes("503")) {
        errorContent = "The AI backend is currently unreachable. Please try again later.";
      } else {
        errorContent = "Something went wrong connecting to the AI. Please try again.";
      }

      const fallbackResponse: Message = {
        role: "internal-z",
        content: errorContent,
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDocumentPreview = async (doc: any) => {
    try {
      // Look up document for preview

      // Set up auth for API call
      const token = authService.getToken();
      const companyId = authService.getCurrentCompanyId();
      if (token) bmsApi.setToken(token);
      if (companyId) bmsApi.setCompanyId(companyId);

      const docId = doc.document_id || doc.metadata?.document_id || "";
      const pdfPath = doc.pdf_path || "";

      // Check if document_id is a valid PostgreSQL UUID (36 chars with hyphens like "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
      const isValidUUID = docId && docId.length === 36 && docId.includes("-") && docId.split("-").length === 5;


      // Priority 1: If we have pdf_path (local file), use Python backend directly
      // This takes priority because local files won't be in PostgreSQL
      if (pdfPath) {
        const docForPreview: Document = {
          id: `local_${Date.now()}`,
          name: doc.name || doc.source || doc.title || "Document",
          fileType: "pdf",
          version: 1,
          status: "active",
          uploadedByUserId: "",
          companyId: companyId || "",
          storagePath: pdfPath,
        };
        setSelectedDocument(docForPreview);
        setDocumentInitialPage(doc.page_start || 1);
        setShowDocumentModal(true);
        return;
      }

      // Priority 2: If we have a valid PostgreSQL UUID, use ASP.NET API
      if (isValidUUID) {
        const docForPreview: Document = {
          id: docId,
          name: doc.name || doc.source || doc.title || "Document",
          fileType: "pdf",
          version: 1,
          status: "active",
          uploadedByUserId: "",
          companyId: companyId || "",
        };
        setSelectedDocument(docForPreview);
        setDocumentInitialPage(doc.page_start || 1);
        setShowDocumentModal(true);
        return;
      }

      // Priority 3: Fallback - search by name in PostgreSQL
      const allDocs = await bmsApi.documents.getAll();
      const allDocsList = Array.isArray(allDocs)
        ? allDocs
        : (allDocs as any)?.items || (allDocs as any)?.data || [];

      const docTitle = doc.title?.toLowerCase() || "";
      const docSource = doc.source?.toLowerCase() || doc.metadata?.source?.toLowerCase() || "";
      const docName = doc.name?.toLowerCase() || "";

      let matchedDoc = allDocsList.find(
        (d: Document) =>
          d.name?.toLowerCase() === docTitle ||
          d.name?.toLowerCase() === docSource ||
          d.name?.toLowerCase() === docName
      );

      if (!matchedDoc) {
        matchedDoc = allDocsList.find(
          (d: Document) =>
            d.name?.toLowerCase().includes(docTitle) ||
            docTitle.includes(d.name?.toLowerCase() || "") ||
            d.name?.toLowerCase().includes(docSource) ||
            docSource.includes(d.name?.toLowerCase() || "") ||
            d.name?.toLowerCase().includes(docName) ||
            docName.includes(d.name?.toLowerCase() || "")
        );
      }

      if (matchedDoc) {
        setSelectedDocument(matchedDoc as Document);
        setDocumentInitialPage(doc.page_start || 1);
        setShowDocumentModal(true);
      } else {
        // Document not found in loaded documents
      }
    } catch (error) {
      // Preview error handled silently
    }
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setSelectedDocument(null);
    setDocumentInitialPage(1); // Reset page when closing
  };

  return (
    <AppLayout>
      <PageTour tourKey={TOUR_KEYS.Z_AI} options={{ steps: getZAiSteps(), enabled: true }} />
      <div className="h-full flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-stone-900">
          <ChatHeader />

          {/* Chat Messages */}
          <div ref={scrollAreaRef} className="flex-1 min-h-0" data-tour="zai-chat">
            <ScrollArea className="h-full p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                {messages.length === 0 && !chatIsLoading && !isLoading ? (
                  <div className="flex flex-col items-center justify-center py-24 px-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent-cyan/10 mb-4">
                      <Bot className="h-7 w-7 text-accent-cyan" />
                    </div>
                    <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50 mb-1">
                      What can I help you with?
                    </h2>
                    <p className="text-sm text-stone-400 dark:text-stone-500 text-center max-w-sm mb-8">
                      Search documents, summarize projects, or ask questions about your organization&apos;s data.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg">
                      {[
                        { label: "Summarize my active projects", Icon: FolderOpen },
                        { label: "Recently updated documents", Icon: FileText },
                        { label: "Show me overdue tasks", Icon: Clock },
                        { label: "Department overview", Icon: Users },
                      ].map((suggestion) => (
                        <button
                          key={suggestion.label}
                          onClick={() => setInput(suggestion.label)}
                          className="flex items-center gap-3 rounded-lg border border-stone-200 dark:border-stone-700 px-4 py-3 text-left text-sm text-stone-600 dark:text-stone-400 transition-colors hover:border-accent-cyan hover:text-accent-cyan dark:hover:border-accent-cyan dark:hover:text-accent-cyan"
                        >
                          <suggestion.Icon className="h-4 w-4 shrink-0" />
                          <span>{suggestion.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <ChatMessage
                        key={index}
                        message={message}
                        onDocumentPreview={handleDocumentPreview}
                      />
                    ))}
                    {(chatIsLoading || isLoading) && (
                      <TypingIndicator />
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          <div data-tour="zai-input">
            <ChatInput
              input={input}
              isLoading={chatIsLoading || isLoading}
              onInputChange={setInput}
              onSend={handleSendMessage}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        {/* Document View Modal - Same as Document Control */}
        <DocumentViewModal
          document={selectedDocument}
          open={showDocumentModal}
          onClose={closeDocumentModal}
          initialPage={documentInitialPage}
        />
      </div>
    </AppLayout>
  );
}
