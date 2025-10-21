// types/index.ts - Enhanced Data Models for Havenz Hub

export interface Company {
  id: string;
  name: string;
  description: string;
  logo?: string; // For company logos/icons
  establishedDate: string;
  revenue: number;
  status: "active" | "inactive" | "pending";
  industry: string;
  location: {
    address: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
  };
  contact: {
    primaryContact: string;
    email: string;
    phone: string;
  };
  departments: string[]; // Department IDs
  projects: string[]; // Project IDs
  properties: string[]; // Property IDs - NEW
  financials: {
    annualRevenue: number;
    quarterlyRevenue: number;
    budgetAllocated: number;
    budgetSpent: number;
  };
  integrations: {
    quickbooks?: boolean;
    googleSuite?: boolean;
    linkedin?: boolean;
    dext?: boolean;
    ringCentral?: boolean;
    basecamp?: boolean;
    dropbox?: boolean;
  };
  kpis: {
    efficiency: number;
    growth: number;
    satisfaction: number;
  };
  createdDate: string;
  lastUpdated: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  companyId: string; // LINKED TO COMPANY - NEW
  head: {
    name: string;
    email: string;
    phone: string;
    employeeId?: string;
  };
  employees: {
    total: number;
    active: number;
    onLeave: number;
    partTime: number;
  };
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
    quarterlyBudget: number;
  };
  projects: string[]; // Project IDs - LINKED TO PROJECTS
  tasks: {
    pending: number;
    completed: number;
    overdue: number;
    total: number;
  };
  documents: {
    total: number;
    recentUploads: number;
  };
  kpis: {
    efficiency: number;
    satisfaction: number;
    utilization: number;
    productivityScore: number;
  };
  properties: string[]; // Property IDs - NEW
  createdDate: string;
  lastUpdated: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  companyId: string; // LINKED TO COMPANY - ENHANCED
  departmentIds: string[]; // LINKED TO DEPARTMENTS - NEW
  propertyIds: string[]; // LINKED TO PROPERTIES - NEW
  status: "planning" | "active" | "on-hold" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  progress: number;
  startDate: string;
  endDate: string;
  actualEndDate?: string;
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
    contingency: number;
  };
  team: {
    lead: string;
    members: number;
    departments: string[];
    skillsRequired: string[];
  };
  milestones: {
    id: string;
    name: string;
    description: string;
    dueDate: string;
    status: "pending" | "completed" | "overdue";
    dependsOn?: string[];
  }[];
  documents: string[]; // Document IDs
  tasks: {
    total: number;
    completed: number;
    overdue: number;
    inProgress: number;
  };
  risks: {
    level: "low" | "medium" | "high";
    count: number;
    items: {
      id: string;
      description: string;
      impact: "low" | "medium" | "high";
      probability: "low" | "medium" | "high";
      mitigation: string;
      owner: string;
    }[];
  };
  integrations: string[]; // Connected services
  createdDate: string;
  lastUpdated: string;
}

