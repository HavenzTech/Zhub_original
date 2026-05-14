"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Monitor,
  Plus,
  Zap,
  Trash2,
  Activity,
  RefreshCw,
  Loader2,
  Wifi,
  WifiOff,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Info,
  ArrowRight,
  Building2,
  Pencil,
  ShieldCheck,
  Lock,
} from "lucide-react";
import type { AmicoTerminal, RegisterTerminalRequest, UpdateTerminalRequest, TerminalAccessEvent, TerminalSync } from "@/types/bms";
import { bmsApi } from "@/lib/services/bmsApi";
import { toast } from "sonner";

const emptyRegisterForm: RegisterTerminalRequest = {
  name: "",
  ipAddress: "",
  areaId: "",
  username: "",
  password: "",
};

function ActionTooltip({ children, content }: { children: React.ReactNode; content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top" className="max-w-56 text-center text-xs leading-relaxed">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export function TerminalManagementPanel() {
  const [terminals, setTerminals] = useState<AmicoTerminal[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Register modal
  const [showRegister, setShowRegister] = useState(false);
  const [registerForm, setRegisterForm] = useState<RegisterTerminalRequest>(emptyRegisterForm);
  const [isRegistering, setIsRegistering] = useState(false);
  const [nameAutoFilled, setNameAutoFilled] = useState(false);

  // Events modal
  const [eventsTerminal, setEventsTerminal] = useState<AmicoTerminal | null>(null);
  const [events, setEvents] = useState<TerminalAccessEvent[]>([]);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const eventsPageSize = 25;

  // Syncs modal
  const [syncsTerminal, setSyncsTerminal] = useState<AmicoTerminal | null>(null);
  const [syncs, setSyncs] = useState<TerminalSync[]>([]);
  const [loadingSyncs, setLoadingSyncs] = useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = useState<AmicoTerminal | null>(null);
  const [editForm, setEditForm] = useState<UpdateTerminalRequest>({});
  const [editPropertyId, setEditPropertyId] = useState("");
  const [editAreas, setEditAreas] = useState<any[]>([]);
  const [loadingEditAreas, setLoadingEditAreas] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Bootstrap credential gate
  const [bootstrapTarget, setBootstrapTarget] = useState<AmicoTerminal | null>(null);
  const [bootstrapCreds, setBootstrapCreds] = useState({ username: "", password: "" });
  const [bootstrappingId, setBootstrappingId] = useState<string | null>(null);

  // Deactivate
  const [deactivateTarget, setDeactivateTarget] = useState<AmicoTerminal | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const loadTerminals = async () => {
    setLoading(true);
    try {
      const res = await bmsApi.terminals.getAll();
      setTerminals(Array.isArray(res) ? res : []);
    } catch {
      toast.error("Failed to load terminals");
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const res: any = await bmsApi.properties.getAll();
      setProperties(Array.isArray(res) ? res : res?.data ?? []);
    } catch {
      setProperties([]);
    }
  };

  useEffect(() => {
    loadTerminals();
    loadProperties();
  }, []);

  const unwrapAreas = (res: any): any[] =>
    Array.isArray(res) ? res : res?.data ?? res?.items ?? res?.areas ?? [];

  useEffect(() => {
    if (!selectedPropertyId) { setAreas([]); setRegisterForm((f) => ({ ...f, areaId: "" })); return; }
    setLoadingAreas(true);
    bmsApi.properties.getAreas(selectedPropertyId)
      .then((res) => setAreas(unwrapAreas(res)))
      .catch(() => setAreas([]))
      .finally(() => setLoadingAreas(false));
  }, [selectedPropertyId]);

  useEffect(() => {
    if (!editPropertyId) { setEditAreas([]); setEditForm((f) => ({ ...f, areaId: "" })); return; }
    setLoadingEditAreas(true);
    bmsApi.properties.getAreas(editPropertyId)
      .then((res) => setEditAreas(unwrapAreas(res)))
      .catch(() => setEditAreas([]))
      .finally(() => setLoadingEditAreas(false));
  }, [editPropertyId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.ipAddress || !registerForm.areaId) {
      toast.error("Name, IP address, and area are required");
      return;
    }
    setIsRegistering(true);
    try {
      const newTerminal = await bmsApi.terminals.register(registerForm);
      setTerminals((prev) => [...prev, newTerminal]);
      toast.success(`"${registerForm.name}" registered — click Bootstrap to activate it`);
      setShowRegister(false);
      setRegisterForm(emptyRegisterForm);
      setSelectedPropertyId("");
    } catch {
      toast.error("Failed to register terminal");
    } finally {
      setIsRegistering(false);
    }
  };

  const openEdit = (terminal: AmicoTerminal) => {
    setEditForm({ name: terminal.name ?? "", ipAddress: terminal.ipAddress ?? "", areaId: terminal.area?.id ?? "" });
    setEditPropertyId(terminal.property?.id ?? "");
    setEditTarget(terminal);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget?.id) return;
    setIsSaving(true);
    try {
      const updated = await bmsApi.terminals.update(editTarget.id, editForm);
      setTerminals((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      toast.success(`"${updated.name}" updated`);
      setEditTarget(null);
    } catch {
      toast.error("Failed to update terminal");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bootstrapTarget?.id) return;
    const terminal = bootstrapTarget;
    const creds = { ...bootstrapCreds };
    setBootstrapTarget(null);
    setBootstrapCreds({ username: "", password: "" });
    setBootstrappingId(terminal.id!);
    try {
      await bmsApi.terminals.bootstrap(terminal.id!, creds);
      toast.success(`"${terminal.name}" is now live — users in this area have been synced to it`);
      loadTerminals();
    } catch {
      toast.error("Bootstrap failed — check the terminal's IP address, network connection, and credentials. Safe to try again.");
    } finally {
      setBootstrappingId(null);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget?.id) return;
    setIsDeactivating(true);
    try {
      await bmsApi.terminals.deactivate(deactivateTarget.id);
      setTerminals((prev) => prev.filter((t) => t.id !== deactivateTarget.id));
      toast.success(`Terminal "${deactivateTarget.name}" removed from Zhub`);
      setDeactivateTarget(null);
    } catch {
      toast.error("Failed to deactivate terminal");
    } finally {
      setIsDeactivating(false);
    }
  };

  const fetchEvents = async (terminal: AmicoTerminal, page: number) => {
    if (!terminal.id) return;
    setLoadingEvents(true);
    try {
      const res = await bmsApi.terminals.getAccessEvents(terminal.id, page, eventsPageSize);
      const list = Array.isArray(res) ? res : (res as any)?.data ?? [];
      const total = (res as any)?.total ?? list.length;
      setEvents(list);
      setEventsTotal(total);
      setEventsPage(page);
    } catch {
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const openEvents = async (terminal: AmicoTerminal) => {
    setEventsTerminal(terminal);
    setEventsPage(1);
    setEventsTotal(0);
    fetchEvents(terminal, 1);
  };

  const openSyncs = async (terminal: AmicoTerminal) => {
    if (!terminal.id) return;
    setSyncsTerminal(terminal);
    setLoadingSyncs(true);
    try {
      const res = await bmsApi.terminals.getSyncs(terminal.id);
      setSyncs(Array.isArray(res) ? res : []);
    } catch {
      setSyncs([]);
    } finally {
      setLoadingSyncs(false);
    }
  };

  const statusBadge = (status?: string | null) => {
    const s = status?.toLowerCase() ?? "";
    if (s === "online" || s === "active")
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs gap-1 cursor-default">
              <Wifi className="w-3 h-3" />Online
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Terminal is active and receiving face scans</TooltipContent>
        </Tooltip>
      );
    if (s === "bootstrapping")
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs gap-1 cursor-default">
              <Clock className="w-3 h-3" />Setting up
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="text-xs">Click Bootstrap to finish activating this terminal</TooltipContent>
        </Tooltip>
      );
    if (s === "error")
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs gap-1 cursor-default">
              <AlertCircle className="w-3 h-3" />Error
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="text-xs max-w-48">Bootstrap failed. Check the IP address and credentials, then try Bootstrap again.</TooltipContent>
        </Tooltip>
      );
    if (s === "offline" || s === "inactive")
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 text-xs gap-1 cursor-default">
              <WifiOff className="w-3 h-3" />Offline
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="text-xs max-w-48">Terminal not reachable. Pending syncs will retry automatically when it comes back online.</TooltipContent>
        </Tooltip>
      );
    return <Badge variant="secondary" className="text-xs">{status ?? "Unknown"}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-stone-900 dark:text-stone-50">HID Terminals</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">Manage door access terminals across your properties</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadTerminals}>
              <RefreshCw className="w-4 h-4 mr-2" />Refresh
            </Button>
            <Button size="sm" className="bg-accent-cyan hover:bg-accent-cyan/90 text-white" onClick={() => setShowRegister(true)}>
              <Plus className="w-4 h-4 mr-2" />Register Terminal
            </Button>
          </div>
        </div>

        {/* Workflow guide */}
        <div className="flex items-start gap-3 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 p-4">
          <Info className="w-4 h-4 text-stone-400 dark:text-stone-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">How to add a new terminal</p>
            <div className="flex items-center gap-2 flex-wrap text-xs text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-accent-cyan/20 text-accent-cyan flex items-center justify-center font-semibold text-[10px]">1</span>Register the terminal with its IP and credentials</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
              <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-accent-cyan/20 text-accent-cyan flex items-center justify-center font-semibold text-[10px]">2</span>Click <strong>Bootstrap</strong> — connects to the device, configures it, and syncs all users</span>
              <ArrowRight className="w-3 h-3 shrink-0" />
              <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center font-semibold text-[10px]">3</span>Terminal goes Online — ready to scan faces</span>
            </div>
          </div>
        </div>

        {/* Terminals grouped by property */}
        {terminals.length === 0 ? (
          <Card className="p-12 text-center">
            <Monitor className="w-12 h-12 mx-auto text-stone-400 mb-4" />
            <h3 className="font-semibold text-stone-700 dark:text-stone-300 mb-1">No terminals registered</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">Add your first HID terminal to get started</p>
            <Button size="sm" onClick={() => setShowRegister(true)}>
              <Plus className="w-4 h-4 mr-2" />Register Terminal
            </Button>
          </Card>
        ) : (() => {
          // Group terminals by property
          const groups = terminals.reduce<Record<string, { propertyName: string; terminals: AmicoTerminal[] }>>((acc, t) => {
            const key = t.property?.id ?? "unknown";
            const label = t.property?.name ?? "No Property";
            if (!acc[key]) acc[key] = { propertyName: label, terminals: [] };
            acc[key].terminals.push(t);
            return acc;
          }, {});

          return (
            <div className="space-y-6">
              {Object.entries(groups).map(([propertyId, { propertyName, terminals: group }]) => (
                <div key={propertyId} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                    <h4 className="text-sm font-semibold text-stone-700 dark:text-stone-300">{propertyName}</h4>
                    <span className="text-xs text-stone-400 dark:text-stone-500">({group.length} terminal{group.length > 1 ? "s" : ""})</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {group.map((terminal) => (
              <Card key={terminal.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                      <Monitor className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-stone-900 dark:text-stone-50 truncate">{terminal.name}</p>
                      <p className="text-xs text-stone-400 dark:text-stone-500">{terminal.ipAddress}</p>
                    </div>
                  </div>
                  {statusBadge(terminal.status)}
                </div>

                {terminal.area?.name && (
                  <p className="text-xs text-stone-500 dark:text-stone-400">Area: <span className="text-stone-700 dark:text-stone-300">{terminal.area.name}</span></p>
                )}

                {terminal.lastSeenAt && (
                  <p className="text-xs text-stone-400 dark:text-stone-500">
                    Last seen: {new Date(terminal.lastSeenAt).toLocaleString()}
                  </p>
                )}

                {(!!terminal.failedSyncs || !!terminal.pendingSyncs) && (
                  <div className="flex items-center gap-2 text-xs">
                    {!!terminal.failedSyncs && (
                      <span className="text-red-500 dark:text-red-400 font-medium">{terminal.failedSyncs} failed sync{terminal.failedSyncs > 1 ? "s" : ""}</span>
                    )}
                    {!!terminal.pendingSyncs && (
                      <span className="text-amber-500 dark:text-amber-400">{terminal.pendingSyncs} pending</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-stone-100 dark:border-stone-800">
                  <ActionTooltip content="Connects to this terminal, registers the webhook so it can send access events, then pushes all users who have access to this area. You'll be asked to confirm credentials before connecting.">
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1"
                      disabled={bootstrappingId === terminal.id}
                      onClick={() => { setBootstrapTarget(terminal); setBootstrapCreds({ username: "", password: "" }); }}>
                      {bootstrappingId === terminal.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Zap className="w-3 h-3" />}
                      Bootstrap
                    </Button>
                  </ActionTooltip>

                  <ActionTooltip content="View the access log — who scanned their face, when, and whether entry was granted or denied.">
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => openEvents(terminal)}>
                      <Activity className="w-3 h-3" />Events
                    </Button>
                  </ActionTooltip>

                  <ActionTooltip content="Check user sync status. If someone should have access but can't get in, look here for failed syncs.">
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => openSyncs(terminal)}>
                      <Eye className="w-3 h-3" />Syncs
                    </Button>
                  </ActionTooltip>

                  <ActionTooltip content="Edit this terminal's name, IP address, or area assignment.">
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1"
                      onClick={() => openEdit(terminal)}>
                      <Pencil className="w-3 h-3" />Edit
                    </Button>
                  </ActionTooltip>

                  <ActionTooltip content="Remove this terminal from Zhub. The physical device is unaffected — it just stops receiving user syncs and sending events.">
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50"
                      onClick={() => setDeactivateTarget(terminal)}>
                      <Trash2 className="w-3 h-3" />Remove
                    </Button>
                  </ActionTooltip>
                </div>
              </Card>
            ))}
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Register Terminal Modal */}
        <Dialog open={showRegister} onOpenChange={(v) => { if (!isRegistering) { setShowRegister(v); if (!v) { setRegisterForm(emptyRegisterForm); setSelectedPropertyId(""); setNameAutoFilled(false); } } }}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Register Terminal</DialogTitle>
              <DialogDescription>
                Enter the terminal&apos;s network details and credentials. After saving, click <strong>Bootstrap</strong> on the terminal card to connect and activate it.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label>Terminal Name *</Label>
                <Input placeholder="e.g. Main Entrance, Server Room Door" value={registerForm.name}
                  onChange={(e) => { setNameAutoFilled(false); setRegisterForm((f) => ({ ...f, name: e.target.value })); }} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label>IP Address *</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-stone-400 cursor-default" />
                    </TooltipTrigger>
                    <TooltipContent className="text-xs max-w-56">The local network IP of the physical device. The terminal must be reachable from your backend server on this IP.</TooltipContent>
                  </Tooltip>
                </div>
                <Input placeholder="192.168.1.100" value={registerForm.ipAddress}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, ipAddress: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Property</Label>
                  <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                    <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                    <SelectContent>
                      {properties.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Area *</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-stone-400 cursor-default" />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-48">The area this terminal controls. Users with access to this area will be synced to the terminal.</TooltipContent>
                    </Tooltip>
                  </div>
                  {loadingAreas ? (
                    <div className="flex items-center gap-2 h-10 text-sm text-stone-500"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div>
                  ) : (
                    <Select
                      value={registerForm.areaId}
                      disabled={!selectedPropertyId}
                      onValueChange={(v) => {
                        const area = areas.find((a: any) => a.id === v);
                        setRegisterForm((f) => ({ ...f, areaId: v, name: nameAutoFilled || !f.name ? (area?.name ?? f.name) : f.name }));
                        if (area && (nameAutoFilled || !registerForm.name)) setNameAutoFilled(true);
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder={selectedPropertyId ? "Select area" : "Select property first"} /></SelectTrigger>
                      <SelectContent>
                        {areas.map((a: any) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Label>Username *</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3.5 h-3.5 text-stone-400 cursor-default" />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-48">The admin account on the physical terminal itself — not a Havenz Hub account. Default is usually <strong>admin</strong>.</TooltipContent>
                    </Tooltip>
                  </div>
                  <Input placeholder="admin" value={registerForm.username}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, username: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input type="password" placeholder="••••••••" value={registerForm.password}
                    onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))} required />
                </div>
              </div>
              <div className="flex gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Credentials are stored encrypted and only used by the backend to communicate with the terminal. After registering, click <strong>Bootstrap</strong> on the terminal card to complete setup.
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowRegister(false)} disabled={isRegistering}>Cancel</Button>
                <Button type="submit" disabled={isRegistering}>
                  {isRegistering ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Registering...</> : <><Plus className="w-4 h-4 mr-2" />Register</>}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Access Events Modal */}
        <Dialog open={!!eventsTerminal} onOpenChange={(v) => { if (!v) { setEventsTerminal(null); setEvents([]); } }}>
          <DialogContent className="sm:max-w-[560px] flex flex-col max-h-[80vh]">
            <DialogHeader className="shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-stone-400" />
                {eventsTerminal?.name}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <DialogDescription className="text-xs flex-1">
                  Face scan log · {eventsTotal > 0 ? `${eventsTotal} events` : "No events yet"} · kept 90 days
                </DialogDescription>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" disabled={loadingEvents}
                  onClick={() => eventsTerminal && fetchEvents(eventsTerminal, eventsPage)}>
                  <RefreshCw className={`w-3 h-3 ${loadingEvents ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </DialogHeader>

            {loadingEvents ? (
              <div className="flex items-center justify-center py-12 shrink-0">
                <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
              </div>
            ) : events.length === 0 ? (
              <p className="text-sm text-stone-400 dark:text-stone-500 italic text-center py-10 shrink-0">No events recorded yet</p>
            ) : (
              <>
                <div className="overflow-y-auto flex-1 min-h-0 rounded-lg border border-stone-200 dark:border-stone-700 divide-y divide-stone-100 dark:divide-stone-800">
                  {events.map((ev: any, i) => {
                    const granted = ev.eventType === "Granted" || ev.eventType === "RemoteOpen";
                    const denied = ev.eventType === "Denied";
                    const label = ev.eventType === "RemoteOpen" ? "Remote Open"
                      : ev.eventType === "NotIdentified" ? "Not Identified"
                      : ev.eventType ?? "Unknown";
                    const name = ev.userName ?? (ev.userId ? `User ${ev.userId.slice(0, 8)}…` : null);
                    const displayName = name ?? (ev.source === "Remote" ? "Remote unlock" : "Unidentified scan");
                    const isAnon = !name;
                    return (
                      <div key={ev.id ?? i} className="flex items-center gap-3 px-3 py-2">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          granted ? "bg-emerald-100 dark:bg-emerald-900/30" : denied ? "bg-red-100 dark:bg-red-900/30" : "bg-stone-100 dark:bg-stone-800"
                        }`}>
                          {granted
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            : denied
                            ? <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                            : <AlertCircle className="w-3.5 h-3.5 text-stone-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isAnon ? "text-stone-400 dark:text-stone-500 italic" : "text-stone-800 dark:text-stone-200"}`}>
                            {displayName}
                          </p>
                          <p className="text-xs text-stone-400 dark:text-stone-500">
                            {ev.timestamp ? new Date(ev.timestamp).toLocaleString() : "—"}
                            {ev.source && <span className="ml-1.5 text-[10px] uppercase tracking-wide">· {ev.source}</span>}
                          </p>
                        </div>
                        <span className={`text-xs font-medium shrink-0 ${
                          granted ? "text-emerald-600 dark:text-emerald-400"
                          : denied ? "text-red-600 dark:text-red-400"
                          : "text-stone-500 dark:text-stone-400"
                        }`}>
                          {label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2 shrink-0">
                  <span className="text-xs text-stone-400 dark:text-stone-500">
                    Page {eventsPage} of {Math.max(1, Math.ceil(eventsTotal / eventsPageSize))}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 text-xs px-3"
                      disabled={eventsPage <= 1 || loadingEvents}
                      onClick={() => eventsTerminal && fetchEvents(eventsTerminal, eventsPage - 1)}>
                      ← Prev
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-3"
                      disabled={eventsPage >= Math.ceil(eventsTotal / eventsPageSize) || loadingEvents}
                      onClick={() => eventsTerminal && fetchEvents(eventsTerminal, eventsPage + 1)}>
                      Next →
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Syncs Modal */}
        <Dialog open={!!syncsTerminal} onOpenChange={(v) => { if (!v) { setSyncsTerminal(null); setSyncs([]); } }}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>User Syncs — {syncsTerminal?.name}</DialogTitle>
              <DialogDescription>
                Each sync pushes a user&apos;s profile and face photo to this terminal so they can scan in. If someone should have access but can&apos;t get in, look for a <strong>Failed</strong> row here.
              </DialogDescription>
            </DialogHeader>
            {loadingSyncs ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>
            ) : syncs.length === 0 ? (
              <p className="text-sm text-stone-400 dark:text-stone-500 italic text-center py-8">No syncs recorded</p>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
                {syncs.map((s, i) => (
                  <div key={s.id ?? i} className="px-4 py-2.5 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-stone-800 dark:text-stone-200">{s.syncedAt ? new Date(s.syncedAt).toLocaleString() : "—"}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-500">{s.userCount ?? 0} users</span>
                        <Badge variant="secondary" className={`text-xs ${s.status?.toLowerCase() === "failed" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : s.status?.toLowerCase() === "succeeded" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : ""}`}>
                          {s.status ?? "—"}
                        </Badge>
                      </div>
                    </div>
                    {s.errorMessage && (
                      <p className="text-xs text-red-500 dark:text-red-400">{s.errorMessage}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {syncs.some((s) => s.status?.toLowerCase() === "failed") && (
              <div className="flex gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 mt-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Failed syncs retry automatically every 15 minutes. If failures persist after 20 attempts, check that the terminal is reachable and its credentials haven&apos;t changed, then run Bootstrap again.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Bootstrap Credential Gate */}
        <Dialog open={!!bootstrapTarget} onOpenChange={(v) => { if (!v) { setBootstrapTarget(null); setBootstrapCreds({ username: "", password: "" }); } }}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-accent-cyan" />
                Confirm Terminal Credentials
              </DialogTitle>
              <DialogDescription>
                Re-enter the admin credentials for <strong>{bootstrapTarget?.name}</strong> to authorise this connection. Credentials are not stored after use.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBootstrap} className="space-y-4">
              <div className="flex gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  This is a security step. Your credentials are sent directly to the terminal and are not retained by Zhub after the connection is established.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Username *</Label>
                <Input
                  autoComplete="off"
                  placeholder="admin"
                  value={bootstrapCreds.username}
                  onChange={(e) => setBootstrapCreds((c) => ({ ...c, username: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={bootstrapCreds.password}
                  onChange={(e) => setBootstrapCreds((c) => ({ ...c, password: e.target.value }))}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setBootstrapTarget(null); setBootstrapCreds({ username: "", password: "" }); }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-accent-cyan hover:bg-accent-cyan/90 text-white">
                  <Zap className="w-4 h-4 mr-2" />Connect & Sync
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Terminal Modal */}
        <Dialog open={!!editTarget} onOpenChange={(v) => { if (!isSaving) { if (!v) setEditTarget(null); } }}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Edit Terminal</DialogTitle>
              <DialogDescription>Update the terminal&apos;s name, IP address, or area assignment.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label>Terminal Name *</Label>
                <Input placeholder="e.g. Main Entrance" value={editForm.name ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>IP Address *</Label>
                <Input placeholder="192.168.1.100" value={editForm.ipAddress ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, ipAddress: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Property</Label>
                  <Select value={editPropertyId} onValueChange={(v) => { setEditPropertyId(v); setEditForm((f) => ({ ...f, areaId: "" })); }}>
                    <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                    <SelectContent>
                      {properties.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Area *</Label>
                  {loadingEditAreas ? (
                    <div className="flex items-center gap-2 h-10 text-sm text-stone-500"><Loader2 className="w-4 h-4 animate-spin" />Loading...</div>
                  ) : (
                    <Select value={editForm.areaId ?? ""} disabled={!editPropertyId} onValueChange={(v) => setEditForm((f) => ({ ...f, areaId: v }))}>
                      <SelectTrigger><SelectValue placeholder={editPropertyId ? "Select area" : "Select property first"} /></SelectTrigger>
                      <SelectContent>
                        {editAreas.map((a: any) => (
                          <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditTarget(null)} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Deactivate confirmation */}
        <AlertDialog open={!!deactivateTarget} onOpenChange={(v) => { if (!v) setDeactivateTarget(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />Remove Terminal
              </AlertDialogTitle>
              <AlertDialogDescription>
                <strong>{deactivateTarget?.name}</strong> will be removed from Zhub and will stop receiving user syncs and sending access events. The physical device is not affected — you can re-register it later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeactivating}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeactivate} disabled={isDeactivating}
                className="bg-red-600 hover:bg-red-700 text-white">
                {isDeactivating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Removing...</> : "Remove Terminal"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
