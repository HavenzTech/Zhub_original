// app/bms-hardware/page.tsx - BMS Hardware & Authenticator Devices Landing Page
"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Shield,
  Smartphone,
  Tablet,
  Camera,
  Lock,
  Fingerprint,
  Eye,
  Wifi,
  Battery,
  Zap,
  CheckCircle,
  Star,
  ShoppingCart,
  Download,
  Play,
  ExternalLink,
  Award,
  Users,
  Building2,
  Settings,
  Activity,
  Globe,
  Phone,
  Mail,
  Clock,
  Truck,
  CreditCard,
  FileText,
  Target,
  Gauge,
  Plus,
  ArrowRight
} from 'lucide-react'

export default function BMSHardwarePage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("products")

  // BMS Hardware Products
  const products = [
    {
      id: "auth-phone-pro",
      name: "Havenz Authenticator Phone Pro",
      type: "phone",
      description: "Professional-grade smartphone with integrated biometric authentication and building management capabilities",
      price: 1299,
      image: "/products/auth-phone-pro.jpg",
      specs: {
        display: "6.8\" Super AMOLED, 3200x1440",
        processor: "Snapdragon 8 Gen 3",
        memory: "12GB RAM, 512GB Storage",
        battery: "5000mAh with wireless charging",
        biometrics: ["Fingerprint", "Face ID", "Voice Recognition", "Iris Scan"],
        connectivity: ["5G", "WiFi 6E", "Bluetooth 5.3", "NFC", "Ultra-Wideband"],
        security: "Military-grade encryption, Secure Element",
        durability: "IP68, MIL-STD-810H",
        bms: ["Access Control", "Environmental Monitoring", "Emergency Alert", "Video Intercom"]
      },
      features: [
        "Multi-factor biometric authentication",
        "Integrated building access control",
        "Real-time facility monitoring",
        "Emergency communication system",
        "Encrypted data transmission",
        "24/7 technical support"
      ],
      inStock: true,
      rating: 4.9,
      reviews: 247
    },
    {
      id: "auth-tablet-enterprise",
      name: "Havenz Authenticator Tablet Enterprise",
      type: "tablet",
      description: "Large-format tablet designed for reception areas, security checkpoints, and facility management stations",
      price: 2199,
      image: "/products/auth-tablet-enterprise.jpg",
      specs: {
        display: "12.9\" LCD, 2732x2048, Anti-glare",
        processor: "Custom ARM Cortex-A78",
        memory: "16GB RAM, 1TB Storage",
        battery: "12000mAh, 8+ hour operation",
        biometrics: ["Multi-touch Fingerprint", "Advanced Face Recognition", "Palm Print"],
        connectivity: ["WiFi 6E", "Ethernet", "Bluetooth 5.3", "4G LTE (optional)"],
        security: "Hardware security module, Tamper detection",
        durability: "IP65, Vandal-resistant housing",
        bms: ["Visitor Management", "Access Logs", "Environmental Display", "Emergency Controls"]
      },
      features: [
        "Large touchscreen interface",
        "Visitor check-in system",
        "Real-time access logging",
        "Integration with HVAC controls",
        "Emergency alert capabilities",
        "Multi-language support"
      ],
      inStock: true,
      rating: 4.8,
      reviews: 89
    },
    {
      id: "auth-combo-system",
      name: "Havenz Complete Authentication System",
      type: "combo",
      description: "Comprehensive package including phone, tablet, and supporting infrastructure for complete facility security",
      price: 4999,
      image: "/products/auth-combo-system.jpg",
      specs: {
        included: "1x Auth Phone Pro, 1x Auth Tablet Enterprise, Security Hub, Network Bridge",
        coverage: "Up to 50,000 sq ft facility",
        users: "Supports 500+ authenticated users",
        integration: "Full BMS integration included",
        support: "White-glove installation and 3-year support",
        warranty: "5-year comprehensive warranty",
        deployment: "Professional installation included",
        training: "On-site staff training (2 days)"
      },
      features: [
        "Complete turnkey solution",
        "Professional installation",
        "Staff training included",
        "24/7 monitoring support",
        "Regular software updates",
        "Hardware replacement guarantee"
      ],
      inStock: true,
      rating: 4.9,
      reviews: 34,
      popular: true
    }
  ]

  // BMS System Components
  const bmsComponents = [
    {
      name: "Samsung Galaxy Tab Active4 Pro BMS Edition",
      manufacturer: "Samsung",
      type: "Tablet",
      description: "Rugged tablet optimized for building management with custom BMS software suite",
      features: ["8\" Rugged Display", "IP68 Rating", "Replaceable Battery", "Integrated Barcode Scanner"],
      price: 899,
      applications: ["Maintenance Rounds", "Asset Tracking", "Work Order Management", "Safety Inspections"]
    },
    {
      name: "Avigilon H5A Security Camera System",
      manufacturer: "Avigilon",
      type: "Camera",
      description: "AI-powered security cameras with advanced analytics and facial recognition",
      features: ["4K Resolution", "AI Analytics", "Facial Recognition", "License Plate Detection"],
      price: 1299,
      applications: ["Perimeter Security", "Access Monitoring", "Incident Detection", "Traffic Analysis"]
    },
    {
      name: "Honeywell Access Control Panel",
      manufacturer: "Honeywell",
      type: "Controller",
      description: "Central access control system supporting multiple authentication methods",
      features: ["Multi-door Control", "Biometric Integration", "Real-time Monitoring", "Mobile Management"],
      price: 2199,
      applications: ["Door Control", "Time & Attendance", "Visitor Management", "Security Integration"]
    }
  ] as const

  // Customer Integration Demo
  const demoFacility = {
    name: "Agritech Haven Research Facility",
    location: "Red Deer, Alberta",
    size: "85,000 sq ft",
    employees: 120,
    securityLevel: "High",
    implementation: {
      devices: 47,
      accessPoints: 23,
      cameras: 31,
      sensors: 89
    },
    results: {
      securityIncidents: "Reduced by 89%",
      accessTime: "Improved by 67%",
      operationalEfficiency: "Increased by 34%",
      maintenanceCosts: "Reduced by 45%"
    },
    testimonial: "The Havenz BMS system has transformed our facility security and operations. The seamless integration and intuitive interface have made managing our complex research facility remarkably simple.",
    contact: "Dr. Sarah Mitchell, Facility Director"
  }

  const ProductCard = ({ product }: { product: typeof products[number] }) => (
    <Card className={`cursor-pointer transition-all hover:shadow-lg ${selectedProduct === product.id ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center" aria-hidden>
              {product.type === 'phone' && <Smartphone className="w-6 h-6 text-blue-600" />}
              {product.type === 'tablet' && <Tablet className="w-6 h-6 text-blue-600" />}
              {product.type === 'combo' && <Shield className="w-6 h-6 text-blue-600" />}
            </div>
            <div>
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1" aria-label={`Rating ${product.rating} out of 5`}>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                {product.popular && <Badge variant="destructive" className="text-xs">POPULAR</Badge>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">${product.price.toLocaleString()}</div>
            <Badge variant={product.inStock ? "default" : "secondary"} className="text-xs">
              {product.inStock ? "In Stock" : "Pre-Order"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">{product.description}</p>

        <div className="space-y-3 mb-4">
          <div className="text-sm font-medium text-gray-900">Key Features:</div>
          <div className="grid grid-cols-1 gap-2">
            {product.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => setSelectedProduct(product.id)}
            aria-label={`View details for ${product.name}`}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" aria-label={`Add ${product.name} to cart`}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const ProductDetails = ({ product }: { product: typeof products[number] }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedProduct(null)} aria-label="Back to Products">
          ← Back to Products
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Spec Sheet
          </Button>
          <Button>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Purchase Now
          </Button>
        </div>
      </div>

      {/* Product Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center" aria-hidden>
              {product.type === 'phone' && <Smartphone className="w-16 h-16 text-gray-400" />}
              {product.type === 'tablet' && <Tablet className="w-16 h-16 text-gray-400" />}
              {product.type === 'combo' && <Shield className="w-16 h-16 text-gray-400" />}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                {product.popular && <Badge variant="destructive">POPULAR CHOICE</Badge>}
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1" aria-label={`Rating ${product.rating} out of 5`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-sm font-medium ml-1">{product.rating}</span>
                  <span className="text-sm text-gray-500">({product.reviews} reviews)</span>
                </div>
                <Badge variant={product.inStock ? "default" : "secondary"}>
                  {product.inStock ? "✓ In Stock" : "Pre-Order"}
                </Badge>
              </div>

              <p className="text-gray-600 mb-4">{product.description}</p>

              <div className="flex items-center gap-6">
                <div className="text-3xl font-bold text-blue-600">${product.price.toLocaleString()}</div>
                <div className="text-sm text-gray-600">
                  <div>Free shipping included</div>
                  <div>30-day money-back guarantee</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specifications */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Specifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-gray-600 capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-gray-900 font-semibold text-right">
                  {Array.isArray(value) ? (value as string[]).join(', ') : (value as string)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Features & Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-900">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const results = [
    { label: 'Security Incidents', value: demoFacility.results.securityIncidents },
    { label: 'Access Time', value: demoFacility.results.accessTime },
    { label: 'Operational Efficiency', value: demoFacility.results.operationalEfficiency },
    { label: 'Maintenance Costs', value: demoFacility.results.maintenanceCosts }
  ] as const

  const faqs = [
    {
      q: 'Do you support Samsung Knox device lockdown?',
      a: 'Yes. We provide Knox Configure profiles (auto-launch, kiosk lockdown) and Knox Manage for OTA updates, device health, and remote wipe.'
    },
    {
      q: 'How does biometric data get stored?',
      a: 'We only store face embeddings, never raw images. Embeddings are encrypted at rest with AES-256 and rotated keys; transit is TLS 1.2+.'
    },
    {
      q: 'What if internet goes down?',
      a: 'Edge devices buffer data with a write-ahead log and maintain local access rules. When connectivity returns, they sync with the cloud.'
    },
    {
      q: 'Can we integrate existing access panels and cameras?',
      a: 'Yes. We support common protocols (Wiegand, OSDP, ONVIF, Modbus, MQTT) and have adapters for Honeywell/Avigilon ecosystems.'
    }
  ] as const

  const popularBadges = useMemo(() => (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <div className="text-3xl font-bold">500+</div>
        <div className="text-blue-200 text-sm">Installations</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold">99.9%</div>
        <div className="text-blue-200 text-sm">Uptime</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold">24/7</div>
        <div className="text-blue-200 text-sm">Support</div>
      </div>
    </div>
  ), [])

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold mb-4">Secure BMS Hardware Solutions</h1>
              <p className="text-blue-100 mb-6 text-lg">
                Professional-grade authenticator devices and building management systems designed for enterprise security and operational excellence.
              </p>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="text-blue-600 bg-white hover:bg-gray-100">
                  <Play className="w-4 h-4 mr-2" />
                  Watch Demo
                </Button>
                <Button variant="ghost" className="text-white border-white hover:bg-blue-700">
                  <Phone className="w-4 h-4 mr-2" />
                  Schedule Consultation
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-4" aria-hidden>
              {popularBadges}
            </div>
          </div>
        </div>
      </div>

      {selectedProduct ? (
        <ProductDetails product={products.find(p => p.id === selectedProduct)!} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="bms-systems">BMS Systems</TabsTrigger>
            <TabsTrigger value="integration">Integration Demo</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Authenticator Hardware</h2>
                <p className="text-gray-600">Professional-grade devices for secure facility access and management</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Compare Products
                </Button>
                <Button>
                  <Mail className="w-4 h-4 mr-2" />
                  Request Quote
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Why Choose Havenz Hardware */}
            <Card className="bg-gray-50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Why Choose Havenz BMS Hardware?</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Enterprise Security</h4>
                    <p className="text-sm text-gray-600">Military-grade encryption and multi-factor authentication for maximum security</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Seamless Integration</h4>
                    <p className="text-sm text-gray-600">Native integration with Havenz Hub and existing building management systems</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Expert Support</h4>
                    <p className="text-sm text-gray-600">24/7 technical support with white-glove installation and training services</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bms-systems" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Next-Gen BMS System Components</h2>
                <p className="text-gray-600">Samsung devices, access systems, and Avigilon cameras for comprehensive facility management</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bmsComponents.map((component, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center" aria-hidden>
                          {component.type === 'Tablet' && <Tablet className="w-6 h-6 text-gray-600" />}
                          {component.type === 'Camera' && <Camera className="w-6 h-6 text-gray-600" />}
                          {component.type === 'Controller' && <Settings className="w-6 h-6 text-gray-600" />}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{component.name}</CardTitle>
                          <p className="text-sm text-gray-600">{component.manufacturer}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">${component.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Starting at</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{component.description}</p>

                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-2">Key Features</div>
                        <div className="flex flex-wrap gap-1">
                          {component.features.map((feature, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{feature}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium mb-2">Applications</div>
                        <div className="text-sm text-gray-600">{component.applications.join(' • ')}</div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" className="flex-1">
                        <FileText className="w-4 h-4 mr-2" />
                        Datasheet
                      </Button>
                      <Button className="flex-1">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* System Architecture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Complete System Architecture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Access Control</h4>
                    <p className="text-sm text-gray-600">Multi-factor authentication with biometric readers and smart cards</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Camera className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Video Surveillance</h4>
                    <p className="text-sm text-gray-600">AI-powered cameras with facial recognition and behavior analytics</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Environmental Monitoring</h4>
                    <p className="text-sm text-gray-600">Temperature, humidity, air quality, and energy usage tracking</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Gauge className="w-8 h-8 text-orange-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Central Management</h4>
                    <p className="text-sm text-gray-600">Unified dashboard for monitoring and controlling all building systems</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integration" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Customer Integration Demo</h2>
              <p className="text-gray-600">See how one facility is secured with Havenz Hub</p>
            </div>

            {/* Demo Video Section */}
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Customer Success Story</h3>
                    <p className="text-green-100 mb-4">Watch how Agritech Haven transformed their facility security</p>
                    <Button variant="outline" className="text-green-600 bg-white hover:bg-gray-100">
                      <Play className="w-4 h-4 mr-2" />
                      Watch 5-Minute Demo
                    </Button>
                  </div>
                  <div className="hidden md:block" aria-hidden>
                    <div className="w-32 h-32 bg-white/20 rounded-lg flex items-center justify-center">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facility Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {demoFacility.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Facility Overview</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location</span>
                        <span className="font-medium">{demoFacility.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size</span>
                        <span className="font-medium">{demoFacility.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Employees</span>
                        <span className="font-medium">{demoFacility.employees}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Security Level</span>
                        <Badge className="bg-red-100 text-red-800">{demoFacility.securityLevel}</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Implementation Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Devices</span>
                        <span className="font-medium">{demoFacility.implementation.devices}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Access Points</span>
                        <span className="font-medium">{demoFacility.implementation.accessPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Security Cameras</span>
                        <span className="font-medium">{demoFacility.implementation.cameras}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Environmental Sensors</span>
                        <span className="font-medium">{demoFacility.implementation.sensors}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Implementation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {results.map((r) => (
                    <div key={r.label} className="p-4 rounded-lg border bg-white">
                      <div className="text-sm text-gray-600">{r.label}</div>
                      <div className="text-2xl font-bold mt-1">{r.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="italic text-gray-700">“{demoFacility.testimonial}”</p>
                  <p className="text-sm text-gray-500 mt-2">— {demoFacility.contact}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Talk to an Engineer</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => e.preventDefault()}>
                    <Input aria-label="Your name" placeholder="Full Name" required />
                    <Input aria-label="Your email" placeholder="Work Email" type="email" required />
                    <Input aria-label="Your phone" placeholder="Phone (optional)" className="md:col-span-2" />
                    <Textarea aria-label="Message" placeholder="Tell us about your facility and goals…" className="md:col-span-2 min-h-[120px]" />
                    <div className="md:col-span-2 flex items-center gap-3">
                      <Button type="submit">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Book a Call
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Quick Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Clock className="w-4 h-4" /> SLA & Warranty</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-700">
                    <div>• Standard response: <strong>4 hours</strong> (24/7 critical)</div>
                    <div>• Hardware warranty: <strong>3–5 years</strong> depending on model</div>
                    <div>• Advance replacement & on-site options available</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Download className="w-4 h-4" /> Downloads</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-2 text-sm">
                    <Button variant="outline" className="justify-start"><FileText className="w-4 h-4 mr-2" /> Security & Compliance Overview (PDF)</Button>
                    <Button variant="outline" className="justify-start"><FileText className="w-4 h-4 mr-2" /> Device Datasheets Bundle (ZIP)</Button>
                    <Button variant="outline" className="justify-start"><FileText className="w-4 h-4 mr-2" /> Integration Guide: Honeywell/Avigilon</Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {faqs.map((f, i) => (
                  <div key={i}>
                    <div className="font-semibold">{f.q}</div>
                    <div className="text-sm text-gray-700 mt-1">{f.a}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* CTA Footer */}
      {!selectedProduct && (
        <Card className="border-dashed">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Ready to modernize your facility?</h3>
              <p className="text-gray-600">Get a tailored hardware quote and deployment plan in 48 hours.</p>
            </div>
            <div className="flex gap-2">
              <Button>
                <CreditCard className="w-4 h-4 mr-2" />
                Get Pricing
              </Button>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                See Reference Architecture
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