// NEW - Properties as 4th Category
export interface Property {
  id: string;
  name: string;
  description: string;
  type: "office" | "warehouse" | "datacenter" | "residential" | "industrial" | "retail";
  status: "active" | "inactive" | "under-construction" | "maintenance";
  location: {
    address: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  specifications: {
    size: {
      totalArea: number; // sq ft
      usableArea: number;
      floors: number;
    };
    capacity: {
      employees: number;
      parkingSpots: number;
      serverRacks?: number; // for datacenters
    };
    utilities: {
      power: {
        capacity: number; // kW
        backup: boolean;
        renewable: boolean;
      };
      cooling: {
        type: string;
        capacity: number; // BTU
        efficiency: string;
      };
      connectivity: {
        fiber: boolean;
        redundant: boolean;
        bandwidth: string;
      };
    };
  };
  companyIds: string[]; // LINKED TO COMPANIES
  departmentIds: string[]; // LINKED TO DEPARTMENTS  
  projectIds: string[]; // LINKED TO PROJECTS
  financials: {
    purchasePrice?: number;
    currentValue: number;
    monthlyOperatingCosts: number;
    insuranceValue: number;
    taxAssessment: number;
  };
  security: {
    accessControl: boolean;
    cameraSystem: boolean;
    alarmSystem: boolean;
    securityPersonnel: boolean;
    bmsIntegrated: boolean; // Building Management System
  };
  certifications: string[]; // LEED, ISO, etc.
  documents: string[]; // Document IDs
  createdDate: string;
  lastUpdated: string;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  dueDate: string;
  assignee: {
    name: string;
    email: string;
    department: string;
  };
  // LINKED TO SPECIFIC ENTITIES - NEW
  linkedTo: {
    type: "company" | "project" | "department" | "property";
    id: string;
    name: string;
  };
  tags: string[];
  attachments: string[]; // Document IDs
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
  completedDate?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  lastModified: string;
  // ENHANCED LINKING
  companyId?: string; // LINKED TO COMPANY
  projectIds: string[]; // LINKED TO PROJECTS - ENHANCED
  departmentIds: string[]; // LINKED TO DEPARTMENTS - ENHANCED  
  propertyIds: string[]; // LINKED TO PROPERTIES - NEW
  status: "approved" | "pending" | "rejected" | "draft";
  version: string;
  tags: string[];
  accessLevel: "public" | "private" | "restricted";
  category: "contract" | "financial" | "technical" | "legal" | "hr" | "marketing" | "other";
  auditTrail: {
    action: string;
    user: string;
    timestamp: string;
    details?: string;
  }[];
  metadata: {
    fileHash?: string;
    encryption?: boolean;
    backupLocation?: string;
    retentionDate?: string;
  };
}

// Enhanced Integration Types
export interface Integration {
  id: string;
  name: string;
  type: "quickbooks" | "google-suite" | "linkedin" | "dext" | "ringcentral" | "basecamp" | "dropbox" | "chatgpt" | "custom";
  status: "connected" | "disconnected" | "error" | "pending";
  apiKey?: string;
  webhookUrl?: string;
  lastSync: string;
  syncFrequency: "real-time" | "hourly" | "daily" | "weekly" | "manual";
  permissions: string[];
  connectedEntities: {
    companies: string[];
    departments: string[];
    projects: string[];
    properties: string[];
  };
  configuration: Record<string, any>;
  createdDate: string;
  lastUpdated: string;
}

// Chatbot & Virtual Assistant Types
export interface ChatbotConfig {
  id: string;
  name: string;
  description: string;
  type: "customer-service" | "sales" | "support" | "lead-generation" | "appointment-booking";
  status: "active" | "inactive" | "testing";
  linkedProjectId?: string; // LINKED TO PROJECT
  linkedCompanyId?: string; // LINKED TO COMPANY
  configuration: {
    welcomeMessage: string;
    fallbackMessage: string;
    workingHours: {
      enabled: boolean;
      timezone: string;
      schedule: {
        [key: string]: { start: string; end: string; }; // monday: {start: "09:00", end: "17:00"}
      };
    };
    integrations: {
      phone: boolean;
      email: boolean;
      sms: boolean;
      webchat: boolean;
      voiceRecognition: boolean;
      multilingual: string[]; // ["en", "fr", "es"]
    };
    aiModel: "basic" | "advanced" | "custom";
    trainingData: string[]; // Document IDs for training
    analytics: {
      trackConversations: boolean;
      sentiment: boolean;
      leadScoring: boolean;
    };
  };
  performance: {
    totalConversations: number;
    successfulResolutions: number;
    averageResponseTime: number; // seconds
    satisfactionRating: number; // 1-5
    leadConversions: number;
  };
  createdDate: string;
  lastUpdated: string;
}

// Data Center & BMS Types
export interface DataCenterResource {
  id: string;
  name: string;
  type: "gpu-hours" | "compute-cluster" | "storage" | "bandwidth";
  propertyId: string; // LINKED TO PROPERTY
  specifications: {
    gpuType?: string; // "NVIDIA H100", "AMD MI300X"
    gpuCount?: number;
    memory?: number; // GB
    storage?: number; // TB  
    bandwidth?: number; // Gbps
    redundancy: "none" | "n+1" | "2n";
  };
  pricing: {
    hourly?: number; // For GPU hours
    monthly?: number; // For leasing
    setup?: number; // One-time setup
    currency: "CAD" | "USD";
  };
  availability: {
    total: number;
    allocated: number;
    available: number;
    reserved: number;
  };
  performance: {
    utilizationRate: number; // %
    uptime: number; // %
    averageLatency: number; // ms
  };
  clientAllocations: {
    companyId: string;
    allocated: number;
    startDate: string;
    endDate?: string;
    billingRate: number;
  }[];
  createdDate: string;
  lastUpdated: string;
}

export interface BMSDevice {
  id: string;
  name: string;
  type: "authenticator-phone" | "authenticator-tablet" | "access-control" | "camera" | "sensor" | "controller";
  manufacturer: "samsung" | "avigilon" | "honeywell" | "custom";
  model: string;
  propertyId: string; // LINKED TO PROPERTY
  location: {
    floor: number;
    room: string;
    coordinates: { x: number; y: number; };
  };
  status: "online" | "offline" | "maintenance" | "error";
  specifications: {
    connectivity: "ethernet" | "wifi" | "cellular" | "zigbee" | "bluetooth";
    powerSource: "wired" | "battery" | "solar";
    operatingTemp: { min: number; max: number; };
    ipRating?: string; // IP65, IP67, etc.
  };
  capabilities: string[]; // ["video-recording", "motion-detection", "facial-recognition", "access-control"]
  configuration: Record<string, any>;
  maintenance: {
    lastService: string;
    nextService: string;
    warrantyExpires: string;
    serviceProvider: string;
  };
  performance: {
    uptime: number; // %
    lastOnline: string;
    batteryLevel?: number; // %
    signalStrength?: number; // %
  };
  createdDate: string;
  lastUpdated: string;
}

// System Configuration
export interface SystemConfig {
  id: string;
  organizationName: string;
  primaryLogo: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number; // minutes
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      requireUppercase: boolean;
    };
  };
  integrations: string[]; // Integration IDs
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    slack: boolean;
  };
  backup: {
    frequency: "daily" | "weekly" | "monthly";
    location: "local" | "cloud" | "both";
    retentionDays: number;
  };
  createdDate: string;
  lastUpdated: string;
}

// Helper Types
export type EntityType = "company" | "department" | "project" | "property" | "document" | "todo";

export interface EntityLink {
  fromType: EntityType;
  fromId: string;
  toType: EntityType;
  toId: string;
  relationshipType: string; // "owns", "belongs_to", "assigned_to", "linked_to"
  createdDate: string;
}