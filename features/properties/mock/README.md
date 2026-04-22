# Properties Mock Data

All mock / seed data for the Properties module lives here. This folder is the **single source of truth** for mock mode — flip `NEXT_PUBLIC_PROPERTIES_DATA_MODE=live` to swap in real adapters.

## Flagship

`Brahms Heat & Power Plant` (`prop-brahms-hpp`) — 8 MW CHP facility, 4 × CAT G3520 engines. Engine 2 is seeded to drift (vibration + bearing temp) so the predictive-maintenance AI adapter produces a live demo insight during any session.

## Files

- `properties.ts` — seed Property list (6 properties).
- `systems.ts` — `PropertySystem[]` per property.
- `zones.ts` — `PropertyZone[]` (engine hall, control room, switchyard, fuel yard, cooling plant).
- `equipment.ts` — `Equipment[]` (engines, switchgear, heat exchangers, cooling tower, etc.).
- `sensors.ts` — `Sensor[]` with thresholds.
- `stakeholders.ts` — mutable in-memory store; add/remove/list.
- `aiModels.ts` — `AIModelConfig[]` (4 × predictive maintenance + anomaly + energy forecast).
- `aiInsights.ts` — seeded + generator-backed insights (mutable store).
- `workOrders.ts` — seeded + mutable.
- `alerts.ts` — `PropertyAlert[]`.
- `financials.ts` — 24-month trended series per property.
- `health.ts` — composite `PropertyHealthScore` from systems / alerts / insights / WOs.
- `generators/streamGenerator.ts` — per-sensor stateful generator (baseline + sinusoidal + noise + drift).
- `generators/anomalyInjector.ts` — stochastic spike injector.
- `generators/insightGenerator.ts` — emits fresh AI insights during a session.

## Conventions

- All IDs are string slugs (`prop-*`, `sys-*`, `zone-*`, `eq-*`, `sen-*`, `stk-*`, `ai-*`, `ins-*`, `wo-*`, `al-*`).
- Dates in ISO-8601.
- Mutable stores expose `add*`, `remove*`, `update*`, `all*` functions.
