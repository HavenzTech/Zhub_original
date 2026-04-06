import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono as GeistMono } from "next/font/google"
import "./globals.css"
import "driver.js/dist/driver.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/lib/query/QueryProvider"
import { AppHealthGate } from "@/components/common/AppHealthGate"
import { Toaster } from "@/components/ui/sonner"

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
  icons: {
    icon: "/logos/H_favIcon.png",
    apple: "/logos/H_favIcon.png",
  },
}

// Separate viewport export (required for Next.js 14+)
export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
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
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
          <AppHealthGate>
            <div className="min-h-screen bg-gradient-to-br from-background to-muted/10">
              {children}
            </div>
          </AppHealthGate>
          </QueryProvider>

          <Toaster richColors position="top-right" />

          {/* Optional: Add a backdrop for modals */}
          <div id="modal-backdrop" className="hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        </ThemeProvider>
      </body>
    </html>
  )
}