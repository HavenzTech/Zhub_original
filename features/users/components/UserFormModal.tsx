"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { UserResponse, CreateUserRequest, UserRole, AreaSelection } from "@/types/bms";
import { Switch } from "@/components/ui/switch";
import {
  UserPlus,
  Check,
  Loader2,
  Upload,
  X,
  User,
  ArrowRight,
  ArrowLeft,
  Building2,
  MapPin,
  ScanFace,
  AlertCircle,
} from "lucide-react";
import { bmsApi } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";

type Step = 1 | 2 | 3;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  formData: CreateUserRequest;
  setFormData: (data: CreateUserRequest) => void;
  editingUser?: UserResponse | null;
  editFormData?: { name: string; pictureUrl: string; role: string };
  setEditFormData?: (data: { name: string; pictureUrl: string; role: string }) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  avatarFile?: File | null;
  setAvatarFile?: (file: File | null) => void;
  areaSelections?: AreaSelection[];
  onAreaSelectionsChange?: (selections: AreaSelection[]) => void;
  accessLevel?: string;
  onAccessLevelChange?: (level: string) => void;
}

// ─── Edit mode (unchanged) ───────────────────────────────────────────────────

function EditForm({
  open,
  onOpenChange,
  editingUser,
  editFormData,
  setEditFormData,
  isSubmitting,
  onSubmit,
  avatarFile,
  setAvatarFile,
}: Omit<UserFormModalProps, "mode" | "formData" | "setFormData">) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB"); return; }
    setAvatarFile?.(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarFile?.(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayAvatarUrl = avatarPreview || editingUser?.pictureUrl;

  if (!editingUser || !editFormData || !setEditFormData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user profile information and role assignment.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email (read-only)</Label>
            <Input id="edit-email" type="email" value={editingUser.email ?? ""} disabled
              className="bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 opacity-100" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name *</Label>
            <Input id="edit-name" placeholder="John Doe" value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-role">Role</Label>
            <Select value={editFormData.role || editingUser.role || "employee"}
              onValueChange={(value) => setEditFormData({ ...editFormData, role: value })}>
              <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee - View & work on assigned tasks</SelectItem>
                <SelectItem value="project_lead">Project Lead - Manage assigned projects</SelectItem>
                <SelectItem value="dept_manager">Dept Manager - Manage assigned departments</SelectItem>
                <SelectItem value="admin">Admin - Full company control</SelectItem>
                <SelectItem value="super_admin">CEO - Platform-wide access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden bg-gray-50">
                {displayAvatarUrl ? (
                  <Image src={displayAvatarUrl} alt="Avatar" width={80} height={80} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="edit-avatar" />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />{displayAvatarUrl ? "Change" : "Upload"}
                  </Button>
                  {(avatarFile || avatarPreview) && (
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemoveAvatar}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {avatarFile && <p className="text-xs text-gray-500">Selected: {avatarFile.name}</p>}
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Check className="w-4 h-4 mr-2" />Save Changes</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Basic Info" },
    { n: 2, label: "Area Access" },
    { n: 3, label: "Face Enrollment" },
  ] as const;

  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map(({ n, label }, i) => (
        <div key={n} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
              ${step > n ? "bg-accent-cyan text-white" : step === n ? "bg-accent-cyan text-white ring-2 ring-accent-cyan/30" : "bg-stone-100 dark:bg-stone-800 text-stone-400 dark:text-stone-500"}`}>
              {step > n ? <Check className="w-3.5 h-3.5" /> : n}
            </div>
            <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${step === n ? "text-accent-cyan" : "text-stone-400 dark:text-stone-500"}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-px flex-1 mb-4 mx-1 transition-colors ${step > n + 1 || (step > n) ? "bg-accent-cyan" : "bg-stone-200 dark:bg-stone-700"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Add mode wizard ──────────────────────────────────────────────────────────

export function UserFormModal({
  open,
  onOpenChange,
  mode,
  formData,
  setFormData,
  editingUser,
  editFormData,
  setEditFormData,
  isSubmitting,
  onSubmit,
  avatarFile,
  setAvatarFile,
  areaSelections = [],
  onAreaSelectionsChange,
  accessLevel = "full",
  onAccessLevelChange,
}: UserFormModalProps) {
  // Edit mode: delegate to separate component
  if (mode === "edit") {
    return (
      <EditForm
        open={open}
        onOpenChange={onOpenChange}
        editingUser={editingUser}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
      />
    );
  }

  return (
    <AddWizard
      open={open}
      onOpenChange={onOpenChange}
      formData={formData}
      setFormData={setFormData}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      avatarFile={avatarFile}
      setAvatarFile={setAvatarFile}
      areaSelections={areaSelections}
      onAreaSelectionsChange={onAreaSelectionsChange}
      accessLevel={accessLevel}
      onAccessLevelChange={onAccessLevelChange}
    />
  );
}

// ─── Wizard implementation ────────────────────────────────────────────────────

function AddWizard({
  open,
  onOpenChange,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  avatarFile,
  setAvatarFile,
  areaSelections,
  onAreaSelectionsChange,
  accessLevel,
  onAccessLevelChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CreateUserRequest;
  setFormData: (data: CreateUserRequest) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  avatarFile?: File | null;
  setAvatarFile?: (file: File | null) => void;
  areaSelections: AreaSelection[];
  onAreaSelectionsChange?: (s: AreaSelection[]) => void;
  accessLevel: string;
  onAccessLevelChange?: (l: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [step, setStep] = useState<Step>(1);

  // Step 2 state
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [areas, setAreas] = useState<any[]>([]);
  const [terminalAreaIds, setTerminalAreaIds] = useState<Set<string>>(new Set());
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Reset wizard state when modal opens/closes; ensure bmsApi has credentials
  useEffect(() => {
    if (open) {
      const token = authService.getToken();
      const companyId = authService.getCurrentCompanyId();
      if (token) bmsApi.setToken(token);
      if (companyId) bmsApi.setCompanyId(companyId);
      setStep(1);
      setSelectedPropertyId("");
      setAreas([]);
      setAvatarPreview(null);
    }
  }, [open]);

  // Fetch properties + terminals when entering step 2
  useEffect(() => {
    if (step === 2 && properties.length === 0) {
      setLoadingProperties(true);
      Promise.all([
        bmsApi.properties.getAll(),
        bmsApi.terminals.getAll().catch(() => []),
      ]).then(([propRes, termRes]: any[]) => {
        if (Array.isArray(propRes)) setProperties(propRes);
        else if (propRes?.data && Array.isArray(propRes.data)) setProperties(propRes.data);
        else if (propRes?.items && Array.isArray(propRes.items)) setProperties(propRes.items);

        const terminals = Array.isArray(termRes) ? termRes
          : termRes?.data && Array.isArray(termRes.data) ? termRes.data
          : termRes?.items && Array.isArray(termRes.items) ? termRes.items
          : [];
        setTerminalAreaIds(new Set(terminals.map((t: any) => t.area?.id).filter(Boolean)));
      }).catch(() => setProperties([]))
        .finally(() => setLoadingProperties(false));
    }
  }, [step, properties.length]);

  // Fetch areas when property selected
  useEffect(() => {
    if (!selectedPropertyId) { setAreas([]); return; }
    setLoadingAreas(true);
    bmsApi.properties.getAreas(selectedPropertyId)
      .then((res: any) => {
        if (Array.isArray(res)) return setAreas(res);
        if (res?.data && Array.isArray(res.data)) return setAreas(res.data);
        if (res?.items && Array.isArray(res.items)) return setAreas(res.items);
        if (res?.areas && Array.isArray(res.areas)) return setAreas(res.areas);
        setAreas([]);
      })
      .catch(() => setAreas([]))
      .finally(() => setLoadingAreas(false));
  }, [selectedPropertyId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB"); return; }
    setAvatarFile?.(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarFile?.(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleArea = (area: any) => {
    const propertyName = properties.find((p) => p.id === selectedPropertyId)?.name ?? "Unknown Property";
    const existing = areaSelections.findIndex((a) => a.areaId === area.id);
    if (existing >= 0) {
      onAreaSelectionsChange?.(areaSelections.filter((_, i) => i !== existing));
    } else {
      onAreaSelectionsChange?.([...areaSelections, { areaId: area.id, areaName: area.name ?? area.id, propertyId: selectedPropertyId, propertyName }]);
    }
  };

  const step1Valid = formData.email.trim() && formData.name.trim() && formData.role;

  const displayAvatarUrl = avatarPreview || formData.pictureUrl;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isSubmitting) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-accent-cyan" />
            Add New User
          </DialogTitle>
          <DialogDescription>
            Create a new user account. A temporary password will be generated.
          </DialogDescription>
        </DialogHeader>

        <StepIndicator step={step} />

        {/* ── Step 1: Basic Info ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="user@example.com" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="John Doe" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee - View & work on assigned tasks</SelectItem>
                  <SelectItem value="project_lead">Project Lead - Manage assigned projects</SelectItem>
                  <SelectItem value="dept_manager">Dept Manager - Manage assigned departments</SelectItem>
                  <SelectItem value="admin">Admin - Full company control</SelectItem>
                  <SelectItem value="super_admin">CEO - Platform-wide access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Avatar upload */}
            <div className="space-y-2">
              <Label>Profile Picture (optional)</Label>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden bg-gray-50">
                  {displayAvatarUrl ? (
                    <Image src={displayAvatarUrl} alt="Avatar" width={64} height={64} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <User className="w-7 h-7 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="add-avatar" />
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />{displayAvatarUrl ? "Change" : "Upload"}
                    </Button>
                    {(avatarFile || avatarPreview) && (
                      <Button type="button" variant="ghost" size="sm" onClick={handleRemoveAvatar}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="button" disabled={!step1Valid} onClick={() => setStep(2)}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ── Step 2: Area Access ── */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Select which areas this user can physically access. You can skip this and grant access later.
            </p>

            {/* Property selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />Property
              </Label>
              {loadingProperties ? (
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <Loader2 className="w-4 h-4 animate-spin" />Loading properties...
                </div>
              ) : properties.length === 0 ? (
                <p className="text-sm text-stone-400 dark:text-stone-500 italic">No properties found</p>
              ) : (
                <Select value={selectedPropertyId} onValueChange={(v) => { setSelectedPropertyId(v); onAreaSelectionsChange?.([]); }}>
                  <SelectTrigger><SelectValue placeholder="Select a property" /></SelectTrigger>
                  <SelectContent>
                    {properties.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Area checkboxes */}
            {selectedPropertyId && (
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />Areas
                </Label>
                {loadingAreas ? (
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Loader2 className="w-4 h-4 animate-spin" />Loading areas...
                  </div>
                ) : (() => {
                  const areasWithTerminals = areas.filter((a: any) => terminalAreaIds.has(a.id));
                  const hiddenCount = areas.length - areasWithTerminals.length;
                  return areasWithTerminals.length === 0 ? (
                    <p className="text-sm text-stone-400 dark:text-stone-500 italic">
                      {areas.length === 0
                        ? "No areas in this property"
                        : "No areas in this property have a terminal registered — add a terminal first in Access Control settings"}
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="border border-stone-200 dark:border-stone-700 rounded-lg divide-y divide-stone-100 dark:divide-stone-800 max-h-44 overflow-y-auto">
                        {areasWithTerminals.map((area: any) => {
                          const checked = areaSelections.some((a) => a.areaId === area.id);
                          return (
                            <label key={area.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                              <Checkbox checked={checked} onCheckedChange={() => toggleArea(area)} />
                              <div>
                                <p className="text-sm font-medium text-stone-800 dark:text-stone-200">{area.name}</p>
                                {area.floor && <p className="text-xs text-stone-400 dark:text-stone-500">Floor {area.floor}</p>}
                              </div>
                            </label>
                          );
                        })}
                      </div>
                      {hiddenCount > 0 && (
                        <p className="text-xs text-stone-400 dark:text-stone-500">
                          {hiddenCount} area{hiddenCount > 1 ? "s" : ""} hidden — no terminal registered
                        </p>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Access level */}
            {areaSelections.length > 0 && (
              <div className="space-y-2">
                <Label>Access Level</Label>
                <Select value={accessLevel} onValueChange={onAccessLevelChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full — enter & exit freely</SelectItem>
                    <SelectItem value="read_only">Read-only — view only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Selected areas summary */}
            {areaSelections.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {areaSelections.map((a) => (
                  <Badge key={a.areaId} variant="secondary" className="text-xs gap-1">
                    <MapPin className="w-3 h-3" />{a.areaName}
                    <button onClick={() => onAreaSelectionsChange?.(areaSelections.filter((x) => x.areaId !== a.areaId))} className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />Back
              </Button>
              <Button type="button" onClick={() => setStep(3)}>
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ── Step 3: Face Enrollment ── */}
        {step === 3 && (
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Face enrollment toggle */}
            <div className="flex items-center justify-between rounded-lg border border-stone-200 dark:border-stone-700 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="face-enrollment" className="text-sm font-medium flex items-center gap-2">
                  <ScanFace className="w-4 h-4" />Require Face Enrollment
                </Label>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  User must enroll their face via the mobile app on first login
                </p>
              </div>
              <Switch id="face-enrollment" checked={formData.faceEnrollmentRequired ?? false}
                onCheckedChange={(checked) => setFormData({ ...formData, faceEnrollmentRequired: checked })} />
            </div>

            {formData.faceEnrollmentRequired && (
              <div className="flex gap-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  This user will be redirected to enroll their face when they first log into the Havenz Door Access mobile app. They cannot enter any area until enrollment is complete.
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="rounded-lg border border-stone-200 dark:border-stone-700 p-3 space-y-2">
              <p className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">Summary</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 dark:text-stone-400">Name</span>
                <span className="font-medium text-stone-800 dark:text-stone-200">{formData.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 dark:text-stone-400">Email</span>
                <span className="font-medium text-stone-800 dark:text-stone-200">{formData.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 dark:text-stone-400">Role</span>
                <span className="font-medium text-stone-800 dark:text-stone-200 capitalize">{formData.role?.replace("_", " ")}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 dark:text-stone-400">Area Access</span>
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  {areaSelections.length === 0 ? "None" : `${areaSelections.length} area${areaSelections.length > 1 ? "s" : ""} (${accessLevel})`}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500 dark:text-stone-400">Face Enrollment</span>
                <span className={`font-medium ${formData.faceEnrollmentRequired ? "text-amber-600 dark:text-amber-400" : "text-stone-800 dark:text-stone-200"}`}>
                  {formData.faceEnrollmentRequired ? "Required" : "Not required"}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStep(2)} disabled={isSubmitting}>
                <ArrowLeft className="w-4 h-4 mr-2" />Back
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating...</>
                ) : (
                  <><UserPlus className="w-4 h-4 mr-2" />Create User</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
