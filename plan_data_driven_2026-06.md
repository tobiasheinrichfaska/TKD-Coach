# Plan — make TKD-Coach fully data-driven (with unit tests)

> Goal: move all *content/config* out of code branches into **data + pure functions**, so the UI is a thin renderer. Build a pure, framework-free **domain layer** with thorough unit tests. Frontend rewiring is a **separate later step**.
> Created 2026-05-31.

## Why (from the audit)
Data-driven today: the Übung library + session builder (read from `state.games`; phase/tags/durations all data).
**Not** data-driven (hardcoded in code):
- Assessment **metric forms** — `AssessmentScreen.tsx` `switch(logMetricType)`; only 3 of 6 types have forms (M2/M3/M4 can't be assessed).
- **Templates** — `SessionPlan.template` is a fixed union; named templates are code constants.
- **Technique / body-part** tags are free strings — no catalog entity.
- Übung library is a code seed (`games.ts`) duplicated from the markdown — no single source / no in-app editor.

## The domain layer (pure TS, no React/RN — so it unit-tests fast with ts-jest)

```
src/domain/
  types.ts          # all entity + registry types
  metrics.ts        # METRIC_SCHEMAS registry + helpers (validate, delta, format)
  techniques.ts     # Technique catalog (seed + lookup)
  bodyparts.ts      # BodyPart catalog (seed + lookup)
  uebungen.ts       # built-in Übungen seed (moved from constants/games.ts)
  templates.ts      # SessionTemplate seed/store helpers
  phases.ts         # SessionPhase labels/config
  selectors.ts      # pure derivations (coverage, totals, status, today, deltas)
  reducer.ts        # pure reducer (moved from context/reducer.ts) + migration
  index.ts          # barrel
  __tests__/        # one spec per module
```

### 1. Metric schemas (kills the hardcoded form switch)
```ts
interface MetricFieldDef { key: string; label: string; unit?: string; integer?: boolean; lowerIsBetter?: boolean }
interface MetricTypeDef { type: AssessmentMetricType; label: string; primaryField: string; fields: MetricFieldDef[] }
const METRIC_SCHEMAS: Record<AssessmentMetricType, MetricTypeDef> = { ... }  // all 6 types
```
Drives: a **generic** assessment form, progress delta + better/worse colour (per-field `lowerIsBetter`), validation. Adding a metric = add a schema entry, no UI code.

### 2. Technique + BodyPart catalogs
- `BodyPart { id; name; region; kind: 'joint' | 'muscle' }` — canonical ~20–30.
- `Technique { id; name; koreanName?; category; bodyPartIds: string[]; steps?: TechniqueStep[] }`.
- Übung `techniques`/`bodyParts` become **validated references** into these catalogs.

### 3. SessionTemplate store
- `SessionTemplate { id; name; ageGroup?; itemIds: string[] }`; built-ins seeded; user-saved ones added at runtime.
- `SessionPlan.templateId?: string` replaces the `'kids-2h' | … | 'custom'` union.

### 4. Selectors (pure, the heatmap/report foundation)
`coverageByTechnique(logs, games)`, `coverageByBodyPart(...)`, `sessionTotals(log, games)`, `planStatus(plan, logs)`, `todaysPlans(plans, todayISO)`, `metricDelta(schema, current, previous)`, `attendanceFor(...)`. All pure → all unit-tested.

### 5. Reducer + migration
Move `context/reducer.ts` into the domain; add actions for `Technique`/`BodyPart`/`SessionTemplate`; the built-in-refresh migration becomes a tested pure `migrate(data)`.

## Testing strategy
- **ts-jest** (the domain is pure — **no jest-expo needed**), `jest.config.js` in `packages/native` scoped to `src/domain/**`.
- Specs: reducer (every action + cascade deletes), migration (refresh built-ins, preserve user data, version bump), metric schemas (every `AssessmentMetricType` has a schema; field/validation/delta + direction), selectors (coverage, totals, status, today, deltas — incl. empty/edge cases), catalog integrity (every Übung technique/bodyPart id exists in a catalog; ids unique; every `logMetricType` has a schema).
- Aim for high coverage on `src/domain/**`; add `npm test` script.

## Sequence
1. **Decide location** (below) + set up jest/ts-jest.
2. Build domain modules **with tests, module by module** (types → metrics → catalogs → selectors → reducer/migration). Each lands green.
3. Keep the app compiling against the domain via re-export shims (e.g. `context/reducer.ts` re-exports from `domain/reducer`) so the UI is untouched this step.
4. **Next step (separate):** rewire the frontend — generic metric form, template-store UI, catalog-backed tags, etc.

## Open decision
Where the domain layer lives — see the question to Tobias.
