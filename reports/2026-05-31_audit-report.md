# TKD-Coach — Comprehensive Audit Report

**Date:** 2026-05-31
**Scope:** `c:\skripte\private\TKD-Coach` (single Expo SDK 54 React Native app under `packages/native`)
**Auditor:** Opus agent (static analysis; runtime pre-flight checks could not be executed — see note)

---

## Pre-flight Check Results

| Check | Status | Notes |
|---|---|---|
| Build (`expo export` / `eas build`) | NOT RUN | Bash and PowerShell execution denied in this session |
| TypeScript typecheck (`tsc --noEmit`) | NOT RUN | Same; strict mode is configured in tsconfig.json |
| Lint | N/A | No project-level ESLint config exists |
| Tests | N/A | No test suite exists (no jest config, no `*.test.*` outside node_modules) |
| `FEATURES_REQUIRED.md` | MISSING | Not present at project root or `/docs/` |
| Data model `EMPTY_STATE` schema | OK | `EMPTY_APP_DATA` matches `AppData` interface (version, games, athletes, groups, sessionPlans, sessionLogs, assessments) |

> Note: command execution was unavailable, so build/typecheck/test results could not be captured. All findings below are from source review. Recommend running `npx tsc --noEmit` in `packages/native` to confirm the type-level findings.

---

## Findings Table

