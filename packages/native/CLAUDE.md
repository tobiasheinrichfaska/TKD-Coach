# TKD-Coach React Native App — Implementation Notes

**Status:** Phase 1-4 Complete (Groups, Sessions, Assessments, QR Transfer).

## Architecture Overview

### Tech Stack
- **Expo SDK 54** with TypeScript  
- **React Navigation v7** (5 bottom tabs + nested NativeStack)
- **AsyncStorage 2.2.0** for persistence (300ms debounce)
- **React Native** (0.81.5) — no UI library, custom StyleSheet-based components

### Data Model
See [`src/types/index.ts`](src/types/index.ts) for full schema. Core entities:
- **Athlete:** name, belt, birth year, contact info (phone/parent), neuro profile (vestibular/visual/proprioceptive 1-5), poomsae list, techniques list
- **Group:** name, age category (kids/youth/adult/mixed), athlete IDs
- **GameDefinition:** 11 built-in + user-configurable, seeded on first run. Each has phase, neuro target, duration, metric type
- **SessionPlan:** group, date, template (kids-2h / youth-adult-1h30 / custom), planned game IDs
- **SessionLog:** completed session with per-game durations
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
- ✅ Bidirectional handshake protocol (sender announces totalChunks, receiver confirms ready)
- ✅ Chunk transfer with ACK verification (sender shows chunk, receiver scans & acknowledges, resend on mismatch)
- ✅ Change detection (new vs changed vs unchanged data)
- ✅ Merge review screen (summarizes changes before accepting)
- ✅ Stop button (manual termination, no timeout needed)

**Transfer Flow:**
1. Both phones tap Transfer tab → choose role (Sender or Receiver)
2. Sender: SelectData → choose what to sync → display handshake QR
3. Receiver: scan handshake QR → awaits chunks
4. For each chunk: Sender displays → Receiver scans & accumulates → Receiver confirms via ACK
5. After all chunks: Receiver assembles data → detects changes → shows review screen
6. Review shows: New (green) | Changed (amber) | Unchanged (gray)
7. Accept → merge with updates → return to Transfer screen
8. Can repeat immediately for frequent syncs

**Screens:**
- TransferScreen: Role selection buttons (Sender/Receiver)
- SelectDataScreen: Checkboxes for data categories + All/None quick select
- BidirectionalSenderScreen: Handshake QR → chunk pagination with ACK indicators
- BidirectionalReceiverScreen: Handshake scan → chunk accumulation with progress → review → complete

**Key Features:**
- Phone-primed IDs (DEVICEID_timestamp_random) prevent ID collisions when coaches work independently
- Selective export reduces transfer size (can choose just groups, or full sync with assessments)
- Change detection allows updating existing data (not just adding new)
- ACK verification provides error detection (if receiver's preview doesn't match, chunk repeats)
- Review screen gives coach visibility before merging

## Critical Implementation Details

### Timer Accuracy (RunSessionScreen)
- Uses `Date.now()` at game start/stop, NOT interval accumulation
- Displayed timer updates every 100ms via `setInterval` but actual duration = (Date.now() - startedAt) / 1000
- Prevents drift under JS thread load

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
    ├── groups/
    │   ├── GroupsNavigator.tsx
    │   ├── GroupsScreen.tsx
    │   ├── EditGroupScreen.tsx
    │   ├── GroupDetailScreen.tsx
    │   ├── EditAthleteScreen.tsx
    │   └── AthleteDetailScreen.tsx
    ├── sessions/
    │   ├── SessionsNavigator.tsx
    │   ├── SessionsScreen.tsx
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

## Deployment

The app is ready for testing in Expo Go (SDK 54). To start development:

```bash
cd packages/native
npm start  # or: npx expo start --port 8082 (if 8081 busy)
```

Scan with Expo Go app on any phone with SDK 54+ support.

---

*Last updated: 2026-05-30 — All Phases Complete (Phase 4: QR Transfer)*
