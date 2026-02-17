// app/virtual-chatbots/page.tsx - Virtual Chatbots Demo & Management
"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bot, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Play,
  Pause,
  Settings,
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  Users,
  Building2,
  FolderOpen,
  FileText,
  TrendingUp,
  BarChart3,
  Clock,
  Star,
  Filter,
  Download,
  Share,
  Zap,
  Globe,
  Mic,
  Languages,
  Brain,
  Target,
  Activity,
  CheckCircle,
  AlertTriangle,
  Heart,
  Award,
  Lightbulb,
  User,
  Send,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Shield
} from 'lucide-react'
import { cn } from "@/lib/utils"
import { ChatbotConfig } from '../../types'
import { EntityCard, StatsGrid, SearchAndFilter, CompanyLogo, EmptyState } from '@/components/common/SharedComponents'

export default function VirtualChatbotsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedChatbot, setSelectedChatbot] = useState<ChatbotConfig | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [demoMode, setDemoMode] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatMessages, setChatMessages] = useState<Array<{
    role: "user" | "assistant"
    content: string
    timestamp: string
    relatedDocuments?: string[]
    sourceDocuments?: Array<{
      title: string
      relevance_score: number
      parent_folder: string
    }>
  }>>([
    {
      role: "assistant",
      content: "Hello! I'm the AHI assistant with access to all your documents and company information. I can help you:\n\n• Search across all documents and files\n• Find specific contracts and agreements\n• Answer questions about your business operations\n• Provide insights from your document library\n\nWhat would you like to know about AHI Red Deer?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  // Sample Chatbot Configurations
  const chatbots: ChatbotConfig[] = [
    {
      id: "chatbot-001",
      name: "AHI Customer Service Assistant",
      description: "Intelligent customer service chatbot handling inquiries, appointments, and support requests for AHI Red Deer operations",
      type: "customer-service",
      status: "active",
      linkedProjectId: "customer-service-automation",
      linkedCompanyId: "ahi-red-deer",
      configuration: {
        welcomeMessage: "Hello! I'm the AHI assistant. How can I help you today? I can assist with appointments, service inquiries, and general information.",
        fallbackMessage: "I'm sorry, I didn't understand that. Let me connect you with a human representative who can better assist you.",
        workingHours: {
          enabled: true,
          timezone: "America/Edmonton",
          schedule: {
            monday: { start: "08:00", end: "18:00" },
            tuesday: { start: "08:00", end: "18:00" },
            wednesday: { start: "08:00", end: "18:00" },
            thursday: { start: "08:00", end: "18:00" },
            friday: { start: "08:00", end: "18:00" },
            saturday: { start: "09:00", end: "15:00" },
            sunday: { start: "closed", end: "closed" }
          }
        },
        integrations: {
          phone: true,
          email: true,
          sms: false,
          webchat: true,
          voiceRecognition: true,
          multilingual: ["en", "fr"]
        },
        aiModel: "advanced",
        trainingData: ["customer-service-kb", "faq-document", "service-procedures"],
        analytics: {
          trackConversations: true,
          sentiment: true,
          leadScoring: false
        }
      },
      performance: {
        totalConversations: 2847,
        successfulResolutions: 2398,
        averageResponseTime: 1.2,
        satisfactionRating: 4.6,
        leadConversions: 0
      },
      createdDate: "2024-10-15",
      lastUpdated: "2025-01-12"
    },
    {
      id: "chatbot-002",
      name: "Havenz Tech Sales Assistant",
      description: "AI-powered sales assistant for lead generation, product demonstrations, and initial client consultations",
      type: "sales",
      status: "active",
      linkedProjectId: "sales-automation-system",
      linkedCompanyId: "havenz-tech",
      configuration: {
        welcomeMessage: "Welcome to Havenz Tech! I'm here to help you discover our innovative solutions. What technology challenges are you looking to solve?",
        fallbackMessage: "That's a great question! Let me schedule you a call with one of our technical specialists who can provide detailed information.",
        workingHours: {
          enabled: true,
          timezone: "America/Edmonton",
          schedule: {
            monday: { start: "07:00", end: "19:00" },
            tuesday: { start: "07:00", end: "19:00" },
            wednesday: { start: "07:00", end: "19:00" },
            thursday: { start: "07:00", end: "19:00" },
            friday: { start: "07:00", end: "19:00" },
            saturday: { start: "closed", end: "closed" },
            sunday: { start: "closed", end: "closed" }
          }
        },
        integrations: {
          phone: true,
          email: true,
          sms: true,
          webchat: true,
          voiceRecognition: true,
          multilingual: ["en", "fr", "es"]
        },
        aiModel: "advanced",
        trainingData: ["product-catalog", "case-studies", "technical-specs", "pricing-guides"],
        analytics: {
          trackConversations: true,
          sentiment: true,
          leadScoring: true
        }
      },
      performance: {
        totalConversations: 1523,
        successfulResolutions: 1298,
        averageResponseTime: 0.8,
        satisfactionRating: 4.8,
        leadConversions: 127
      },
      createdDate: "2024-11-01",
      lastUpdated: "2025-01-13"
    },
    {
      id: "chatbot-003",
      name: "Energy Haven Appointment Scheduler",
      description: "Specialized chatbot for scheduling consultations, site visits, and energy assessments for Energy Haven clients",
      type: "appointment-booking",
      status: "testing",
      linkedProjectId: "appointment-automation",
      linkedCompanyId: "energy-haven-lp",
      configuration: {
        welcomeMessage: "Hello! I can help you schedule your energy consultation or site assessment. What type of service are you interested in?",
        fallbackMessage: "Let me check availability with our scheduling team and get back to you within 30 minutes.",
        workingHours: {
          enabled: true,
          timezone: "America/Edmonton",
          schedule: {
            monday: { start: "08:00", end: "17:00" },
            tuesday: { start: "08:00", end: "17:00" },
            wednesday: { start: "08:00", end: "17:00" },
            thursday: { start: "08:00", end: "17:00" },
            friday: { start: "08:00", end: "17:00" },
            saturday: { start: "closed", end: "closed" },
            sunday: { start: "closed", end: "closed" }
          }
        },
        integrations: {
          phone: true,
          email: true,
          sms: true,
          webchat: true,
          voiceRecognition: false,
          multilingual: ["en"]
        },
        aiModel: "basic",
        trainingData: ["service-types", "scheduling-procedures", "technician-availability"],
        analytics: {
          trackConversations: true,
          sentiment: false,
          leadScoring: false
        }
      },
      performance: {
        totalConversations: 892,
        successfulResolutions: 786,
        averageResponseTime: 2.1,
        satisfactionRating: 4.3,
        leadConversions: 234
      },
      createdDate: "2024-12-01",
      lastUpdated: "2025-01-11"
    },
    {
      id: "chatbot-004",
      name: "Denvr DataWorks Support Bot",
      description: "Technical support chatbot for data center clients, handling service requests, system status, and troubleshooting",
      type: "support",
      status: "active",
      linkedProjectId: "technical-support-automation",
      linkedCompanyId: "denvr-dataworks",
      configuration: {
        welcomeMessage: "Denvr DataWorks Support here! I can help with service status, technical issues, and account inquiries. How can I assist you?",
        fallbackMessage: "This requires technical expertise. I'm escalating you to our Level 2 support team. Expected response time: 15 minutes.",
        workingHours: {
          enabled: false, // 24/7 support
          timezone: "America/Edmonton",
          schedule: {}
        },
        integrations: {
          phone: true,
          email: true,
          sms: true,
          webchat: true,
          voiceRecognition: true,
          multilingual: ["en", "fr"]
        },
        aiModel: "advanced",
        trainingData: ["technical-documentation", "troubleshooting-guides", "service-procedures", "security-protocols"],
        analytics: {
          trackConversations: true,
          sentiment: true,
          leadScoring: false
        }
      },
      performance: {
        totalConversations: 3241,
        successfulResolutions: 2956,
        averageResponseTime: 0.9,
        satisfactionRating: 4.7,
        leadConversions: 45
      },
      createdDate: "2024-09-15",
      lastUpdated: "2025-01-13"
    }
  ]

  const filteredChatbots = chatbots.filter(chatbot => {
    const matchesSearch = chatbot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chatbot.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chatbot.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (selectedFilter === "all") return matchesSearch
    if (selectedFilter === "active") return matchesSearch && chatbot.status === "active"
    if (selectedFilter === "high-performance") return matchesSearch && chatbot.performance.satisfactionRating > 4.5
    return matchesSearch && chatbot.status === selectedFilter
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'customer-service': return Users
      case 'sales': return Target
      case 'support': return Settings
      case 'lead-generation': return Lightbulb
      case 'appointment-booking': return Calendar
      default: return Bot
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'testing': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isLoading) return
    
    const newMessage = {
      role: "user" as const,
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    const currentInput = chatInput
    setChatMessages(prev => [...prev, newMessage])
    setChatInput("")
    setIsLoading(true)
    
    try {
      // Call our Next.js proxy API which forwards to your RAG backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: currentInput,
          chat_history: chatMessages.map(msg => ({
            role: msg.role === "user" ? "human" : "assistant",
            content: msg.content
          }))
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      const aiResponse = {
        role: "assistant" as const,
        content: data.response || data.answer || "I apologize, but I couldn't process your request at the moment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedDocuments: data.sources || data.documents || getRelatedDocuments(currentInput),
        sourceDocuments: data.source_documents?.map((doc: any) => {
          const meta = doc.metadata || {};
          return {
            title: doc.section_title || meta.section_title || meta.title || "Unknown Document",
            relevance_score: doc.relevance_score || meta.relevance_score || 0,
            parent_folder: doc.parent_folder || meta.parent_folder || ""
          };
        }) || []
      }
      
      setChatMessages(prev => [...prev, aiResponse])
    } catch (error) {
      console.error('Error calling RAG backend:', error)
      
      // Fallback to simulated response if API fails (CORS or network issues)
      const fallbackResponse = {
        role: "assistant" as const,
        content: generateDocumentChatResponse(currentInput),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedDocuments: getRelatedDocuments(currentInput),
        sourceDocuments: []
      }
      
      setChatMessages(prev => [...prev, fallbackResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const generateDocumentChatResponse = (query: string) => {
    // Enhanced fallback responses while backend auth is being configured
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes("contract") || lowerQuery.includes("agreement")) {
      return "DOCUMENT SEARCH RESULTS - AHI RED DEER CONTRACTS\n\nFound 5 relevant contract documents:\n\n📄 Service_Agreement_2025.pdf (Jan 15, 2025)\n📄 Equipment_Lease_Contract.pdf (Jan 10, 2025)\n📄 Maintenance_Contract_Renewal.pdf (Jan 8, 2025)\n📄 Software_Licensing_Agreement.pdf (Jan 5, 2025)\n📄 Vendor_Agreement_Amendment.pdf (Dec 20, 2024)\n\nTotal contract value: $642,500\nExpiring contracts: 1 (Equipment Lease - expires Feb 28)\n\n⚠️ Note: Currently using demo data. Real RAG backend requires Google OAuth authentication.\n\nWould you like me to analyze any specific contract?"
    }
    
    if (lowerQuery.includes("financial") || lowerQuery.includes("budget") || lowerQuery.includes("revenue")) {
      return "FINANCIAL DOCUMENT ANALYSIS - AHI RED DEER\n\n📊 Recent Financial Documents:\n• Q4_2024_Financial_Report.pdf\n• Budget_Forecast_2025.pdf\n• Monthly_Revenue_Report_Jan2025.pdf\n• Expense_Analysis_Q1.xlsx\n\n💰 Key Financial Insights:\n• Current Revenue: $2.4M (Q4 2024)\n• Budget Utilization: 23% of annual budget (Q1 2025)\n• Growth Rate: +15% compared to Q4 2023\n• Largest Expense Category: Equipment & Maintenance (34%)\n\n⚠️ Note: Currently using demo data. Real RAG backend requires Google OAuth authentication.\n\nWould you like me to dive deeper into any specific financial metric?"
    }
    
    if (lowerQuery.includes("employee") || lowerQuery.includes("staff") || lowerQuery.includes("hr")) {
      return "HUMAN RESOURCES DOCUMENTS - AHI RED DEER\n\n👥 Employee-Related Documents Found:\n• Employee_Handbook_2025.pdf\n• Safety_Training_Records.xlsx\n• Performance_Review_Templates.docx\n• Certification_Tracking.pdf\n\n📋 HR Insights:\n• Total Employees: 47\n• Certifications Due: 8 employees (next 30 days)\n• Training Completion Rate: 94%\n• Safety Incidents: 0 (last 90 days)\n\n⚠️ Note: Currently using demo data. Real RAG backend requires Google OAuth authentication.\n\nNeed specific employee information or policy details?"
    }
    
    return `I understand you're asking: "${query}"\n\n⚠️ **Authentication Required**: Your RAG backend at https://sleeksigns.ngrok.app requires Google OAuth authentication. \n\n📋 **Current Status**: Demo mode active with simulated responses.\n\n🔧 **To connect your real RAG backend**, you'll need to:\n1. Configure Google OAuth in your FastAPI backend\n2. Add authentication tokens to API requests\n3. Update the proxy to handle authentication\n\n📁 **Available demo topics**: contracts, financial reports, employee records, compliance documents\n\nWhat would you like to explore with the demo data?`
  }

  const getRelatedDocuments = (query: string) => {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes("contract")) {
      return ["Service_Agreement_2025.pdf", "Equipment_Lease_Contract.pdf"]
    }
    
    if (lowerQuery.includes("financial")) {
      return ["Q4_2024_Financial_Report.pdf", "Budget_Forecast_2025.pdf"]
    }
    
    if (lowerQuery.includes("employee") || lowerQuery.includes("hr")) {
      return ["Employee_Handbook_2025.pdf", "Safety_Training_Records.xlsx"]
    }
    
    return undefined
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatInput(e.target.value)
  }

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault()
      handleSendChatMessage()
    }
  }

  const ChatbotCard = ({ chatbot }: { chatbot: ChatbotConfig }) => {
    const TypeIcon = getTypeIcon(chatbot.type)
    
    return (
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedChatbot(chatbot)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TypeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                <p className="text-sm text-gray-600 capitalize flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {chatbot.type.replace('-', ' ')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge className={getStatusColor(chatbot.status)}>
                {chatbot.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{chatbot.description}</p>
          
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {chatbot.performance.totalConversations.toLocaleString()}
              </div>
              <div className="text-gray-600">Conversations</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {chatbot.performance.satisfactionRating.toFixed(1)}★
              </div>
              <div className="text-gray-600">Rating</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {chatbot.performance.averageResponseTime}s
              </div>
              <div className="text-gray-600">Response</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {chatbot.configuration.integrations.phone && <Phone className="w-4 h-4 text-green-600" />}
              {chatbot.configuration.integrations.webchat && <MessageSquare className="w-4 h-4 text-blue-600" />}
              {chatbot.configuration.integrations.email && <Mail className="w-4 h-4 text-purple-600" />}
              {chatbot.configuration.integrations.voiceRecognition && <Mic className="w-4 h-4 text-orange-600" />}
            </div>
            <div className="text-xs text-gray-500">
              {((chatbot.performance.successfulResolutions / chatbot.performance.totalConversations) * 100).toFixed(0)}% success rate
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDemoMode(chatbot.id); }}>
              <Play className="w-4 h-4 mr-2" />
              Demo
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const ChatbotDemo = ({ chatbot }: { chatbot: ChatbotConfig }) => {
    const [messages, setMessages] = useState<Array<{
      role: 'bot' | 'user'
      content: string
      timestamp: string
    }>>([
      {
        role: 'bot' as const,
        content: chatbot.configuration.welcomeMessage,
        timestamp: new Date().toLocaleTimeString()
      }
    ])
    const [inputMessage, setInputMessage] = useState("")

    const sendMessage = () => {
      if (!inputMessage.trim()) return

      const newMessages = [
        ...messages,
        {
          role: 'user' as const,
          content: inputMessage,
          timestamp: new Date().toLocaleTimeString()
        }
      ]

      // Simulate bot response
      setTimeout(() => {
        let botResponse = "Thank you for your message. "
        
        if (inputMessage.toLowerCase().includes('appointment') || inputMessage.toLowerCase().includes('schedule')) {
          botResponse = "I'd be happy to help you schedule an appointment! What type of service are you interested in, and what dates work best for you?"
        } else if (inputMessage.toLowerCase().includes('price') || inputMessage.toLowerCase().includes('cost')) {
          botResponse = "I can provide pricing information! Let me connect you with our sales team who can give you a detailed quote based on your specific needs."
        } else if (inputMessage.toLowerCase().includes('support') || inputMessage.toLowerCase().includes('help')) {
          botResponse = "I'm here to help! Can you tell me more about the specific issue you're experiencing so I can provide the best assistance?"
        } else {
          botResponse = chatbot.configuration.fallbackMessage
        }

        setMessages(prev => [...prev, {
          role: 'bot' as const,
          content: botResponse,
          timestamp: new Date().toLocaleTimeString()
        }])
      }, 1000)

      setMessages(newMessages)
      setInputMessage("")
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-sm">{chatbot.name}</CardTitle>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Online
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDemoMode(null)}>
                ✕
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.role === "user" ? (
                      <p className="text-sm">{message.content}</p>
                    ) : (
                      <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-table:text-sm prose-th:px-3 prose-th:py-1.5 prose-td:px-3 prose-td:py-1.5 prose-table:border-collapse prose-th:border prose-td:border">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} size="sm">
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const ChatbotDetails = ({ chatbot }: { chatbot: ChatbotConfig }) => {
    // Move state and handlers inside ChatbotDetails to isolate re-renders
    const [localChatInput, setLocalChatInput] = useState("")
    const [localIsLoading, setLocalIsLoading] = useState(false)
    const [localChatMessages, setLocalChatMessages] = useState<Array<{
      role: "user" | "assistant"
      content: string
      timestamp: string
      relatedDocuments?: string[]
      sourceDocuments?: Array<{
        title: string
        relevance_score: number
        parent_folder: string
      }>
    }>>([
      {
        role: "assistant",
        content: "Hello! I'm the AHI assistant with access to all your documents and company information. I can help you:\n\n• Search across all documents and files\n• Find specific contracts and agreements\n• Answer questions about your business operations\n• Provide insights from your document library\n\nWhat would you like to know about AHI Red Deer?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])

    const handleLocalInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalChatInput(e.target.value)
    }

    const handleLocalKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !localIsLoading) {
        e.preventDefault()
        handleLocalSendMessage()
      }
    }

    const handleLocalSendMessage = async () => {
      if (!localChatInput.trim() || localIsLoading) return
      
      const newMessage = {
        role: "user" as const,
        content: localChatInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      const currentInput = localChatInput
      setLocalChatMessages(prev => [...prev, newMessage])
      setLocalChatInput("")
      setLocalIsLoading(true)
      
      try {
        // Call our Next.js proxy API which forwards to your RAG backend
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: currentInput,
            chat_history: localChatMessages.map(msg => ({
              role: msg.role === "user" ? "human" : "assistant",
              content: msg.content
            }))
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        const aiResponse = {
          role: "assistant" as const,
          content: data.response || data.answer || "I apologize, but I couldn't process your request at the moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          relatedDocuments: data.sources || data.documents || getRelatedDocuments(currentInput),
          sourceDocuments: data.source_documents?.map((doc: any) => {
            const meta = doc.metadata || {};
            return {
              title: doc.section_title || meta.section_title || meta.title || "Unknown Document",
              relevance_score: doc.relevance_score || meta.relevance_score || 0,
              parent_folder: doc.parent_folder || meta.parent_folder || ""
            };
          }) || []
        }
        
        setLocalChatMessages(prev => [...prev, aiResponse])
      } catch (error) {
        console.error('Error calling RAG backend:', error)
        
        // Fallback to simulated response if API fails (CORS or network issues)
        const fallbackResponse = {
          role: "assistant" as const,
          content: generateDocumentChatResponse(currentInput),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          relatedDocuments: getRelatedDocuments(currentInput),
          sourceDocuments: []
        }
        
        setLocalChatMessages(prev => [...prev, fallbackResponse])
      } finally {
        setLocalIsLoading(false)
      }
    }

    return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedChatbot(null)}>
          ← Back to Chatbots
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDemoMode(chatbot.id)}>
            <Play className="w-4 h-4 mr-2" />
            Demo
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button>
            <Share className="w-4 h-4 mr-2" />
            Deploy
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="chat">Chat with your documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Chatbot Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Bot className="w-10 h-10 text-blue-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{chatbot.name}</h1>
                    <Badge className={getStatusColor(chatbot.status)}>
                      {chatbot.status}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{chatbot.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <div className="font-medium capitalize">{chatbot.type.replace('-', ' ')}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">AI Model:</span>
                      <div className="font-medium capitalize">{chatbot.configuration.aiModel}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Languages:</span>
                      <div className="font-medium">{chatbot.configuration.integrations.multilingual.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">24/7 Active:</span>
                      <div className="font-medium">{!chatbot.configuration.workingHours.enabled ? 'Yes' : 'No'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {chatbot.performance.totalConversations.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Conversations</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {((chatbot.performance.successfulResolutions / chatbot.performance.totalConversations) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {chatbot.performance.averageResponseTime}s
                    </div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {chatbot.performance.satisfactionRating.toFixed(1)}★
                    </div>
                    <div className="text-sm text-gray-600">Satisfaction Rating</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Messages & Responses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Welcome Message</label>
                  <Textarea 
                    value={chatbot.configuration.welcomeMessage}
                    readOnly
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Fallback Message</label>
                  <Textarea 
                    value={chatbot.configuration.fallbackMessage}
                    readOnly
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Working Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">24/7 Operation</span>
                    <Badge variant={!chatbot.configuration.workingHours.enabled ? "default" : "secondary"}>
                      {!chatbot.configuration.workingHours.enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Timezone</span>
                    <span className="text-sm font-medium">{chatbot.configuration.workingHours.timezone}</span>
                  </div>
                  {chatbot.configuration.workingHours.enabled && (
                    <div className="space-y-2">
                      {Object.entries(chatbot.configuration.workingHours.schedule).map(([day, hours]) => (
                        <div key={day} className="flex justify-between text-sm">
                          <span className="capitalize">{day}</span>
                          <span>{hours.start === "closed" ? "Closed" : `${hours.start} - ${hours.end}`}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  AI Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">AI Model</span>
                  <Badge className="capitalize">{chatbot.configuration.aiModel}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Voice Recognition</span>
                  <Badge variant={chatbot.configuration.integrations.voiceRecognition ? "default" : "secondary"}>
                    {chatbot.configuration.integrations.voiceRecognition ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sentiment Analysis</span>
                  <Badge variant={chatbot.configuration.analytics.sentiment ? "default" : "secondary"}>
                    {chatbot.configuration.analytics.sentiment ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Training Data Sources</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {chatbot.configuration.trainingData.map((source, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {source.replace('-', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Language & Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">Supported Languages</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {chatbot.configuration.integrations.multilingual.map((lang) => (
                      <Badge key={lang} variant="outline">
                        {lang.toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="text-sm text-gray-600">Communication Channels</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'phone', icon: Phone, label: 'Phone' },
                      { key: 'webchat', icon: MessageSquare, label: 'Web Chat' },
                      { key: 'email', icon: Mail, label: 'Email' },
                      { key: 'sms', icon: MessageSquare, label: 'SMS' }
                    ].map((channel) => (
                      <div key={channel.key} className={`flex items-center gap-2 p-2 rounded border ${
                        chatbot.configuration.integrations[channel.key as keyof typeof chatbot.configuration.integrations]
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}>
                        <channel.icon className={`w-4 h-4 ${
                          chatbot.configuration.integrations[channel.key as keyof typeof chatbot.configuration.integrations]
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`} />
                        <span className="text-sm">{channel.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Conversation Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Conversations</span>
                    <span className="font-semibold">{chatbot.performance.totalConversations.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Successful Resolutions</span>
                    <span className="font-semibold">{chatbot.performance.successfulResolutions.toLocaleString()}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Success Rate</span>
                      <span>{((chatbot.performance.successfulResolutions / chatbot.performance.totalConversations) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(chatbot.performance.successfulResolutions / chatbot.performance.totalConversations) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Response Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {chatbot.performance.averageResponseTime}s
                  </div>
                  <div className="text-sm text-gray-600">Average Response Time</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Performance Target: &lt;2s</span>
                    <span className={chatbot.performance.averageResponseTime < 2 ? 'text-green-600' : 'text-red-600'}>
                      {chatbot.performance.averageResponseTime < 2 ? 'Met' : 'Not Met'}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((2 / chatbot.performance.averageResponseTime) * 100, 100)} 
                    className={`h-2 ${chatbot.performance.averageResponseTime < 2 ? '' : '[&>div]:bg-red-500'}`}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Customer Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-1">
                    {chatbot.performance.satisfactionRating.toFixed(1)}★
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Target: 4.5★</span>
                    <span className={chatbot.performance.satisfactionRating >= 4.5 ? 'text-green-600' : 'text-yellow-600'}>
                      {chatbot.performance.satisfactionRating >= 4.5 ? 'Exceeded' : 'Good'}
                    </span>
                  </div>
                  <Progress value={(chatbot.performance.satisfactionRating / 5) * 100} />
                </div>
              </CardContent>
            </Card>
          </div>

          {chatbot.performance.leadConversions > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Lead Generation Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {chatbot.performance.leadConversions}
                    </div>
                    <div className="text-sm text-gray-600">Total Leads Generated</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {((chatbot.performance.leadConversions / chatbot.performance.totalConversations) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Conversion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {Math.round(chatbot.performance.totalConversations / chatbot.performance.leadConversions)}:1
                    </div>
                    <div className="text-sm text-gray-600">Conversation to Lead Ratio</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Project & Company Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Linked Company</label>
                  <Card className="mt-2 border-l-4 border-l-blue-500">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <CompanyLogo company="AHI Red Deer" size="sm" />
                        <div>
                          <div className="font-medium">AHI Red Deer</div>
                          <div className="text-sm text-gray-600">Business Services</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Linked Project</label>
                  <Card className="mt-2 border-l-4 border-l-green-500">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <FolderOpen className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">Customer Service Automation</div>
                          <div className="text-sm text-gray-600">Active Project</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <div className="h-[600px] flex bg-white rounded-lg border border-gray-200">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AHI Document Assistant</h3>
                    <p className="text-sm text-blue-100">Chat with your company documents • Secured • On-premise processing</p>
                  </div>
                  <div className="ml-auto">
                    <Badge className="bg-white/20 text-white border-white/30">
                      <Shield className="w-3 h-3 mr-1" />
                      Secure Mode
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {localChatMessages.map((message, index) => (
                    <div key={index} className={cn(
                      "flex gap-4",
                      message.role === "user" && "flex-row-reverse"
                    )}>
                      {/* Avatar */}
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        message.role === "user" 
                          ? "bg-gray-200" 
                          : "bg-blue-600"
                      )}>
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={cn(
                        "flex-1 max-w-[80%]",
                        message.role === "user" && "text-right"
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "text-sm font-medium",
                            message.role === "user" ? "text-gray-600" : "text-blue-600"
                          )}>
                            {message.role === "user" ? "You" : "AHI Assistant"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {message.timestamp}
                          </span>
                        </div>
                        
                        <div className={cn(
                          "p-3 rounded-lg border",
                          message.role === "user" 
                            ? "bg-gray-50 border-gray-200" 
                            : "bg-blue-50 border-blue-200"
                        )}>
                          {message.role === "user" ? (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed text-gray-900">
                              {message.content}
                            </p>
                          ) : (
                            <div className="text-sm leading-relaxed text-gray-900 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 prose-table:text-sm prose-th:px-3 prose-th:py-1.5 prose-td:px-3 prose-td:py-1.5 prose-table:border-collapse prose-th:border prose-td:border">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                          
                          {(message.sourceDocuments && message.sourceDocuments.length > 0) ? (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <p className="text-xs text-blue-600 mb-2">Source Documents (Top 2):</p>
                              <div className="space-y-2">
                                {message.sourceDocuments.map((doc, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 flex-1">
                                      <FileText className="w-3 h-3 text-blue-600 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-900 truncate">{doc.title}</p>
                                        <p className="text-xs text-gray-600">{doc.parent_folder}</p>
                                      </div>
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
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-blue-600">
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-blue-600">
                              <Download className="h-3 w-3 mr-1" />
                              Export
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-green-600">
                              <ThumbsUp className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-red-600">
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
              <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
                <div className="flex gap-3">
                  <Textarea
                    placeholder="Ask about AHI documents, contracts, policies, or any company information..."
                    value={localChatInput}
                    onChange={handleLocalInputChange}
                    onKeyDown={handleLocalKeyPress}
                    className="min-h-[50px] max-h-32 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    rows={2}
                    disabled={localIsLoading}
                  />
                  <Button 
                    onClick={handleLocalSendMessage}
                    disabled={!localChatInput.trim() || localIsLoading}
                    className="px-4 bg-blue-600 hover:bg-blue-700 text-white self-end disabled:opacity-50"
                  >
                    {localIsLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <div>Press Enter to send • Shift+Enter for new line</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${localIsLoading ? 'bg-orange-500 animate-pulse' : 'bg-blue-500'}`}></div>
                    <span>AHI Assistant {localIsLoading ? 'Processing...' : 'Ready'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="w-72 bg-gray-50 border-l border-gray-200 p-4 rounded-r-lg">
              <h4 className="font-semibold text-gray-900 mb-4">Quick Document Queries</h4>
              
              <div className="space-y-3 mb-6">
                {[
                  {
                    title: "Contract Search",
                    description: "Find all contracts and agreements",
                    icon: FileText,
                    prompt: "Show me all active contracts for AHI Red Deer"
                  },
                  {
                    title: "Financial Reports",
                    description: "Access financial documents",
                    icon: TrendingUp,
                    prompt: "What are our current financial metrics and budget status?"
                  },
                  {
                    title: "Employee Records",
                    description: "HR and staff documentation",
                    icon: Users,
                    prompt: "Show me employee training records and certifications"
                  },
                  {
                    title: "Compliance Docs",
                    description: "Safety and regulatory files",
                    icon: CheckCircle,
                    prompt: "Review our safety compliance and recent audits"
                  }
                ].map((action, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" 
                    onClick={() => setLocalChatInput(action.prompt)}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <action.icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 text-sm">{action.title}</h5>
                          <p className="text-xs text-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Document Stats */}
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-3">Document Library</h5>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Contracts</span>
                      </div>
                      <span className="text-sm text-gray-600">127</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Financial</span>
                      </div>
                      <span className="text-sm text-gray-600">89</span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium">HR Records</span>
                      </div>
                      <span className="text-sm text-gray-600">64</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-900 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Secure Document Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-blue-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>End-to-end encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>On-premise processing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    <span>Audit trail logging</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
  }

  if (selectedChatbot) {
    return (
      <>
        <ChatbotDetails chatbot={selectedChatbot} />
        {demoMode === selectedChatbot.id && <ChatbotDemo chatbot={selectedChatbot} />}
      </>
    )
  }

  const statsData = [
    {
      title: "Active Chatbots",
      value: chatbots.filter(c => c.status === 'active').length,
      icon: Bot,
      color: 'blue' as const,
      trend: { value: 25, isPositive: true }
    },
    {
      title: "Total Conversations",
      value: `${(chatbots.reduce((sum, c) => sum + c.performance.totalConversations, 0) / 1000).toFixed(1)}K`,
      icon: MessageSquare,
      color: 'green' as const,
      trend: { value: 18.3, isPositive: true }
    },
    {
      title: "Avg Satisfaction",
      value: `${(chatbots.reduce((sum, c) => sum + c.performance.satisfactionRating, 0) / chatbots.length).toFixed(1)}★`,
      icon: Star,
      color: 'yellow' as const,
      trend: { value: 0.3, isPositive: true }
    },
    {
      title: "Lead Conversions",
      value: chatbots.reduce((sum, c) => sum + c.performance.leadConversions, 0),
      icon: Target,
      color: 'purple' as const,
      trend: { value: 42.1, isPositive: true }
    }
  ]

  const filterOptions = [
    { key: 'all', label: 'All Chatbots', value: 'all' },
    { key: 'active', label: 'Active Only', value: 'active' },
    { key: 'testing', label: 'In Testing', value: 'testing' },
    { key: 'high-performance', label: 'High Performance (>4.5★)', value: 'high-performance' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Virtual Chatbots</h1>
          <p className="text-gray-600">Automated conversational workflows connecting projects to intelligent customer interactions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Chatbot
        </Button>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={statsData} />

      {/* Search and Filter */}
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filterValue={selectedFilter}
        onFilterChange={setSelectedFilter}
        filterOptions={filterOptions}
        placeholder="Search chatbots..."
        showExport={true}
        onExport={() => console.log('Export chatbots')}
        customActions={
          <Button variant="outline">
            <Brain className="w-4 h-4 mr-2" />
            AI Training
          </Button>
        }
      />

      {/* Chatbots Grid */}
      {filteredChatbots.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredChatbots.map((chatbot) => (
            <ChatbotCard key={chatbot.id} chatbot={chatbot} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bot}
          title="No chatbots found"
          description="No chatbots match your search criteria. Try adjusting your filters or create a new chatbot."
          actionLabel="Create First Chatbot"
          onAction={() => console.log('Create chatbot')}
        />
      )}

      {/* Demo Modal */}
      {demoMode && (
        <ChatbotDemo chatbot={chatbots.find(c => c.id === demoMode)!} />
      )}
    </div>
  )
}