| # | Category | Severity | Finding | Location | Suggestion |
|---|---|---|---|---|---|
| 1 | Features / Runtime | Critical | Cross-tab navigation targets non-existent tab names `SessionsTab` / `AssessmentTab`. Tabs are actually named `Sessions` / `Assessment`. "Start Session", tapping today's session, and the athlete "Progress" button silently no-op or throw. | `DashboardScreen.tsx:59,66`; `AthleteDetailScreen.tsx:57` | Use real tab names (`Sessions`, `Assessment`) and the correct nested screen route + params shape. |
| 2 | Features / Runtime | Critical | Editing an existing athlete is impossible. `EditAthleteScreen.handleSave` early-returns when `groupId` is falsy, but entering edit mode from `AthleteDetailScreen` passes only `athleteId` (no `groupId`). Save silently does nothing. | `EditAthleteScreen.tsx:31`; `AthleteDetailScreen.tsx:54` | Only require `groupId` in create mode: `if (!name.trim()) return; if (!athleteId && !groupId) return;`. |
| 3 | Features / Runtime | Critical | QR "bidirectional handshake / ACK verification" is non-functional and contradicts CLAUDE.md. There is no back-channel: the receiver never displays an ACK QR and the sender never scans. `currentAck` is only ever set to the literal `'waiting'`, and chunk 0 never gets any value, so the "Next Chunk" button stays permanently disabled — the sender cannot advance past the first chunk. | `BidirectionalSenderScreen.tsx:75-101,166-172`; `BidirectionalReceiverScreen.tsx` (no sender-facing QR) | Either implement a real ACK QR on the receiver that the sender scans, or drop the fake ACK and make Next always enabled (manual advance). Update CLAUDE.md to match reality. |
| 4 | Code Quality / Consistency | High | Dead/duplicated merge logic. `mergeAppData` in `qrChunks.ts` is "local-wins" (never applies changes) and is never imported anywhere; the receiver hand-rolls its own merge inline. The unused function also contradicts the "apply changed data" behavior the UI promises. | `qrChunks.ts:258-293`; `BidirectionalReceiverScreen.tsx:116-157` | Delete unused `mergeAppData`, or refactor the receiver to call a single shared, change-applying merge utility (with unit tests). |
| 5 | Features | High | Assessment metric entry only supports 3 of 6 metric types. `vestibular_landing`, `balance_poomsae`, and `poomsae_distraction` games fall through to "No metric form for this game", so 4 of the built-in trackable games (M2, M3, M4 + any custom) cannot be assessed. CLAUDE.md claims "all 6 trackable game types". | `AssessmentScreen.tsx:210-267` | Add metric forms for the remaining three types, or update CLAUDE.md scope. |
| 6 | Code Quality | High | `combo_accuracy` metric entry can silently fail to save. The "Correct" input sets `{...metric, correct}` without `type`; only the "Total" input sets `type`. If a user fills only "Correct", `metric.type` is undefined but `Object.keys(metric).length>0`, so save proceeds and persists an invalid metric (or, if only total typed, also partial). | `AssessmentScreen.tsx:248-262` | Always set `type` in every field handler, and validate required numeric fields before dispatch. |
| 7 | Features | Medium | "Custom" session template is a dead option. Selecting it keeps whatever games were previously loaded; there is no UI to add/remove individual games. Templates also can't be edited per-session. | `PlanSessionScreen.tsx:67-74` | Add a game multi-select for custom mode (and ideally for editing any template). |
| 8 | Data Integrity | Medium | `RunSessionScreen.handleComplete` sets per-game `endedAt` to `Date.now()` at completion time, not the actual stop time, and `startedAt` for never-started games to "now". Recorded gameLog timestamps are therefore inaccurate even though `durationSeconds` is correct. | `RunSessionScreen.tsx:117-122` | Capture `endedAt` when STOP is pressed (store it in `GameLogState`) and emit `undefined` for unplayed games. |
| 9 | Performance | Medium | Timer `useEffect` depends on the whole `currentGameLog` object, which is recreated on every `setGameLogs`. Combined with a 100ms interval this re-creates the interval frequently; minor but avoidable churn. | `RunSessionScreen.tsx:70-84` | Depend on `currentGameLog?.status` and `currentGameLog?.startedAt` primitives instead of the object. |
| 10 | Performance | Medium | Persistence effect keyed on `[state]` re-runs on every state change and `saveAll` (`useCallback([state])`) is recreated each change. Fine for small data, but every keystroke-driven dispatch reschedules a write. Debounce mitigates it. | `DataContext.tsx:52-104` | Acceptable; consider keying the debounce on a serialized snapshot or splitting volatile UI state out of persisted state. |
| 11 | Input Validation | Medium | Belt is entered as free text and cast `as Belt`; any string is stored. Downstream `getBeltInfo` falls back gracefully, but invalid belts persist and won't color/sort correctly. | `EditAthleteScreen.tsx:77` | Use a picker backed by `BELT_OPTIONS` (already defined in belts.ts but unused). |
| 12 | Input Validation | Medium | Session `date` is a free-text `YYYY-MM-DD` field with no validation; a malformed date yields `Invalid Date` in `formatDateShort` and breaks "today" matching on the Dashboard. | `PlanSessionScreen.tsx:148-155` | Validate/normalize the date, or use a date picker. |
| 13 | Dead Code | Low | `useLocalStorage` hook is entirely unused (DataContext does its own persistence). Also unused exports: `generateIds`, `getGameById`, `getGamesByPhase`, `getBeltColor`, `BELT_OPTIONS`, `formatTime`, `mergeAppData`. `noUnusedLocals` doesn't catch exported symbols. | `hooks/useLocalStorage.ts`; `utils/ids.ts`; `constants/games.ts`, `belts.ts`; `utils/format.ts`; `utils/qrChunks.ts` | Remove dead code or wire it in (e.g. use `BELT_OPTIONS` for finding #11). |
| 14 | Security / Crypto | Low | Hand-rolled base64 in `qrChunks.ts` plus `Math.random()` IDs. No real security risk for local P2P sync, but base64 has no input guarding (a corrupted scan with chars outside the alphabet yields garbage `indexOf === -1 → -1`), and IDs are collision-prone under rapid creation (timestamp ms + 5 random base36 chars). Phone-primed IDs mitigate cross-device collisions. | `qrChunks.ts:7-50`; `utils/ids.ts` | Acceptable for scope. Optionally guard base64 decode and prefer `generatePhonePrimedId` consistently (sender uses plain `generateId` at `BidirectionalSenderScreen.tsx:41`). |
| 15 | Architecture | Low | `version` field exists on `AppData` but there is no migration path. Imported data via QR overwrites `version` from peer; on schema change there's no upgrade logic in `LOAD_ALL`. | `reducer.ts:53-57`; `DataContext.tsx:28-30` | Add a `migrate(data)` step on load keyed on `version`. |
| 16 | Consistency | Low | Mixed UI language: German labels in Groups navigator/titles and app.json, English elsewhere (Transfer, Sessions, Assessment screens, buttons like "Accept & Merge", "Reject"). | Throughout `transfer/`, `sessions/`, `assessment/` | Pick one language (project convention is German) and localize consistently. |
| 17 | Error Handling | Low | `assembleFromChunks` / `inflate` failures surface as a generic Alert, but a single missing chunk silently never triggers assembly (count never equals total) with no timeout/recovery prompt. | `BidirectionalReceiverScreen.tsx:91-96` | Add a "missing chunk N" hint and a manual "force assemble/retry" affordance. |
| 18 | Tooling / Tests | Low | No ESLint config and zero tests for non-trivial pure logic (`qrChunks` encode/assemble/detectChanges, `format` deltas). These are the highest-value, easiest-to-test units and contain the bugs above. | project root | Add ESLint (expo config) + a minimal Jest setup; unit-test `qrChunks` and `format`. |
| 19 | Hygiene | Low | `.expo/devices.json` is committed despite `.expo/` being in `.gitignore` (empty `{"devices":[]}` — harmless, but indicates it was tracked before the ignore rule). | `packages/native/.expo/devices.json` | `git rm --cached` the file. |

