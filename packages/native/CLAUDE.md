# TKD-Coach React Native App — Implementation Notes

**Status:** Phase 1-4 Complete (Groups, Sessions, Assessments, QR Transfer).

## Architecture Overview

### Tech Stack
- **Expo SDK 54** with TypeScript  
- **React Navigation v7** — 5 bottom tabs: **Dashboard · Sessions · Humans · Other Data · Transfer** (each a nested NativeStack). *Humans* hub → Athletes / Groups / Emergency contacts & guardians / Assessment (Assessment is nested under Humans, not a top tab). *Other Data* hub → Games / Techniques / Body parts / Session templates / Metric schemas (browse) + a **Werkseinstellung** (factory-reset) button.
- **AsyncStorage 2.2.0** for persistence (300ms debounce)
- **React Native** (0.81.5) — no UI library, custom StyleSheet-based components

### Data Model
**Visual reference:** open [`docs/data-model.html`](docs/data-model.html) in a browser — a self-contained doc of every entity, the reducer actions, and the pure domain functions (metrics/selectors/templates/catalogs/migration). Regenerate it when the model changes.

See [`src/types/index.ts`](src/types/index.ts) for full schema. Core entities:
- **Person:** the single human identity (name, email?, phones≤5, `isCoach`). Roles attach by **composition, not inheritance**: an embedded `athlete` profile (belt/birthYear/neuroProfile/poomsae/techniques) and `isCoach`. One person can be athlete + coach + another athlete's guardian at once. The UI keeps "athlete" via the flat `AthleteView` (`domain/people.ts`: `athleteViews`, `toAthleteView`).
- **Group:** name, `athleteIds` → Person ids (M:N, sole membership link; 0..n groups), and `trainingTimes` (weekly `TrainingSlot{weekday 1–7, start "HH:MM", durationMin}`). Schedule logic in `domain/schedule.ts` (`nextSession`, `slotsOnDay`/`trainsOn`, `formatSlot`) drives PlanSession date prefill + Dashboard "Training heute". No `ageCategory` (retired; convey via the name).
- **ContactLink:** edge {`contactId`→Person, `athleteId`→Person, `guardian`} — emergency-contact/guardian relationship; **guardian is per-edge**. Phones/emails are tappable (`utils/linking.ts`).
- **GameDefinition (Übung):** built-in (factory) + user-configurable, **seeded once** on a fresh install (never auto-overwritten). `sessionPhases: SessionPhase[]` (one or more of the 5 protocol phases; a plan groups an entry under its lowest via `primaryPhase`), duration, optional `logMetricType`, `techniques`/`bodyParts` tags. No `phase` or `neuroTarget` — colour derives from the phase (`phaseBand`), and body parts stand in for the old neuro target.
- **SessionPlan:** group, date, template (kids-2h / youth-adult-1h30 / custom), planned game IDs
- **SessionLog:** completed session with per-game durations, plus an optional **`attendance`** roster snapshot (`AttendanceEntry{athleteId, present}`) captured at run time (logic in `domain/attendance.ts`: `defaultAttendance`, `toggleAttendance`, `presentCount`, `isPresent`, `absentIds`)
- **Assessment:** athlete metric (balance hold, combo accuracy, error count, etc.) with date, notes

State persisted to AsyncStorage; changes debounced 300ms.

## Completed Phases

### Phase 1 — Foundation (Complete)
- ✅ Types, constants (colors, belts, 11 games), utilities
- ✅ State management (reducer + DataContext)
- ✅ Navigation shell (5 tabs + navigators)
- ✅ Groups/Athletes CRUD with contact fields
- ✅ 11 built-in games seeded on first run

**Screens:** GroupsScreen, EditGroupScreen, GroupDetailScreen, EditAthleteScreen, AthleteDetailScreen

