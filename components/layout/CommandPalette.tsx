"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FolderOpen,
  Plus,
  FileText,
  Home,
  Building2,
  Users,
  ClipboardCheck,
  Bot,
  Settings,
} from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
      onOpenChange(false);
    },
    [router, onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search documents, projects, commands..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => navigate("/document-control")}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
            <CommandShortcut>⌘U</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/projects")}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
            <CommandShortcut>⌘N</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => navigate("/document-control")}>
            <FileText className="mr-2 h-4 w-4" />
            Browse Documents
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => navigate("/companies")}>
            <Building2 className="mr-2 h-4 w-4" />
            Companies
          </CommandItem>
          <CommandItem onSelect={() => navigate("/departments")}>
            <Users className="mr-2 h-4 w-4" />
            Departments
          </CommandItem>
          <CommandItem onSelect={() => navigate("/projects")}>
            <FolderOpen className="mr-2 h-4 w-4" />
            Projects
          </CommandItem>
          <CommandItem onSelect={() => navigate("/properties")}>
            <Home className="mr-2 h-4 w-4" />
            Properties
          </CommandItem>
          <CommandItem onSelect={() => navigate("/document-control")}>
            <FileText className="mr-2 h-4 w-4" />
            Document Control
          </CommandItem>
          <CommandItem onSelect={() => navigate("/workflow-tasks")}>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            Workflow Tasks
          </CommandItem>
          <CommandItem onSelect={() => navigate("/z-ai")}>
            <Bot className="mr-2 h-4 w-4" />
            Z AI Assistant
          </CommandItem>
          <CommandItem onSelect={() => navigate("/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
