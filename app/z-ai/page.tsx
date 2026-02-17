// app/z-ai/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, useChat } from "@/lib/hooks/useChat";
import { ChatHeader } from "@/features/z-ai/components/ChatHeader";
import { ChatMessage } from "@/features/z-ai/components/ChatMessage";
import { ChatInput } from "@/features/z-ai/components/ChatInput";
import { QuickActionsSidebar } from "@/features/z-ai/components/QuickActionsSidebar";
import DocumentViewModal from "@/features/documents/components/DocumentViewModal";
import { bmsApi } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import type { Document } from "@/types/bms";

export default function ZAiPage() {
  const [input, setInput] = useState("");
  const [aiMode, setAiMode] = useState<"internal" | "external">("internal");
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
        const auth = authData ? JSON.parse(authData) : null;

        // Debug logging
        console.log("[Z-AI] Auth from localStorage:", auth);
        console.log("[Z-AI] Sending to backend - company_id:", auth?.currentCompanyId || "(empty)");
        console.log("[Z-AI] Sending to backend - department_ids:", auth?.departmentIds || []);
        console.log("[Z-AI] Sending to backend - project_id:", auth?.currentProjectId || "(empty)");
        console.log("[Z-AI] Sending to backend - user_id:", auth?.userId || "(empty)");

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
              console.log("[Z-AI] Processing doc - FULL OBJECT:", JSON.stringify(doc, null, 2));
              console.log("[Z-AI] pdf_path from doc:", doc.pdf_path);

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
    try {
      console.log("[handleDocumentPreview] Source doc:", doc);

      // Set up auth for API call
      const token = authService.getToken();
      const companyId = authService.getCurrentCompanyId();
      if (token) bmsApi.setToken(token);
      if (companyId) bmsApi.setCompanyId(companyId);

      const docId = doc.document_id || doc.metadata?.document_id || "";
      const pdfPath = doc.pdf_path || "";

      // Check if document_id is a valid PostgreSQL UUID (36 chars with hyphens like "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
      const isValidUUID = docId && docId.length === 36 && docId.includes("-") && docId.split("-").length === 5;

      console.log("[handleDocumentPreview] docId:", docId, "isValidUUID:", isValidUUID, "pdfPath:", pdfPath);

      // Priority 1: If we have pdf_path (local file), use Python backend directly
      // This takes priority because local files won't be in PostgreSQL
      if (pdfPath) {
        console.log("[handleDocumentPreview] Using local pdf_path:", pdfPath);
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
        console.log("[handleDocumentPreview] Using PostgreSQL document_id:", docId);
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
      console.log("[handleDocumentPreview] Searching by name...");
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
        console.log("[handleDocumentPreview] Found by name match:", matchedDoc.name);
        setSelectedDocument(matchedDoc as Document);
        setDocumentInitialPage(doc.page_start || 1);
        setShowDocumentModal(true);
      } else {
        console.error("[handleDocumentPreview] Document not found:", {
          title: doc.title,
          source: doc.source,
          name: doc.name,
          document_id: docId,
          pdf_path: pdfPath
        });
      }
    } catch (error) {
      console.error("[handleDocumentPreview] Error:", error);
    }
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setSelectedDocument(null);
    setDocumentInitialPage(1); // Reset page when closing
  };

  return (
    <AppLayout>
      <div className="h-full flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-stone-900">
          <ChatHeader aiMode={aiMode} onModeChange={setAiMode} />

          {/* Chat Messages */}
          <div ref={scrollAreaRef} className="flex-1 min-h-0">
            <ScrollArea className="h-full p-6">
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
          </div>

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
