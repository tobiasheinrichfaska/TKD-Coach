# Critical User Paths — TKD-Coach

**Purpose:** Core workflows that must not break. Audit validates these end-to-end.
The app is the Expo/React Native client in `packages/native`. Domain logic lives in
`packages/native/src/domain/` (pure, unit-tested); screens render from it.

## People (Humans tab)

- [x] **Create / edit an athlete** — name, birth year, grade (promote/demote/convert-to-Dan), own phone.
- [x] **Create / edit a group** — name + weekly training times; add/remove athletes (M:N).
- [x] **Link emergency contacts / guardians** — reuse an existing person or create a new one; per-edge guardian flag; tel/mailto are tappable.
- [x] **Delete a person safely** — if they hold other roles, offer role-only removal; otherwise full delete with a clear warning (group memberships + assessments removed).

## Sessions

- [x] **Plan a session** — pick group (prefills next training date), date, template or per-phase exercise selection; phase placement persists; add several exercises in a row.
- [x] **Run a session** — start/stop per-exercise timers (drift-free), planned-time signal + overrun, swap an upcoming exercise.
- [x] **Attendance at run** — check athletes in (default absent); persists immediately; shown per session and per athlete.
- [x] **Complete a session** — finalizes the log, closes the screen, moves the plan to Recent; best-effort Signal/Share summary.
- [x] **Cancel / discard a run** — returns the plan to Planned; no stuck/duplicate running logs (reconciled on load; manual "Clear stuck sessions" in Settings).
- [x] **View a past session** — read-only detail: per-phase breakdown, totals, attendance, notes.
- [x] **Sessions list states** — In progress / Planned / Recent are distinct and correct.

## Assessment & progress

- [x] **Log an assessment for ANY metric type** — the entry form is generated from the metric schema, so all six built-in types (and any user-added schema) can be recorded. *(Regression-guarded: see `metrics.test.ts` "every metric type is loggable".)*
- [x] **View progress** — history per exercise with a correct headline delta (honours `lowerIsBetter`) for every metric type.
- [x] **Share progress** — summary reports the real primary-field value for every metric type (not 0).

## Other Data (catalogs)

- [x] **Browse & edit catalogs** — exercises, techniques, body parts/neuro, session templates, metric schemas (seed-once, editable).
- [x] **Factory reset** — re-applies built-in catalog data without touching people/groups/sessions.

## Settings / cross-cutting

- [x] **Language switch** — DE/EN; every UI string via `t()` (English key → German dict); catalog data stays as entered.
- [x] **QR transfer** — sender selects data → handshake QR → chunked broadcast → receiver scans, reviews changes, merges.
- [x] **Persistence** — all data persists across reloads (AsyncStorage; `DEV_RESEED=false`).

| Path | Impact | Audit check |
|---|---|---|
| Log each of the 6 metric types | Core coaching data | `metrics.test.ts` round-trips every schema; form is schema-driven |
| Run → complete a session | Primary daily workflow | Session closes, plan → Recent; no orphan running logs |
| Cancel/discard a run | Avoid stuck state | Plan returns to Planned; `reconcileRunningLogs` on load |
| Attendance visible per athlete | Reporting | `athleteAttendanceStats` + sessions list on AthleteDetail |
| Language switch covers all screens | Usability | No hardcoded user-facing strings; keys present in `de.ts` |
