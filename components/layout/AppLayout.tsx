"use client";

import { useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { AiAssistantSidebar } from "./AiAssistantSidebar";
import { CommandPalette } from "./CommandPalette";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { BreadcrumbProvider } from "@/contexts/BreadcrumbContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const openCommandPalette = useCallback(() => setCommandPaletteOpen(true), []);

  return (
    <div className="flex h-screen bg-stone-50 dark:bg-stone-900">
      {/* Sidebar */}
      <Sidebar onOpenCommandPalette={openCommandPalette} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
        {/* Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Page Content */}
          <main className="scrollbar-modern flex-1 overflow-auto p-4 md:p-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>

        {/* AI Assistant Sidebar */}
        <AiAssistantSidebar />
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  );
}

// Wrapper component that provides the BreadcrumbContext
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <BreadcrumbProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </BreadcrumbProvider>
  );
}
