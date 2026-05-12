"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { DigitalTwinViewerProps, TwinHotspotDescriptor } from "./DigitalTwinViewer";
import type { Sensor } from "../../types";
import { useSensorStream } from "../../hooks/useSensorStream";
import { sensorStatus } from "../tabs/sensors/sensorStatus";
import { TwinControls } from "./TwinControls";
import { TwinSidePanel } from "./TwinSidePanel";

const HOTSPOT_PREFIXES = ["sensor_", "zone_", "equipment_"] as const;

function proceduralHotspots(
  equipment: DigitalTwinViewerProps["equipment"],
  sensors: DigitalTwinViewerProps["sensors"]
): TwinHotspotDescriptor[] {
  const eqHotspots: TwinHotspotDescriptor[] = equipment.map((e, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    return {
      id: `equipment_${e.id}`,
      label: e.name,
      kind: "equipment",
      position: [-4 + col * 2.6, 1.2, -2 + row * 2.6],
      equipmentId: e.id,
    };
  });
  const sensorHotspots: TwinHotspotDescriptor[] = sensors
    .filter((s) => s.equipmentId)
    .map((s) => {
      const eq = eqHotspots.find((h) => h.equipmentId === s.equipmentId);
      const base = eq?.position ?? [0, 0, 0];
      const jitter = (hash(s.id) % 10) / 10 - 0.5;
      return {
        id: `sensor_${s.id}`,
        label: s.label,
        kind: "sensor",
        position: [base[0] + jitter * 0.8, base[1] + 0.6, base[2] + jitter * 0.8],
        sensorId: s.id,
      };
    });
  return [...eqHotspots, ...sensorHotspots];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff;
  return h;
}

interface GlbModelProps {
  url: string;
  onHotspots: (h: TwinHotspotDescriptor[]) => void;
}

function GlbModel({ url, onHotspots }: GlbModelProps) {
  const gltf = useGLTF(url);
  useEffect(() => {
    const discovered: TwinHotspotDescriptor[] = [];
    gltf.scene.traverse((node) => {
      const name = node.name || "";
      const prefix = HOTSPOT_PREFIXES.find((p) => name.startsWith(p));
      if (!prefix) return;
      const id = name;
      const idPart = name.slice(prefix.length);
      const pos = new THREE.Vector3();
      node.getWorldPosition(pos);
      discovered.push({
        id,
        label: idPart,
        kind: prefix === "sensor_" ? "sensor" : prefix === "zone_" ? "zone" : "equipment",
        position: [pos.x, pos.y, pos.z],
        sensorId: prefix === "sensor_" ? idPart : undefined,
        equipmentId: prefix === "equipment_" ? idPart : undefined,
      });
    });
    onHotspots(discovered);
  }, [gltf, onHotspots]);
  return <primitive object={gltf.scene} />;
}

function ProceduralScene({ equipment, zones, gridMajor, gridMinor, equipColor, zoneColor }: {
  equipment: DigitalTwinViewerProps["equipment"];
  zones: DigitalTwinViewerProps["zones"];
  gridMajor: string;
  gridMinor: string;
  equipColor: string;
  zoneColor: string;
}) {
  return (
    <group>
      <gridHelper args={[24, 24, gridMajor, gridMinor]} position={[0, 0, 0]} />
      {zones.map((z, i) => (
        <mesh key={z.id} position={[(i - zones.length / 2) * 6, 0.05, 6]}>
          <boxGeometry args={[5, 0.1, 5]} />
          <meshStandardMaterial color={zoneColor} opacity={0.35} transparent />
        </mesh>
      ))}
      {equipment.map((e, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return (
          <mesh key={e.id} position={[-4 + col * 2.6, 0.6, -2 + row * 2.6]} castShadow>
            <boxGeometry args={[1.4, 1.2, 1.4]} />
            <meshStandardMaterial color={equipColor} metalness={0.6} roughness={0.35} />
          </mesh>
        );
      })}
    </group>
  );
}

function FocusCamera({ target }: { target: [number, number, number] | null }) {
  const { camera } = useThree();
  useFrame(() => {
    if (!target) return;
    const desired = new THREE.Vector3(target[0] + 4, target[1] + 4, target[2] + 6);
    camera.position.lerp(desired, 0.05);
    camera.lookAt(target[0], target[1], target[2]);
  });
  return null;
}

