"use client";

import { Camera, Circle, Signal, SignalZero, Maximize2 } from "lucide-react";
import type { SecurityCamera } from "../../../types";

interface Props {
  camera: SecurityCamera;
  onExpand: () => void;
  compact?: boolean;
}

const statusStyle: Record<SecurityCamera["status"], { label: string; dot: string; ring: string }> = {
  live: { label: "LIVE", dot: "bg-red-500", ring: "border-stone-200 dark:border-stone-800" },
  recording: { label: "REC", dot: "bg-red-500 animate-pulse", ring: "border-red-500/50" },
  offline: { label: "OFFLINE", dot: "bg-stone-500", ring: "border-stone-300 dark:border-stone-700 opacity-60" },
  degraded: { label: "DEGRADED", dot: "bg-amber-500", ring: "border-amber-500/50" },
};

export function CameraTile({ camera, onExpand, compact = false }: Props) {
  const style = statusStyle[camera.status];
  const isLive = camera.status === "live" || camera.status === "recording";
  return (
    <button
      onClick={onExpand}
      className={`group relative text-left rounded-xl border overflow-hidden bg-stone-950 hover:border-accent-cyan/60 transition-colors ${style.ring} ${compact ? "aspect-video" : "aspect-video"}`}
    >
      <FeedCanvas live={isLive} hash={camera.id} />

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

      <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
        <div className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider ${camera.status === "offline" ? "bg-stone-700/70 text-stone-300" : camera.status === "degraded" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-red-500/20 text-red-300 border border-red-500/40"}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-stone-300/90">
          {camera.ptz && <span className="rounded bg-black/40 border border-white/10 px-1 py-0.5">PTZ</span>}
          <span className="rounded bg-black/40 border border-white/10 px-1 py-0.5">{camera.resolution}</span>
          {isLive ? <Signal className="w-3 h-3" /> : <SignalZero className="w-3 h-3 text-stone-500" />}
        </div>
      </div>

      <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-white drop-shadow truncate">{camera.name}</div>
          <div className="text-[10px] text-white/70 truncate">{camera.location}</div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-white/60 shrink-0">
          <Maximize2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          <LiveTimestamp live={isLive} />
        </div>
      </div>
    </button>
  );
}

function LiveTimestamp({ live }: { live: boolean }) {
  return (
    <span className="font-mono tabular-nums text-[10px]">
      {new Date().toLocaleTimeString(undefined, { hour12: false })}
      {!live && " · stale"}
    </span>
  );
}

function FeedCanvas({ live, hash }: { live: boolean; hash: string }) {
  const hue = (hashString(hash) % 360);
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{ background: `radial-gradient(ellipse at 60% 40%, hsl(${hue} 35% 14%), hsl(${(hue + 200) % 360} 30% 6%))` }}
    >
      {live && (
        <>
          <div className="absolute inset-0 opacity-[0.07] mix-blend-screen" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.6) 0px, rgba(255,255,255,0.6) 1px, transparent 1px, transparent 3px)" }} />
          <div className="absolute inset-x-0 h-20 animate-[scan_6s_linear_infinite] bg-gradient-to-b from-transparent via-white/5 to-transparent" />
          <Camera className="absolute inset-0 m-auto w-8 h-8 text-white/10" />
        </>
      )}
      {!live && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500">
          <SignalZero className="w-6 h-6 mb-1" />
          <span className="text-[10px] uppercase tracking-wider">No Signal</span>
        </div>
      )}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(-20%); opacity: 0.3; }
          50% { opacity: 0.9; }
          100% { transform: translateY(120%); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff;
  return h;
}

export function RecIndicator() {
  return <Circle className="w-2 h-2 fill-red-500 text-red-500" />;
}
