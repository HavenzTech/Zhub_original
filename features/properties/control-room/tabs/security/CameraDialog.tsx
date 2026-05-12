"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SeverityPill } from "../../shared/SeverityPill";
import { CameraTile } from "./CameraTile";
import type { AccessEvent, SecurityCamera } from "../../../types";

interface Props {
  camera: SecurityCamera | null;
  events: AccessEvent[];
  onClose: () => void;
}

const eventLabel: Record<AccessEvent["type"], string> = {
  badge_in: "Badge In",
  badge_out: "Badge Out",
  badge_denied: "Badge Denied",
  motion: "Motion",
  door_held: "Door Held",
  tamper: "Tamper",
};

export function CameraDialog({ camera, events, onClose }: Props) {
  return (
    <Dialog open={!!camera} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl">
        {camera && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {camera.name}
                <span className="text-xs font-normal text-stone-500 dark:text-stone-400">· {camera.location}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <CameraTile camera={camera} onExpand={() => {}} />
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-stone-500 dark:text-stone-400">
                  <span className="rounded-md border border-stone-200 dark:border-stone-800 px-1.5 py-0.5">{camera.resolution}</span>
                  <span className="rounded-md border border-stone-200 dark:border-stone-800 px-1.5 py-0.5">{camera.fps} fps</span>
                  {camera.ptz && <span className="rounded-md border border-stone-200 dark:border-stone-800 px-1.5 py-0.5">PTZ</span>}
                  {camera.tags?.map((t) => <span key={t} className="rounded-md border border-stone-200 dark:border-stone-800 px-1.5 py-0.5 capitalize">{t}</span>)}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">Recent Events</h4>
                <ul className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {events.map((e) => (
                    <li key={e.id} className="rounded-md border border-stone-200 dark:border-stone-800 p-2 text-xs">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="flex items-center gap-1.5">
                          <SeverityPill severity={e.severity} />
                          <span className="text-[10px] uppercase tracking-wider text-stone-500">{eventLabel[e.type]}</span>
                        </span>
                        <span className="text-[10px] text-stone-500 tabular-nums">
                          {new Date(e.ts).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </span>
                      </div>
                      {e.subject && <div className="font-medium text-stone-800 dark:text-stone-200">{e.subject}</div>}
                      <div className="text-stone-600 dark:text-stone-400">{e.detail}</div>
                    </li>
                  ))}
                  {events.length === 0 && (
                    <li className="text-xs text-stone-500 dark:text-stone-400 px-1">No recent events on this camera.</li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