### Phase 2 — Sessions (Complete)
- ✅ Session planning (group, date, template, game selection)
- ✅ Live session runner with per-game timers (uses Date.now() for accuracy)
- ✅ Session completion with automatic Share.share() → Signal/AirDrop
- ✅ Dashboard showing today's sessions + recent logs + quick stats

**Screens:** DashboardScreen, SessionsScreen, PlanSessionScreen, RunSessionScreen  
**Key Feature:** Real-time game timer shows elapsed time; stop records actual duration vs planned

### Phase 3 — Assessments (Complete)
- ✅ Multi-step assessment wizard (group → athlete → game → metric form)
- ✅ Metric logging for all 6 trackable game types
- ✅ Progress history grouped by game with delta indicators
- ✅ Signal share for progress summaries (athlete/parent feedback)
- ✅ MetricRow component with smart color coding (green=improvement, amber=regression)

**Screens:** AssessmentScreen, ProgressScreen  
**Key Feature:** Auto-calculates delta from previous entry; color-codes improvement vs regression

## Phase 4 — QR Transfer (Complete) — Bidirectional with Change Detection

**Completed Implementation:**
- ✅ Phone-primed ID generation (prevents collisions between coaches)
- ✅ Selective data export (checkboxes for groups/athletes/sessions/assessments)
- ✅ Handshake QR (sender announces totalChunks so the receiver knows when it's done)
- ✅ One-way chunk broadcast (sender pages through chunk QRs; receiver scans them off the sender's screen — **no receiver→sender back-channel exists**)
- ✅ Change detection (new vs changed vs unchanged data)
- ✅ Merge review screen (summarizes changes before accepting)

> **Correction (2026-05-31):** Earlier docs claimed a "bidirectional ACK handshake with resend on mismatch." That was never real — there is no back-channel; the receiver only ever scans. The sender now advances chunks **manually** (Previous/Next), which is the honest model. The single `applyChanges()` in `qrChunks.ts` is the one merge path (the old unused `mergeAppData` was deleted).
- ✅ Stop button (manual termination, no timeout needed)

**Transfer Flow:**
1. Both phones tap Transfer tab → choose role (Sender or Receiver)
2. Sender: SelectData → choose what to sync → display handshake QR
3. Receiver: scan handshake QR → awaits chunks
4. For each chunk: Sender displays → Receiver scans & accumulates → Sender taps Next (manual advance, no ACK)
5. After all chunks: Receiver assembles data → detects changes → shows review screen
6. Review shows: New (green) | Changed (amber) | Unchanged (gray)
7. Accept → merge with updates → return to Transfer screen
8. Can repeat immediately for frequent syncs

**Screens:**
- TransferScreen: Role selection buttons (Sender/Receiver)
- SelectDataScreen: Checkboxes for data categories + All/None quick select
- BidirectionalSenderScreen: Handshake QR → manual chunk pagination (Previous/Next)
- BidirectionalReceiverScreen: Handshake scan → chunk accumulation with progress → review → complete

**Key Features:**
- Phone-primed IDs (DEVICEID_timestamp_random) prevent ID collisions when coaches work independently
- Selective export reduces transfer size (can choose just groups, or full sync with assessments)
- Change detection allows updating existing data (not just adding new)
- Receiver de-dupes chunks by `id_index`, so re-showing a chunk (Previous/Next) is harmless
- Review screen gives coach visibility before merging via the single `applyChanges()` merge path

## Critical Implementation Details

### Activity Timers + Signal (RunSessionScreen) — Phase 1
- **START** a game → counts up from `Date.now()` (drift-free; duration = (now − startedAt)/1000).
- At the game's planned duration (`defaultMinutes`) a **one-time signal** fires: `expo-haptics` notification + a short beep (`expo-audio`, `assets/beep.wav`). Both best-effort/guarded (web/no-audio just skips sound; haptic still fires).
- Then **overrun** state (amber timer + "+M:SS over"); the game keeps counting until manual **STOP**. STOP captures the real `endedAt` and records `durationSeconds`, then auto-advances.
- Timer `useEffect` depends on **primitives** (status / startedAt / index / plannedMinutes), not the whole log object, to avoid interval churn (fixes audit #9).
- Unplayed games emit **no timestamps** — `GameLog.startedAt` is optional now (fixes audit #8: no fake completion-time stamps).
- Signal fires once per run via a `signaledRef` Set of game indices; re-START clears the index so it can fire again.

### Persistence Strategy
- DataContext dispatches trigger immediate `setGameLogs` update
- Debounced 300ms AsyncStorage write via effect
- On app open, loads full AppData or seeds with 11 games + empty arrays

### Games Library
- Seeded from `BUILTIN_GAMES` constant on first run
- Live in AppData.games (user can edit/delete/add)
- Each GameDefinition has `isBuiltIn: boolean` for UI badging
- Templates (kids-2h, youth-adult-1h30) are arrays of game IDs, resolved at runtime

### Signal Sharing
- Uses React Native `Share.share()` (built-in, no extra library)
- Coach taps "Share" → system sheet → user picks Signal/AirDrop/etc.
- Session summary: formatted text with game names + actual durations
- Progress summary: athlete name + belt + metric values + deltas

## Testing Checklist (Phase 1-3)

- [ ] Create group → add athletes → data persists after close+reopen
- [ ] Edit athlete contact info
- [ ] Plan session with template → actual session start/stop timers → complete
- [ ] Session summary auto-shares to Signal
- [ ] Log assessment (C1 balance hold) multiple times → see deltas in progress screen
- [ ] Share progress → summary appears in Signal

## File Structure

```
src/
├── types/
│   └── index.ts         ← All interfaces
├── constants/
│   ├── colors.ts
│   ├── belts.ts
│   └── games.ts         ← 11 built-ins + templates
├── context/
│   ├── reducer.ts
│   └── DataContext.tsx
├── hooks/
│   └── useLocalStorage.ts
├── utils/
│   ├── ids.ts
│   ├── format.ts
│   ├── qrChunks.ts     ← Phase 4: encode/assemble/export/detectChanges
│   └── deviceId.ts     ← Phase 4: phone-primed IDs
├── components/
│   └── MetricRow.tsx   ← Imported by ProgressScreen
└── screens/
    ├── DashboardScreen.tsx
    ├── otherdata/                ← "Other Data" tab
    │   ├── OtherDataNavigator.tsx
    │   ├── OtherDataHubScreen.tsx ← menu + Werkseinstellung (factory reset)
    │   └── OtherDataLists.tsx     ← browse lists: games/techniques/bodyparts/templates/metric-schemas
    ├── groups/                    ← "Humans" tab (stack named GroupsStack* for back-compat)
    │   ├── GroupsNavigator.tsx    ← Humans stack: HumansHub first, nests Assessment
    │   ├── HumansHubScreen.tsx    ← Athletes / Groups / Contacts&Guardians / Assessment
    │   ├── GroupsScreen.tsx        ← groups list + "All Athletes" entry (shows ungrouped count)
    │   ├── AllAthletesScreen.tsx   ← full roster; All/Ungrouped filter; create ungrouped athlete
    │   ├── EmergencyContactsScreen.tsx  ← all contacts; tap to edit; quick "Anrufen"
    │   ├── EditEmergencyContactScreen.tsx ← name/email/≤5 phones/isGuardian + athlete links
    │   ├── EditGroupScreen.tsx
    │   ├── GroupDetailScreen.tsx
    │   ├── EditAthleteScreen.tsx   ← name, birth year, graduation (promote/demote), contact
    │   └── AthleteDetailScreen.tsx ← group chips (M:N) + linked emergency contacts (tappable tel/mailto)
    ├── sessions/
    │   ├── SessionsNavigator.tsx
    │   ├── SessionsScreen.tsx        ← Planned vs Recent (today highlighted); "Alle →" to RecentSessions
    │   ├── RecentSessionsScreen.tsx  ← full list of completed (non-archived) sessions
    │   ├── SessionArchiveScreen.tsx  ← archived sessions (unarchive)
    │   ├── PlanSessionScreen.tsx
    │   └── RunSessionScreen.tsx
    ├── assessment/
    │   ├── AssessmentNavigator.tsx
    │   ├── AssessmentScreen.tsx
    │   └── ProgressScreen.tsx
    └── transfer/          ← Phase 4
        ├── TransferNavigator.tsx      ← Main navigator (routes to all screens)
        ├── TransferScreen.tsx         ← Role selection (Sender/Receiver)
        ├── SelectDataScreen.tsx       ← Sender: choose what to sync
        ├── BidirectionalSenderScreen.tsx  ← Sender: handshake + chunk loop
        └── BidirectionalReceiverScreen.tsx ← Receiver: scan + accumulate + review
```

## Testing Checklist (All Phases)

- [ ] Create group → add athletes with contact info → save
- [ ] Edit athlete, verify contact data persists
- [ ] Plan session with template → run session → timers accurate → complete → Share to Signal
- [ ] Log assessment (balance hold) multiple times → ProgressScreen shows deltas
- [ ] Share progress → Signal summary appears
- [ ] **Transfer Test (two phones):**
  - [ ] Phone A: Transfer → "Start Transfer Sender" → Select Groups + Athletes → Display handshake QR
  - [ ] Phone B: Transfer → "Start Transfer Receiver" → Scan handshake QR
  - [ ] Phone A: Display chunk QRs (manually advance with Next)
  - [ ] Phone B: Auto-scan and accumulate chunks
  - [ ] Phone B: Review changes (should show new groups/athletes as green)
  - [ ] Phone B: Accept → verify new data appears in groups/athletes lists
  - [ ] Repeat transfer with different selection (e.g., only assessments)

---

## Deployment & Testing

The app is ready for testing in Expo Go (SDK 54).

**Start Development Server:**

```bash
cd packages/native
npm start
```

This starts the server on **port 8082** with correct NODE_OPTIONS for TypeScript.

**Important:** Always provide the full IP address and port when connecting from physical devices:
- Metro will display the QR code and connection URL
- Expo uses `exp://` protocol: `exp://YOUR_MACHINE_IP:8082`
- Example: `exp://192.168.1.100:8082`
- Do NOT use `localhost:8082` or `http://` — use the actual machine IP address with `exp://` protocol

**To Test on Phone:**
1. Open Expo Go app (SDK 54+ supported)
2. Scan the QR code displayed in terminal, OR
3. Manually enter in Expo Go: `exp://MACHINE_IP:8082` (e.g., `exp://10.11.100.239:8082`)

**Two-Phone Transfer Testing:**
- Both phones must be on same network
- Use the full IP address for connectivity (not localhost)

---

## Known Issues & Fixes

### Monorepo React deduplication (metro.config.js)
`packages/native` is an npm workspace under `TKD-Coach/`. The workspace root may hoist `react` to a different version than the one pinned in `packages/native/package.json`. If you see `Invalid hook call` or `useReducer of null` at runtime:
1. Check `TKD-Coach/node_modules/react/package.json` version — must be `19.1.0`
2. If wrong: `cd TKD-Coach && npm install react@19.1.0 --save-exact`
3. The `metro.config.js` uses `nodeModulesPaths` to prefer the local copy — do not add `resolveRequest` interceptors for scheduler/react-is/react-dom (they live nested inside react-native and removing them breaks things)

### Orientation
`app.json` uses `"orientation": "default"` — portrait and landscape both allowed. Tablets rotate freely.

---

*Last updated: 2026-05-30 — Monorepo metro fix, orientation support, all 5 tabs working; type-safety pass (eliminated `any`/`as any` on screen props & metric drafts, added pako shim, fixed sort-on-state mutation bugs)*
