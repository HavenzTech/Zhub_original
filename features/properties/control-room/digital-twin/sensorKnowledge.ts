export interface SensorKnowledge {
  what: string;
  why: string;
  healthy: string;
  unhealthy: string;
  actionHint?: string;
}

const FALLBACK: SensorKnowledge = {
  what: "Process measurement from plant instrumentation.",
  why: "Tracked to catch deviation from normal operating envelope.",
  healthy: "Value sits within configured warn/critical thresholds.",
  unhealthy: "Value drifts toward or beyond threshold bands.",
};

const BY_KEY: Record<string, SensorKnowledge> = {
  vibration_x: {
    what: "Horizontal (X-axis) vibration amplitude measured at the engine bearing housing, in mm/s RMS (ISO 10816 velocity).",
    why: "Rotating machinery like reciprocating gas engines throws detectable vibration signatures well before hard failure. Rising X/Y amplitude is one of the earliest indicators of bearing wear, misalignment, or imbalance.",
    healthy: "Steady low-amplitude signal near baseline (~3 mm/s) with minor sinusoidal variation from load.",
    unhealthy: "Sustained upward trend, new harmonics in the 3–5 kHz band, or repeated excursions above the warn threshold.",
    actionHint: "If trending up >10% over 7 days, schedule bearing inspection and collect a FFT sample.",
  },
  vibration_y: {
    what: "Vertical (Y-axis) vibration amplitude at the bearing housing, mm/s RMS.",
    why: "Complements X-axis to triangulate rotational faults. Combined X+Y drift usually precedes bearing race defects.",
    healthy: "Near baseline with load-synchronous oscillation only.",
    unhealthy: "Divergence from X-axis or asymmetric growth suggests imbalance rather than pure bearing wear.",
  },
  vibration_z: {
    what: "Axial (Z-axis) vibration along the shaft, mm/s RMS.",
    why: "Sensitive to thrust-bearing issues, coupling alignment, and piping-induced load on the engine block.",
    healthy: "Low, stable amplitude.",
    unhealthy: "Sudden step-change usually means a coupling or mount change; slow growth points to thrust bearing wear.",
  },
  bearing_temp: {
    what: "Bearing housing temperature, °C, from an RTD embedded in the journal bearing.",
    why: "Temperature is the consequence of mechanical distress — friction from wear, loss of lubrication, or overload all drive heat up before failure.",
    healthy: "Stable around 75–85 °C at full load, tracking coolant and ambient.",
    unhealthy: "Steady climb of >5 °C over 24 h at constant load, or excursion past 95 °C (warn) / 110 °C (critical).",
    actionHint: "Check oil flow, oil temperature, and correlated vibration before reducing load.",
  },
  oil_pressure: {
    what: "Lubricating oil gallery pressure, bar, upstream of the engine main oil manifold.",
    why: "Adequate oil pressure keeps bearings separated from journals; loss of pressure is a direct-fail scenario.",
    healthy: "Steady at 4–5 bar at rated speed; responsive to RPM.",
    unhealthy: "Pressure sag at constant RPM indicates pump wear, filter blockage, viscosity loss, or bearing clearance opening up.",
    actionHint: "Below 3.5 bar warn, correlate with oil temperature and load before action; below 2.8 bar trip the engine.",
  },
  exhaust_temp: {
    what: "Post-turbo exhaust gas temperature, °C.",
    why: "Reflects combustion efficiency and load. Deviation between cylinders (when individual EGTs exist) flags injector or valve issues.",
    healthy: "Varies with load; steady in the 450–520 °C band at rated output.",
    unhealthy: "Overshoot above 580 °C warn / 640 °C critical risks turbo damage; low EGT at rated load suggests incomplete combustion.",
  },
  rpm: {
    what: "Crankshaft rotational speed, rpm.",
    why: "Tight governor regulation around synchronous speed is required for grid-parallel operation. Drift indicates governor, fuel, or load-sharing problems.",
    healthy: "Within ±0.5% of 1500 rpm during grid-tied operation.",
    unhealthy: "Slow drift or hunting suggests fuel-pressure instability; step changes point to load-sharing imbalance across engines.",
  },
  load_kw: {
    what: "Real electrical power output from the alternator, kW.",
    why: "Primary operational KPI — dispatch follows this. Also baselines every other signal for trend analysis.",
    healthy: "Commanded setpoint tracked within ±1%.",
    unhealthy: "Inability to hold setpoint at stable fuel and RPM suggests alternator, AVR, or grid-side issue.",
  },
  fuel_flow: {
    what: "Gas fuel volumetric flow to the engine, m³/h.",
    why: "Pair with load to compute specific fuel consumption (SFC). Drift in SFC is a leading indicator of engine degradation.",
    healthy: "SFC stable within normal band for load.",
    unhealthy: "SFC climbing at constant load = declining efficiency (combustion issue or heat-recovery backpressure).",
  },
  coolant_temp: {
    what: "Engine jacket-water coolant temperature, °C.",
    why: "Indicates thermal-management health; reflects both engine load and heat-recovery loop performance.",
    healthy: "Tight control around 82–88 °C via thermostat.",
    unhealthy: "Rising trend at constant load points to HX fouling, pump degradation, or failed fan/cooler capacity.",
  },
  grid_freq: {
    what: "Measured grid frequency at the point of common coupling, Hz.",
    why: "Hard constraint for grid-parallel operation. Excursions beyond ±0.5 Hz trip protections.",
    healthy: "Locked at 60.00 Hz ±0.02.",
    unhealthy: "Drift or noise usually originates off-site but can reflect local governor issues when parallel.",
  },
  switchgear_temp: {
    what: "Busbar / switchgear enclosure temperature, °C, via IR spot sensor.",
    why: "Elevated temperature at contacts indicates loose joints, oxidation, or overload — precursors to arc flash events.",
    healthy: "Within ambient +20 °C at rated current.",
    unhealthy: "Localized hot spots or rising trend at constant load — schedule thermographic survey.",
  },
  load_pct: {
    what: "Percent of rated capacity, %.",
    why: "Normalized load indicator for comparison across equipment of different sizes.",
    healthy: "Within design envelope (typically <85% sustained).",
    unhealthy: "Sustained >95% indicates undersized capacity or peak-shaving need.",
  },
  supply_temp: {
    what: "Air handler supply-air temperature, °C.",
    why: "Primary control variable for occupant comfort and process cooling.",
    healthy: "Tight tracking of setpoint, usually 13–16 °C.",
    unhealthy: "Drift from setpoint implies chiller, valve, or damper issues.",
  },
  return_temp: {
    what: "Return-air temperature into the CRAC unit, °C.",
    why: "Indicates thermal load of the data hall; delta T vs supply gauges airflow.",
    healthy: "Typically 22–26 °C at steady IT load.",
    unhealthy: ">27 °C indicates airflow bypass, CRAC capacity shortfall, or raised IT load.",
  },
  suction_p: {
    what: "Ammonia compressor suction pressure, bar.",
    why: "Reflects evaporator temperature demand; low suction pressure cuts capacity and risks liquid slugging.",
    healthy: "Stable above 1.0 bar for a –24 °C room setpoint.",
    unhealthy: "Below 0.8 bar — check feed valves, liquid line blockage, defrost cycle.",
  },
  fire_zone_status: {
    what: "Aggregated fire panel zone state (0 = normal).",
    why: "Any non-zero value reflects an alarm, supervisory, or trouble signal from the fire system.",
    healthy: "0 — all zones normal.",
    unhealthy: "Non-zero — correlate with panel event log; treat as critical until cleared.",
    actionHint: "Non-zero status should page the on-call facility manager immediately.",
  },
};

export function getSensorKnowledge(key: string): SensorKnowledge {
  return BY_KEY[key] ?? FALLBACK;
}
