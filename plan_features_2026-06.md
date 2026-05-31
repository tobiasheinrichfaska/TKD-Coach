# TKD-Coach — Feature Plan (2026-06)

> Planning doc. Per workspace convention, migrate accepted sections into `tkd-coach_claude.md` before archiving.
> Created 2026-05-31. Decisions captured from planning session below.

## Decisions (2026-05-31)

- **Email transport:** Deferred. Do **not** embed IMAP/SMTP in TKD-Coach (impossible in Expo Go — raw TCP). Instead build a **separate "Expo Mail Gateway" app** (HTTPS relay) that any of Tobias's Expo apps can call. TKD-Coach codes against an `EmailService` interface now; the real implementation lands once the gateway exists. See `## Phase 4` and the new-project note.
- **Absence boolean:** Per-athlete opt-in — `autoAbsenceEmail: boolean` on `Athlete`. If true, the kid is marked absent, and a parent email exists, an absence mail is queued.
- **Technique model:** Full — first-class `Technique` catalog with ordered step/progression breakdowns ("Yop-Chagi in pieces"), technique tags on games, reusable `Block`s, per-athlete technique progress linked to the catalog.
- **Anatomy depth:** Joints + major muscle groups (~20–30 entries: ankle/knee/hip/shoulder/spine + quads/hamstrings/hip-flexors/calves/core …). Enough to drive stretch selection and a readable heatmap without medical overkill.
- **Body heatmap:** Anatomical SVG silhouette (front/back figure via `react-native-svg`, Expo-Go-safe) with regions tinted by accumulated load.
- **Planning modes:** Two — (A) *Focus* a session on a chosen technique/goal; app suggests warmup/stretch/main/cooldown content addressing that technique and the joints it loads. (B) *Analyze & recommend* from past sessions: deepen recent goals vs broaden under-covered techniques/regions. Both consume one shared coverage engine.

---

## Current state (summary)

Expo SDK 54 / RN 0.81.5, single app in `packages/native`. `useReducer` + Context, AsyncStorage (300ms debounce). Data model: `Athlete`, `Group`, `GameDefinition` (11 built-ins), `SessionPlan`, `SessionLog`/`GameLog`, `Assessment`. CLAUDE.md claims Phases 1–4 complete.

**Caveat — three "complete" features are broken (2026-05-31 audit):**
1. Cross-tab navigation targets non-existent tab names (`SessionsTab`/`AssessmentTab`) → Start Session, today's session, athlete Progress all silently no-op.
2. Editing an existing athlete does nothing (`handleSave` gates on `groupId` that edit-mode never passes).
3. QR transfer can't advance past chunk 0 (cosmetic ACK; Next button permanently disabled).

Foundation (model, persistence, games library) is solid; headline flows have never round-tripped. Fix first.

---

## Phase 0 — Repair foundation (blocking)

