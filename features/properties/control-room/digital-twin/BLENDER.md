# Blender → Digital Twin Workflow

Drop a `.glb` for a property at `public/models/properties/<propertyId>.glb`. The viewer will detect it automatically; until then, it falls back to a procedural scene built from equipment & zones.

## Empties naming convention

In Blender, add **Empties** (Add → Empty → Plain Axes) at the world positions where you want hotspots to appear. Name them:

- `sensor_<sensorId>` — produces a sensor hotspot bound to live telemetry and thresholds. Color reflects status (green / amber / red).
- `equipment_<equipmentId>` — equipment hotspot; click opens detail + "Create WO".
- `zone_<zoneId>` — zone anchor, used by the "Isolate zone" control.

Example: an Empty at the bearing housing of Engine 2 named `sensor_sen-eng2-bearing-t` binds to the bearing-temp sensor.

## Export settings

File → Export → glTF 2.0 (.glb):
- **Format**: glTF Binary (.glb)
- **Include**: Selected Objects (if you're exporting a subset), Custom Properties ON
- **Transform**: +Y Up
- **Geometry**: Apply Modifiers ON, UVs ON, Normals ON, Tangents ON if using PBR
- **Materials**: Export, Images: Automatic
- **Compression**: Draco ON (level 6) for large plants
- **Empties**: keep `Include → Punctual Lights / Cameras` unchecked; Empties are exported automatically as nodes with no mesh.

## Coordinate hygiene

- Apply all transforms (`Ctrl+A → All`) before export, or hotspot positions will drift.
- Model centered near origin; scale in meters (1 Blender unit = 1 m).
- Single root Empty `property_root` optional; the loader walks the whole scene graph.

## Sanity-check list

1. Ctrl+click each hotspot Empty; confirm it's spelled exactly `sensor_…`/`equipment_…`/`zone_…` with matching IDs from `features/properties/mock/*` (or live backend IDs when available).
2. Export and place at `public/models/properties/<propertyId>.glb`.
3. Refresh the Digital Twin tab; the "Procedural" badge in the top-right should flip to "glTF model".