export function TwinScene(props: DigitalTwinViewerProps) {
  const { property, equipment, zones, sensors, focusEquipmentId } = props;
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const bg = isLight ? "#e7edf5" : "#0a0f1a";
  const ambient = isLight ? 0.85 : 0.6;
  const sky = isLight ? "#ffffff" : "#aecbff";
  const ground = isLight ? "#c7d2e0" : "#1e293b";
  const gridMajor = isLight ? "#94a3b8" : "#334155";
  const gridMinor = isLight ? "#cbd5e1" : "#1e293b";
  const equipColor = isLight ? "#475569" : "#1e293b";
  const zoneColor = isLight ? "#94a3b8" : "#0f172a";
  const [hotspots, setHotspots] = useState<TwinHotspotDescriptor[]>(() => proceduralHotspots(equipment, sensors));
  const [selected, setSelected] = useState<TwinHotspotDescriptor | null>(null);
  const [showSensors, setShowSensors] = useState(true);
  const [showEquipment, setShowEquipment] = useState(true);
  const [isolateZoneId, setIsolateZoneId] = useState<string | null>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const glbUrl = `/models/properties/${property.id}.glb`;
  const [useGlb, setUseGlb] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(glbUrl, { method: "HEAD" })
      .then((r) => !cancelled && setUseGlb(r.ok))
      .catch(() => !cancelled && setUseGlb(false));
    return () => { cancelled = true; };
  }, [glbUrl]);

  useEffect(() => {
    if (focusEquipmentId) {
      const h = hotspots.find((x) => x.equipmentId === focusEquipmentId);
      if (h) setSelected(h);
    }
  }, [focusEquipmentId, hotspots]);

  const sensorIds = useMemo(
    () => hotspots.filter((h) => h.sensorId).map((h) => h.sensorId as string),
    [hotspots]
  );
  const { latest } = useSensorStream(property.id as string, sensorIds);
  const sensorMap = useMemo(() => new Map(sensors.map((s) => [s.id, s])), [sensors]);

  const visible = hotspots.filter((h) => {
    if (h.kind === "sensor" && !showSensors) return false;
    if (h.kind === "equipment" && !showEquipment) return false;
    if (isolateZoneId) {
      if (h.kind === "zone") return h.id.endsWith(isolateZoneId);
      if (h.kind === "equipment") {
        const eq = equipment.find((e) => e.id === h.equipmentId);
        return eq?.zoneId === isolateZoneId;
      }
      if (h.kind === "sensor") {
        const s = sensorMap.get(h.sensorId ?? "");
        const eq = s?.equipmentId ? equipment.find((e) => e.id === s.equipmentId) : null;
        return eq?.zoneId === isolateZoneId || s?.zoneId === isolateZoneId;
      }
    }
    return true;
  });

  return (
    <div
      ref={containerRef}
      className={
        fullscreen
          ? "fixed inset-0 z-50 bg-stone-950 p-4"
          : "relative grid grid-cols-1 lg:grid-cols-3 gap-4 h-[68vh] min-h-[520px]"
      }
    >
      <div className={`relative ${fullscreen ? "h-full w-full" : "lg:col-span-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-950 overflow-hidden"}`}>
        <Canvas camera={{ position: [8, 6, 10], fov: 45 }}>
          <color attach="background" args={[bg]} />
          <ambientLight intensity={ambient} />
          <hemisphereLight args={[sky, ground, 0.6]} />
          <directionalLight position={[8, 12, 6]} intensity={isLight ? 0.9 : 1.2} />
          <directionalLight position={[-6, 8, -4]} intensity={0.4} />
          <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
          <FocusCamera target={selected?.position ?? null} />
          {useGlb ? (
            <GlbModel url={glbUrl} onHotspots={setHotspots} />
          ) : (
            <ProceduralScene equipment={equipment} zones={zones} gridMajor={gridMajor} gridMinor={gridMinor} equipColor={equipColor} zoneColor={zoneColor} />
          )}
          {visible.map((h) => {
            const sensor = h.sensorId ? sensorMap.get(h.sensorId) : undefined;
            const reading = h.sensorId ? latest[h.sensorId] : undefined;
            const status = sensor ? sensorStatus(sensor as Sensor, reading?.value) : "nominal";
            const color =
              status === "critical" ? "#ef4444"
              : status === "warning" ? "#f59e0b"
              : h.kind === "equipment" ? "#06b6d4"
              : "#10b981";
            return (
              <group key={h.id} position={h.position}>
                <mesh onClick={(e) => { e.stopPropagation(); setSelected(h); }}>
                  <sphereGeometry args={[h.kind === "sensor" ? 0.14 : 0.22, 16, 16]} />
                  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={status === "critical" ? 1.2 : 0.5} />
                </mesh>
                <Html distanceFactor={8} center>
                  <div
                    onClick={() => setSelected(h)}
                    className="cursor-pointer select-none text-[10px] px-1.5 py-0.5 rounded-md border whitespace-nowrap"
                    style={{ borderColor: color, color, background: "rgba(10,12,16,0.85)" }}
                  >
                    {h.label}{reading ? ` · ${reading.value.toFixed(1)}${sensor?.unit ? " " + sensor.unit : ""}` : ""}
                  </div>
                </Html>
              </group>
            );
          })}
        </Canvas>

        <TwinControls
          onReset={() => setSelected(null)}
          showSensors={showSensors}
          setShowSensors={setShowSensors}
          showEquipment={showEquipment}
          setShowEquipment={setShowEquipment}
          zones={zones}
          isolateZoneId={isolateZoneId}
          setIsolateZoneId={setIsolateZoneId}
          fullscreen={fullscreen}
          setFullscreen={setFullscreen}
          usingGlb={!!useGlb}
        />
      </div>

      {!fullscreen && (
        <TwinSidePanel
          selected={selected}
          sensorMap={sensorMap}
          equipment={equipment}
          sensors={sensors}
          insights={props.insights}
          alerts={props.alerts}
          workOrders={props.workOrders}
          onCreateWorkOrder={props.onCreateWorkOrder}
        />
      )}
    </div>
  );
}