---

## Summary

### Findings by Severity
- **Critical:** 3 (broken cross-tab nav, broken athlete edit, non-functional QR ACK/handshake)
- **High:** 3 (dead/contradictory merge logic, 3 missing assessment forms, combo_accuracy silent-save bug)
- **Medium:** 6
- **Low:** 7
- **Total:** 19

### Top 3 Critical/High Priority Fixes
1. **Fix cross-tab navigation (#1).** Three primary user actions (Start Session from Dashboard, open today's planned session, view athlete Progress) are wired to tab names that don't exist (`SessionsTab`/`AssessmentTab` vs actual `Sessions`/`Assessment`). High user-visible breakage, low-effort fix.
2. **Fix athlete editing (#2).** Editing any existing athlete silently does nothing because `groupId` isn't passed into edit mode and `handleSave` gates on it. One-line guard change.
3. **Reconcile the QR transfer feature with reality (#3, #4).** The "bidirectional ACK handshake" is cosmetic — the sender's Next button is permanently disabled on chunk 0, so the headline Phase 4 feature can't complete a transfer. Either implement a real receiver→sender ACK QR or simplify to manual advance, and delete the unused contradictory `mergeAppData`.

### Top 2 Architectural Improvements
1. **Centralize and test the transfer/merge logic.** `qrChunks.ts` holds the app's most complex, bug-prone pure logic (encode/assemble/detectChanges/merge) yet has an unused merge function that contradicts the inline receiver merge. Consolidate to one tested utility; this directly addresses #3/#4/#6.
2. **Introduce typed navigation param lists.** Navigation is intentionally loose (`ParamListBase`), which is exactly why findings #1 and #2 (wrong route names, missing params) compile cleanly and fail only at runtime. Per-navigator `ParamList` types would have caught all three critical bugs at compile time.

### Quick Wins (easy, high impact)
- #1 navigation tab-name fix (one-line per call site)
- #2 athlete-edit guard (one line)
- #11 belt picker using the already-defined-but-unused `BELT_OPTIONS`
- #13/#19 delete dead code and untrack `.expo/devices.json`
- Add `FEATURES_REQUIRED.md` documenting the critical user paths so future audits can validate them

---

*Report generated by /audit. Runtime build/typecheck/test verification was not possible in this session (shell execution denied); findings are from source review and should be confirmed with `npx tsc --noEmit`.*
