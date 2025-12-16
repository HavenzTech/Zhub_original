import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono as GeistMono } from "next/font/google"
import "./globals.css"
import { AppHealthGate } from "@/components/common/AppHealthGate"

// Use Inter for better readability and modern look
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
})

const geistMono = GeistMono({ 
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Havenz Hub - Organizational Intelligence Platform",
  description: "Secure organizational intelligence and management platform for modern businesses",
  keywords: ["organizational management", "business intelligence", "document control", "workflow automation"],
  authors: [{ name: "Havenz Hub Team" }],
  robots: "index, follow",
}

// Separate viewport export (required for Next.js 14+)
export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    colorScheme: 'light',
    themeColor: '#00C49A',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased min-h-full bg-background text-foreground selection:bg-primary/20 selection:text-primary`}
        suppressHydrationWarning
      >
        <AppHealthGate>
          <div className="min-h-screen bg-gradient-to-br from-background to-muted/10">
            {children}
          </div>
        </AppHealthGate>

        {/* Optional: Add a global loading indicator or other global components */}
        <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2" />

        {/* Optional: Add a backdrop for modals */}
        <div id="modal-backdrop" className="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      </body>
    </html>
  )
}