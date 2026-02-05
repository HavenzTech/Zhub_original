"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, SlidersHorizontal, Loader2 } from "lucide-react";
import type { DocumentSearchRequest } from "@/types/bms";

interface DocumentSearchBarProps {
  onSearch: (request: DocumentSearchRequest) => Promise<void>;
  onClear: () => void;
  loading?: boolean;
  onToggleFilters?: () => void;
  showFiltersToggle?: boolean;
  filtersActive?: boolean;
}

export function DocumentSearchBar({
  onSearch,
  onClear,
  loading,
  onToggleFilters,
  showFiltersToggle = true,
  filtersActive,
}: DocumentSearchBarProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [classification, setClassification] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updatedAt");

  const handleSearch = useCallback(async () => {
    const request: DocumentSearchRequest = {
      query: query || undefined,
      status: status !== "all" ? status : undefined,
      classifications: classification !== "all" ? [classification] : undefined,
      sortBy,
      sortDirection: "desc",
      page: 1,
      pageSize: 25,
    };
    await onSearch(request);
  }, [query, status, classification, sortBy, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setQuery("");
    setStatus("all");
    setClassification("all");
    setSortBy("updatedAt");
    onClear();
  };

  const hasActiveFilters = status !== "all" || classification !== "all" || query.length > 0;

  return (
    <div className="space-y-3">
      {/* Main search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search documents by name, content, or tags..."
            className="pl-10"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button onClick={handleSearch} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>

        {showFiltersToggle && onToggleFilters && (
          <Button
            variant={filtersActive ? "default" : "outline"}
            onClick={onToggleFilters}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Quick filters row */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[140px] h-8 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select value={classification} onValueChange={setClassification}>
          <SelectTrigger className="w-[150px] h-8 text-sm">
            <SelectValue placeholder="Classification" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classifications</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
            <SelectItem value="confidential">Confidential</SelectItem>
            <SelectItem value="restricted">Restricted</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px] h-8 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updatedAt">Last Modified</SelectItem>
            <SelectItem value="createdAt">Date Created</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="fileSizeBytes">File Size</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8 text-sm text-gray-500"
          >
            <X className="w-3 h-3 mr-1" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