| Fix | Location | Action |
|---|---|---|
| Cross-tab nav | `DashboardScreen.tsx:59,66`, `AthleteDetailScreen.tsx:57` | Use real tab names `Sessions`/`Assessment` + correct nested route & params |
| Athlete edit | `EditAthleteScreen.tsx:31` | `if (!name.trim()) return; if (!athleteId && !groupId) return;` |
| QR Next button | `BidirectionalSenderScreen.tsx` | Implement real receiver→sender ACK QR, or simplify to always-enabled manual advance; update CLAUDE.md to match |
| Typed nav | `types/navigation.ts` | Per-navigator `ParamList` types (this is *why* the above compiled cleanly) |
| Merge logic | `qrChunks.ts` / receiver | Consolidate to one tested, change-applying merge util (audit #4) before adding new transferable entities |

**Acceptance:** all three flows demonstrably round-trip on device; nav params typed.

### Status — 2026-05-31 (mostly done)

**Done & type-clean (tsc 0 errors, Metro bundles 200):**
- ✅ **tsc unblocked.** Root cause: `expo install --fix` downgraded `@types/react` to `~19.1.10`, which is **incompatible with React Native 0.81.5's bundled `View`/`Component` types** → every `<View/>` flagged "not a valid JSX component." Fix: pin `@types/react` to `^19.2` (RN 0.81.5 needs ≥19.2; Expo's recommended 19.1.x is wrong here). Accept Expo's startup banner flagging it.
- ✅ **Cross-tab nav** fixed: `SessionsTab`/`AssessmentTab` → real `Sessions`/`Assessment` with correct nested `RunSession`/`Progress` routes.
- ✅ **Athlete edit** guard fixed (groupId only required in create mode).
- ✅ **Typed nav ParamLists + screen-prop helpers** added in `types/navigation.ts` (+ global `ReactNavigation.RootParamList` augmentation). Legacy loose `ScreenProps` kept (deprecated) so unmigrated screens still compile.
- ✅ **QR merge consolidated** to one pure `applyChanges()` (+ generic `mergeCollection` seam for the future engine extraction); deleted the unused, change-dropping `mergeAppData`; receiver now calls the shared path.
- ✅ **QR sender Next button** fixed: removed the fake ACK gating (no back-channel exists); honest manual Previous/Next advance. CLAUDE.md corrected.

**Phase 0 follow-ups:**
- ✅ **All screens migrated to typed screen-props** (every navigator typed with its ParamList; screens use `*StackScreenProps`/`RootTabScreenProps` helpers via `CompositeScreenProps`). Wrong tab/route names + bad params are now **compile errors**. Deprecated loose `ScreenProps` removed. Verified: the RN navigator↔CompositeScreenProps variance pattern compiles cleanly.
- ◑ **On-device verification:** nav flow confirmed working on device by user 2026-05-31. Full QR two-phone round-trip + athlete-edit save still to be spot-checked on device.
- ☐ **Jest harness + unit tests** for `qrChunks` (`applyChanges`/`detectChanges`/encode-assemble) — the merge logic is now a pure, testable seam; harness still to be added (jest-expo).

