"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, Search, X } from "lucide-react";
import type { DocumentSearchRequest, DocumentTypeDto } from "@/types/bms";

interface DocumentFilterPanelProps {
  onSearch: (request: DocumentSearchRequest) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  documentTypes?: DocumentTypeDto[];
  folders?: { id: string; name: string }[];
  departments?: { id: string; name: string }[];
  projects?: { id: string; name: string }[];
}

export function DocumentFilterPanel({
  onSearch,
  onClose,
  loading,
  documentTypes = [],
  folders = [],
  departments = [],
  projects = [],
}: DocumentFilterPanelProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<string>("");
  const [classification, setClassification] = useState<string>("");
  const [documentTypeId, setDocumentTypeId] = useState<string>("");
  const [folderId, setFolderId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [includeSubfolders, setIncludeSubfolders] = useState(true);
  const [sortBy, setSortBy] = useState<string>("updatedAt");
  const [sortDirection, setSortDirection] = useState<string>("desc");

  const handleApplyFilters = async () => {
    const request: DocumentSearchRequest = {
      query: query || undefined,
      status: status || undefined,
      classifications: classification ? [classification] : undefined,
      documentTypeIds: documentTypeId ? [documentTypeId] : undefined,
      folderId: folderId || undefined,
      departmentId: departmentId || undefined,
      projectId: projectId || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      includeSubfolders,
      sortBy,
      sortDirection,
      page: 1,
      pageSize: 25,
    };
    await onSearch(request);
  };

  const handleReset = () => {
    setQuery("");
    setStatus("");
    setClassification("");
    setDocumentTypeId("");
    setFolderId("");
    setDepartmentId("");
    setProjectId("");
    setDateFrom("");
    setDateTo("");
    setIncludeSubfolders(true);
    setSortBy("updatedAt");
    setSortDirection("desc");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <SlidersHorizontal className="w-4 h-4" />
          Advanced Filters
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Text search */}
        <div className="grid gap-2">
          <Label className="text-sm">Search Text</Label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, content..."
            className="h-8 text-sm"
          />
        </div>

        {/* Status */}
        <div className="grid gap-2">
          <Label className="text-sm">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Classification */}
        <div className="grid gap-2">
          <Label className="text-sm">Classification</Label>
          <Select value={classification} onValueChange={setClassification}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder="Any classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="confidential">Confidential</SelectItem>
              <SelectItem value="restricted">Restricted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Document Type */}
        {documentTypes.length > 0 && (
          <div className="grid gap-2">
            <Label className="text-sm">Document Type</Label>
            <Select value={documentTypeId} onValueChange={setDocumentTypeId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((dt) => (
                  <SelectItem key={dt.id} value={dt.id!}>
                    {dt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Folder */}
        {folders.length > 0 && (
          <div className="grid gap-2">
            <Label className="text-sm">Folder</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Any folder" />
              </SelectTrigger>
              <SelectContent>
                {folders.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {folderId && (
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-500">Include subfolders</Label>
                <Switch
                  checked={includeSubfolders}
                  onCheckedChange={setIncludeSubfolders}
                />
              </div>
            )}
          </div>
        )}

        {/* Department */}
        {departments.length > 0 && (
          <div className="grid gap-2">
            <Label className="text-sm">Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Any department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Project */}
        {projects.length > 0 && (
          <div className="grid gap-2">
            <Label className="text-sm">Project</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Any project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1">
            <Label className="text-sm">From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="grid gap-1">
            <Label className="text-sm">To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1">
            <Label className="text-sm">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Last Modified</SelectItem>
                <SelectItem value="createdAt">Date Created</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="fileSizeBytes">File Size</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label className="text-sm">Direction</Label>
            <Select value={sortDirection} onValueChange={setSortDirection}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            size="sm"
            onClick={handleApplyFilters}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <Search className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Search className="w-4 h-4 mr-1" />
                Search
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
