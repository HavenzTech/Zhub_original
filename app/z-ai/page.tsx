// app/z-ai/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Bot,
  User,
  Send,
  Copy,
  Download,
  ThumbsUp,
  ThumbsDown,
  Shield,
  Globe,
  FileText,
  Building2,
  Search,
  TrendingUp,
  AlertTriangle,
  Eye,
  ExternalLink
} from 'lucide-react'
import { cn } from "@/lib/utils"

interface Message {
  role: "internal-z" | "external-z" | "user"
  content: string
  timestamp: string
  type?: "query" | "analysis" | "alert"
  relatedDocuments?: string[]
  sourceDocuments?: Array<{
    title: string
    relevance_score: number
    parent_folder: string
  }>
  generatedImages?: Array<{
    image_path: string
    prompt?: string
    model?: string
    file_size?: number
  }>
  company?: string
}

export default function ZAiPage() {
  const [input, setInput] = useState("")
  const [aiMode, setAiMode] = useState<"internal" | "external">("internal")
  const [isLoading, setIsLoading] = useState(false)
  const [previewPanel, setPreviewPanel] = useState<{
    isOpen: boolean
    document: any
    content: string
    loading: boolean
    error: string | null
    downloadUrl?: string
  }>({
    isOpen: false,
    document: null,
    content: "",
    loading: false,
    error: null,
    downloadUrl: undefined
  })
  const [messages, setMessages] = useState<Message[]>([])

  const quickActions = [
    {
      title: "Company Analysis",
      description: "Get insights on company performance",
      icon: Building2,
      prompt: "Analyze the current performance of all companies in my portfolio"
    },
    {
      title: "Document Search",
      description: "Find specific files and documents",
      icon: FileText,
      prompt: "Search for recent financial documents across all companies"
    },
    {
      title: "Trend Analysis",
      description: "Identify patterns and trends",
      icon: TrendingUp,
      prompt: "Show me trending issues or opportunities across my projects"
    },
    {
      title: "Security Audit",
      description: "Review security and compliance",
      icon: Shield,
      prompt: "Run a security audit on recent document uploads and access logs"
    }
  ]

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const newMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const currentInput = input
    setMessages(prev => [...prev, newMessage])
    setInput("")
    setIsLoading(true)

    try {
      if (aiMode === "internal") {
        // Use RAG backend for Internal Z mode
        // Convert messages to backend chat_history format
        const formattedHistory = messages
          .filter(msg => msg.role === "user" || msg.role === "internal-z")
          .map(msg => ({
            role: msg.role === "user" ? "user" : "assistant",
            text: msg.content
          }))

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: currentInput,
            chat_history: formattedHistory,
            search_type: "general",
            user_email: "" // Can be populated from auth if available
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        console.log('[Z-AI] Backend response:', data)
        console.log('[Z-AI] Generated images:', data.generated_images)
        console.log('[Z-AI] Generated images length:', data.generated_images?.length)

        const aiResponse: Message = {
          role: "internal-z",
          content: data.response || data.answer || "I apologize, but I couldn't process your request at the moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: "analysis",
          sourceDocuments: data.source_documents?.map((doc: any) => ({
            title: doc.metadata?.title || "Unknown Document",
            relevance_score: doc.metadata?.relevance_score || 0,
            parent_folder: doc.metadata?.parent_folder || ""
          })) || [],
          generatedImages: data.generated_images || []
        }

        console.log('[Z-AI] AI Response message:', aiResponse)
        console.log('[Z-AI] AI Response generatedImages:', aiResponse.generatedImages)

        setMessages(prev => [...prev, aiResponse])
      } else {
        // Use simulated response for External Z mode
        setTimeout(() => {
          const responseContent = generateExternalResponse(currentInput)

          const aiResponse: Message = {
            role: "external-z",
            content: responseContent,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "analysis"
          }
          setMessages(prev => [...prev, aiResponse])
        }, 1500)
      }
    } catch (error) {
      console.error('Error calling RAG backend:', error)

      // Fallback to simulated response for Internal Z on error
      const fallbackResponse: Message = {
        role: "internal-z",
        content: `Error: was not able to generate answer due to ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "analysis",
        sourceDocuments: []
      }

      setMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const generateInternalResponse = (query: string) => {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes("budget") || lowerQuery.includes("financial")) {
      return "FINANCIAL ANALYSIS SUMMARY\n\nAcross all companies:\n• Total Revenue: $5.15M (+12% YoY)\n• AHI Red Deer: $2.4M (46.6% of total)\n• Havenz Tech: $1.8M (35% of total)\n• Denvr Dataworks: $950K (18.4% of total)\n\nBudget burn rates:\n• Q1 2025: 23% of annual budget utilized\n• On track for projected targets\n• Recommended: Increase marketing spend for Havenz Tech\n\nWould you like detailed breakdown by department or project?"
    }
    
    if (lowerQuery.includes("project") || lowerQuery.includes("deadline")) {
      return "PROJECT STATUS OVERVIEW\n\n🟢 On Track: 18 projects\n🟡 At Risk: 5 projects\n🔴 Overdue: 2 projects\n\nCritical attention needed:\n• Havenz Tech - Mobile App (3 days overdue)\n• AHI Red Deer - Infrastructure Upgrade (deadline tomorrow)\n\nNext milestones:\n• Data Center Migration (Feb 15)\n• Security Audit Completion (Feb 20)\n• Q1 Financial Review (March 1)\n\nShall I dive deeper into any specific project?"
    }
    
    return "I've analyzed your query against the Havenz Hub database. Based on your organization's data, I found relevant information across multiple companies and projects. Would you like me to provide specific details or generate a detailed report?"
  }

  const generateExternalResponse = (query: string) => {
    return "EXTERNAL RESEARCH RESULTS\n\nI've searched public databases and market intelligence without exposing your internal data. Here's what I found:\n\n• Market trends in your industry sector\n• Competitive analysis and benchmarking\n• Regulatory updates that may affect operations\n• Technology developments relevant to your business\n\nNote: This information is gathered from public sources. Your internal data remains secure and was not shared externally.\n\nWould you like me to cross-reference this with your internal capabilities?"
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleQuickAction = (prompt: string) => {
    setInput(prompt)
  }

  const handleDocumentPreview = async (document: any) => {
    setPreviewPanel(prev => ({
      ...prev,
      isOpen: true,
      document,
      loading: true,
      error: null,
      content: ""
    }))

    try {
      // Build the complete file path using available metadata
      // Format: project/parent_folder/subfolder_path/title
      const project = document.project || "AHLP - AHI Red Deer Project"
      const parentFolder = document.parent_folder || ""
      const subfolderPath = document.subfolder_path || ""
      const fileName = document.title || ""

      // Construct the full relative path
      let filePath = ""
      if (project) {
        filePath = project
        if (parentFolder) {
          filePath += "/" + parentFolder
          if (subfolderPath) {
            filePath += "/" + subfolderPath
          }
        }
        if (fileName) {
          filePath += "/" + fileName
        }
      } else {
        // Fallback to just the filename if no project structure
        filePath = fileName
      }

      if (!filePath) {
        throw new Error('No file path could be constructed from document metadata')
      }

      // Use the same preview API that document-control uses
      const response = await fetch(`/api/preview?path=${encodeURIComponent(filePath)}`)
      const data = await response.json()

      if (data.success) {
        // Handle different content types like document-control does
        if (data.type === 'text' && data.content) {
          setPreviewPanel(prev => ({
            ...prev,
            loading: false,
            content: data.content
          }))
        } else if (data.type === 'pdf' && data.downloadUrl) {
          setPreviewPanel(prev => ({
            ...prev,
            loading: false,
            content: 'pdf_embedded', // Special flag for PDF embedding
            downloadUrl: data.downloadUrl
          }))
        } else if (data.type === 'docx') {
          setPreviewPanel(prev => ({
            ...prev,
            loading: false,
            content: `DOCX Document: ${document.title}\n\n${data.note || 'This document requires download for viewing.'}`,
            downloadUrl: data.downloadUrl
          }))
        } else {
          setPreviewPanel(prev => ({
            ...prev,
            loading: false,
            content: `Unsupported file type: ${data.type}\n\nPlease download the file to view its contents.`,
            downloadUrl: data.downloadUrl
          }))
        }
      } else {
        throw new Error(data.error || 'Failed to load preview')
      }
    } catch (error) {
      setPreviewPanel(prev => ({
        ...prev,
        loading: false,
        error: `Failed to load document: ${error instanceof Error ? error.message : 'Unknown error'}`
      }))
    }
  }

  const closePreviewPanel = () => {
    setPreviewPanel({
      isOpen: false,
      document: null,
      content: "",
      loading: false,
      error: null,
      downloadUrl: undefined
    })
  }

  return (
    <div className="h-full flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Z AI Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Z AI Assistant</h1>
                <p className="text-blue-100">Your intelligent companion for Havenz Hub</p>
              </div>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex items-center gap-2">
              <Badge 
                variant={aiMode === "internal" ? "default" : "secondary"}
                className={`cursor-pointer ${aiMode === "internal" ? "bg-white text-blue-600" : "bg-blue-700 text-white"}`}
                onClick={() => setAiMode("internal")}
              >
                <Shield className="w-3 h-3 mr-1" />
                Internal Z
              </Badge>
              <Badge 
                variant={aiMode === "external" ? "default" : "secondary"}
                className={`cursor-pointer ${aiMode === "external" ? "bg-white text-blue-600" : "bg-blue-700 text-white"}`}
                onClick={() => setAiMode("external")}
              >
                <Globe className="w-3 h-3 mr-1" />
                External Z
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white/10 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              {aiMode === "internal" ? (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Internal Mode: Full access to your Havenz Hub data • Secured • On-premise processing</span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" />
                  <span>External Mode: Connected to public AI • Your data never leaves Havenz Hub • Research only</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {messages.map((message, index) => (
              <div key={index} className={cn(
                "flex gap-4",
                message.role === "user" && "flex-row-reverse"
              )}>
                {/* Avatar */}
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === "user" 
                    ? "bg-gray-200" 
                    : message.role === "internal-z"
                    ? "bg-blue-600"
                    : "bg-purple-600"
                )}>
                  {message.role === "user" ? (
                    <User className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className={cn(
                  "flex-1 max-w-[80%]",
                  message.role === "user" && "text-right"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "text-sm font-medium",
                      message.role === "user" 
                        ? "text-gray-600" 
                        : message.role === "internal-z"
                        ? "text-blue-600"
                        : "text-purple-600"
                    )}>
                      {message.role === "user" ? "You" : 
                       message.role === "internal-z" ? "Z AI (Internal)" : "Z AI (External)"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp}
                    </span>
                    {message.company && (
                      <Badge variant="outline" className="text-xs">
                        {message.company}
                      </Badge>
                    )}
                  </div>
                  
                  <div className={cn(
                    "p-4 rounded-lg border",
                    message.role === "user"
                      ? "bg-gray-50 border-gray-200"
                      : "bg-blue-50 border-blue-200"
                  )}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-900">
                      {message.content}
                    </p>

                    {(message.generatedImages && message.generatedImages.length > 0) && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-600 mb-2">Generated Images:</p>
                        <div className="space-y-2">
                          {message.generatedImages.map((img, i) => {
                            const filename = img.image_path.split('/').pop() || img.image_path;
                            const imageUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/images/${filename}`;
                            return (
                              <div key={i} className="bg-white p-2 rounded-lg border border-blue-200">
                                <img
                                  src={imageUrl}
                                  alt={img.prompt || 'Generated image'}
                                  className="w-full h-auto rounded"
                                  onError={(e) => {
                                    console.error('Image load error:', imageUrl);
                                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                                  }}
                                />
                                {img.model && (
                                  <p className="text-xs text-gray-600 mt-1">Model: {img.model}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {(message.sourceDocuments && message.sourceDocuments.length > 0) ? (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-600 mb-2">Source Documents (Top 3):</p>
                        <div className="space-y-2">
                          {message.sourceDocuments.map((doc, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                              <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => handleDocumentPreview(doc)}>
                                <FileText className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-blue-600 truncate hover:text-blue-800 transition-colors">{doc.title}</p>
                                  <p className="text-xs text-gray-600">{doc.parent_folder}</p>
                                </div>
                                <Eye className="w-3 h-3 text-blue-500 opacity-60 hover:opacity-100 transition-opacity" />
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="secondary"
                                  className={`text-xs ${
                                    doc.relevance_score >= 80 ? 'bg-green-100 text-green-800' :
                                    doc.relevance_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {doc.relevance_score.toFixed(1)}%
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : message.relatedDocuments && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-600 mb-2">Related Documents:</p>
                        <div className="flex flex-wrap gap-2">
                          {message.relatedDocuments.map((doc, i) => (
                            <Badge key={i} variant="secondary" className="text-xs cursor-pointer hover:bg-blue-100">
                              <FileText className="w-3 h-3 mr-1" />
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for AI messages */}
                  {message.role !== "user" && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-blue-600">
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-blue-600">
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-green-600">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 text-gray-500 hover:text-red-600">
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
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
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[60px] max-h-32 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
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
                <div className={`w-2 h-2 rounded-full ${isLoading ? 'animate-pulse bg-orange-500' : aiMode === "internal" ? "bg-blue-500" : "bg-purple-500"}`}></div>
                <span>Z AI {aiMode === "internal" ? "Internal" : "External"} {isLoading ? 'Processing...' : 'Ready'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Sidebar */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="space-y-3 mb-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleQuickAction(action.prompt)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <action.icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                    <p className="text-xs text-gray-600">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Insights */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Recent Insights</h4>
          <div className="space-y-2">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-gray-900">Revenue Growth</span>
              </div>
              <p className="text-xs text-gray-600">AHI Red Deer showing 15% increase this quarter</p>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-3 h-3 text-orange-600" />
                <span className="text-xs font-medium text-gray-900">Contract Alert</span>
              </div>
              <p className="text-xs text-gray-600">3 contracts expiring within 30 days</p>
            </div>
            
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-3 h-3 text-blue-600" />
                <span className="text-xs font-medium text-gray-900">Document Activity</span>
              </div>
              <p className="text-xs text-gray-600">47 new uploads this week across all companies</p>
            </div>
          </div>
        </div>

        {/* Z AI Capabilities */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-900">Z AI Capabilities</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-blue-800 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Encryption-secured processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Search className="w-3 h-3" />
              <span>Smart document search</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3 h-3" />
              <span>Predictive analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3" />
              <span>External research (secure)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Preview Panel */}
      {previewPanel.isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={closePreviewPanel}>
          <div
            className={`bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] flex flex-col ${
              previewPanel.content === 'pdf_embedded' ? 'max-w-6xl' : 'max-w-4xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {previewPanel.document?.title || "Document Preview"}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {previewPanel.document?.parent_folder || "Unknown folder"}
                  </p>
                </div>
                {previewPanel.document?.relevance_score && (
                  <Badge
                    variant="secondary"
                    className={`text-xs ${
                      previewPanel.document.relevance_score >= 80 ? 'bg-green-100 text-green-800' :
                      previewPanel.document.relevance_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {previewPanel.document.relevance_score.toFixed(1)}% match
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {previewPanel.downloadUrl ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(previewPanel.downloadUrl, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={closePreviewPanel}>
                  ✕
                </Button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-hidden">
              {previewPanel.loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading document content...</span>
                  </div>
                </div>
              ) : previewPanel.error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <h4 className="font-semibold text-gray-900 mb-2">Error Loading Document</h4>
                    <p className="text-gray-600">{previewPanel.error}</p>
                    <Button variant="outline" className="mt-3" onClick={closePreviewPanel}>
                      Close
                    </Button>
                  </div>
                </div>
              ) : previewPanel.content === 'pdf_embedded' && previewPanel.downloadUrl ? (
                <div className="flex-1 flex flex-col">
                  {/* PDF Viewer Header */}
                  <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FileText className="w-4 h-4" />
                      <span>PDF Viewer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(previewPanel.downloadUrl, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Open in new tab
                      </Button>
                    </div>
                  </div>

                  {/* PDF Embed */}
                  <div className="flex-1 bg-gray-100">
                    <iframe
                      src={previewPanel.downloadUrl}
                      className="w-full h-full border-0"
                      title={`PDF Preview: ${previewPanel.document?.title}`}
                      style={{ minHeight: '500px' }}
                    />
                  </div>

                  {/* PDF Footer */}
                  <div className="p-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 text-center">
                    PDF rendered in browser • Use browser controls for zoom and navigation
                  </div>
                </div>
              ) : (
                <ScrollArea className="h-full p-6">
                  <pre className="whitespace-pre-wrap text-sm text-gray-900 font-mono leading-relaxed">
                    {previewPanel.content}
                  </pre>
                </ScrollArea>
              )}
            </div>

            {/* Preview Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div>Document preview • Click outside to close</div>
                <div className="flex items-center gap-4">
                  <span>Preview mode: Text extraction</span>
                  <Button variant="ghost" size="sm" onClick={closePreviewPanel}>
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in new tab
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}