### Versioning & credits (requested 2026-05-31) — ✅ done
- ✅ Added an **About** card at the bottom of the Dashboard showing name, version (read live from `app.json` via `src/constants/appInfo.ts`), tagline, and author. No license asserted (repo still private). A fuller About screen / license line can come with the global German-UI pass (audit #16).

### Follow-up: extract QR sync engine to shared repo (decided 2026-05-31)
- Decision: **shared "expo-shared" repo** (housing this engine **and** the planned mail-gateway client + future reusable modules), **engine only** (pure logic, not the RN screens), **fix-in-place-first** (done above) **then extract**.
- Next: generalize `qrChunks` over "named collections of `{id}` entities" (config: collection key → label) so it's app-agnostic; move to the shared repo; add Jest tests; consume from TKD-Coach (first consumer) and later other Expo apps. See [[project_qr_sync_extraction]] and the mail-gateway note.

---

## Phase 1 — Activity timers with signal

Start a planned game by button → counts toward `defaultMinutes` → **signals at planned stop** (haptic + sound), but **allows overrun** until manual stop.

- Deps (Expo-Go-safe): `expo-haptics`, `expo-av` (sound); optional `expo-notifications` for backgrounded signal.
- `RunSessionScreen`: countdown vs `defaultMinutes*60`; at expiry fire haptic+sound once, switch UI to "overrun" (amber), keep counting; manual STOP records actual duration.
- Fold in audit fixes #8 (capture `endedAt` at STOP, not completion) and #9 (depend on `currentGameLog?.status`/`startedAt` primitives, not the object).
- Model: optionally store `plannedSeconds` on `GameLog` for plan-vs-actual reporting.

---

## Phase 2 — Technique + Anatomy model (refactor)

Introduce a shared technique **and body** vocabulary so "which game trains what / which block elevates what / what joints does this load / what reps is this athlete getting" all become queries. This is the backbone for goal-driven planning (Phase 5) and heatmaps (Phase 4).

**New entities (types/index.ts):**
```ts
interface TechniqueStep { id: string; order: number; name: string; description?: string }
interface Technique {
  id: string; name: string; koreanName?: string;
  category?: 'kick' | 'block' | 'stance' | 'strike' | 'poomsae' | 'footwork' | string;
  steps: TechniqueStep[];          // "Yop-Chagi in pieces" — ordered progressions
  bodyPartIds: string[];           // joints/muscles this technique loads
  notes?: string;
}
interface BodyPart {               // ~20-30: joints + major muscle groups
  id: string; name: string;        // e.g. "Sprunggelenk", "Hamstrings"
  kind: 'joint' | 'muscle';
  region: 'lower-leg' | 'upper-leg' | 'hips' | 'core' | 'spine' | 'shoulders' | 'arms' | 'neck';
  svgRegionId?: string;            // maps to a tintable zone in the body figure (Phase 4)
}
interface Stretch {                // warmup/cooldown stretching content, tagged to anatomy
  id: string; name: string; phase: 'warmup' | 'cooldown';
  bodyPartIds: string[]; defaultSeconds: number; description?: string;
}
interface Block {                  // reusable named sub-sequence (e.g. an Aufwärmen block)
  id: string; name: string; phase: 'warmup' | 'main' | 'cooldown';
  gameIds: string[]; stretchIds?: string[]; notes?: string;
}
```
**Tags & links:**
- `GameDefinition` gains `techniqueIds: string[]` (techniques trained) and optional `bodyPartIds: string[]` (direct load not implied by a technique, e.g. a vestibular drill loading ankle/neck stabilizers). Seed `techniqueIds` from the `Tech:` lines in `_source/20260530_02.md`.
- A game/block's effective body load = its own `bodyPartIds` ∪ the `bodyPartIds` of all its techniques.
- `SessionPlan` may reference `blockIds` in addition to/instead of flat `plannedGames` (resolve blocks→games at runtime).
- Migrate `Athlete.techniques: {name,level}[]` → `athleteTechniques: { techniqueId, level }[]` (keep name fallback during migration).

**Reducer:** `ADD/UPDATE/DELETE_` for `TECHNIQUE`, `BODYPART`, `STRETCH`, `BLOCK`.

**Views (queries):**
- Technique detail → steps, body parts loaded, games that train it + blocks including those games.
- Game detail → techniques trained + aggregated body load.
- Body-part detail → techniques/games/stretches that involve it.
- Plan/Block → aggregated techniques elevated + aggregated body load.
- Athlete → technique levels linked to catalog.

**Seed data:** ~20–30 `BodyPart`s; map the 11 games' techniques to body parts; a starter `Stretch` library covering the main joints (ankle, hip, hamstring, shoulder, spine).

**Migration:** bump `AppData.version` → 2; add `migrate(data)` in `DataContext` `LOAD_ALL` (also resolves audit #15 — no migration path today).

---

## Phase 3 — Attendance (athletes + coaches)

**Athlete attendance:**
- New `Attendance { id; sessionLogId; athleteId; status: 'present'|'absent'|'excused'; recordedAt }`.
- `Athlete` gains `autoAbsenceEmail: boolean` (per decision).
- Capture UI in `RunSessionScreen`: checklist of the group's athletes.
- On absent + `autoAbsenceEmail` + parent email present → enqueue absence email via `EmailService` (stub in Phase 3; real send in Phase 4).

**Coach attendance + quarterly report:**
- New `Coach { id; name; email? }` (no coach entity exists today).
- `CoachAttendance { id; sessionLogId; coachId; hours }` (or `coachIds`+`hours` on `SessionLog`).
- Quarterly report: group by calendar quarter, sum coached hours, list dates per coach. Local computation; shareable text (and emailable once gateway exists).

**Reducer:** actions for attendance, coaches, coach-attendance. Extend `TransferSelection` + merge to cover new entities (after Phase 0 merge consolidation).

---

## Phase 4 — Evaluation & heatmaps

The shared **coverage engine** + two heatmaps. Read-only insight first; Phase 5 planning consumes the same engine.

**Coverage engine (`utils/coverage.ts`, pure + unit-tested):** from `sessionLogs` (and their resolved games/blocks → techniques → body parts), compute load per **technique** and per **body part** over a date window. Each metric exposes:
- frequency (count of sessions touching it), minutes (summed game durations attributed to it), and **recency-weighted load** (recent reps weighted higher).
- "last trained" date per technique/body part → drives deepen-vs-broaden and "neglected" flags.

**Technique heatmap:** techniques (rows) × time buckets or a single recency/intensity scale (columns/color). Surfaces what's been hammered vs untouched.

**Body heatmap:** front/back anatomical **SVG silhouette** (`react-native-svg`); each `BodyPart.svgRegionId` zone tinted by accumulated load. Shows whether training is lopsided (e.g. all kicks, no upper body) and flags overload.

**Acceptance:** both heatmaps reflect real session history; tapping a technique/region drills into contributing sessions.

---

## Phase 5 — Goal-driven planning

Two planning modes on top of the coverage engine + technique/anatomy model.

**Mode A — Focus:** coach picks a technique (or body part / goal). App proposes a session: warmup + **stretches for the loaded joints**, main blocks/games that train the technique, and a cooldown — filtered/ranked by `techniqueIds`/`bodyPartIds`. Coach tweaks, then saves as a `SessionPlan`. ("Let's focus on Yop-Chagi today" → app fills the slots.)

**Mode B — Analyze & recommend:** read past sessions via the coverage engine and suggest either **deepen** (continue recently emphasized techniques, advance their `steps`/levels) or **broaden** (surface under-covered techniques / neglected body regions from the heatmaps). Output is a proposed plan the coach accepts/edits.

**Acceptance:** from a cold "focus: Yop-Chagi" choice the app produces a coherent, technique-relevant plan; analyze mode flags the least-covered techniques/regions and proposes a balancing session.

---

## Phase 6 — Email (via separate gateway app, deferred)

- Define `EmailService` interface in TKD-Coach now: `sendEmail(msg)`, `fetchInbox()`. Phase 3 ships a queue/no-op stub.
- Real implementation = thin HTTPS client to the **Expo Mail Gateway** app (below). User configures account + server info **in the gateway**, not per-app.
- Inbox view + absence-email send wire up once the gateway is live.

### New project to log: "Expo Mail Gateway"
A standalone HTTPS relay that speaks IMAP/SMTP server-side so Tobias's Expo apps (Expo Go, no raw sockets) can send mail and read an inbox over HTTPS. Holds account/server config + credentials centrally (DSGVO weight lives here, not in each app). Reusable across all future Expo apps. To be created via `/new`; TKD-Coach is its first consumer.

---

## Cross-cutting notes

- Every new entity (techniques, body parts, stretches, blocks, attendance, coaches) must be added to `TransferSelection` and the (consolidated) merge logic — do Phase 0 merge cleanup first.
- Keep German UI convention (audit #16) for all new screens.
- Add minimal Jest + ESLint when touching `qrChunks`/`format`/`coverage`/migration (audit #18) — highest-value pure logic. The coverage engine especially must be unit-tested since both heatmaps and both planning modes depend on it.
- Dependency spine: Phase 2 (technique + anatomy model) feeds Phase 4 (coverage engine + heatmaps), which feeds Phase 5 (goal-driven planning). Build metrics → visualize → recommend, in that order.

## Suggested sequence
Phase 0 → 1 → 2 → 3 → 4 → 5 → (6 once the mail gateway exists). Techniques/anatomy and the evaluation engine (your core ideas) intentionally precede email. Work in small steps, document in this file, stop & report between steps.
