# Property glTF models

Drop `<propertyId>.glb` files here (one per property). When present, the Digital Twin viewer loads it and uses Empties named `sensor_*`, `equipment_*`, and `zone_*` as hotspot anchors. When absent, the viewer falls back to a procedural scene generated from equipment + zones.

See `features/properties/control-room/digital-twin/BLENDER.md` for the Blender export workflow.
