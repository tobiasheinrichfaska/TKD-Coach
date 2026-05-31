# 02 — Sessions (plan, run, timers)

## MT-02-1: Plan a session from a template
**Preconditions:** At least one group exists.
**Steps:**
1. **Sessions** tab → tap **+** (FAB).
2. Pick a group, set the date, choose a template (e.g. **kids-2h**).
3. Tap **Save**.

**Expected:** Returns to **Sessions**; the plan appears under "Session Plans" with game count + total minutes.
> Not obvious: the **Custom** template currently keeps whatever games were last loaded — there's no per-game add/remove UI yet.

## MT-02-2: Start a session from the Dashboard (regression — cross-tab nav)
**Preconditions:** A plan whose date is **today**.
**Steps:**
1. **Dashboard** tab → under "Today's Sessions", tap the session card.

**Expected:** Opens the **Sessions** tab's **Running Session** screen for that plan (not a no-op).
> Also test the **Start Session** button on the Dashboard → it switches to the Sessions list. (Both previously targeted a non-existent tab and did nothing.)

## MT-02-3: Run a session and the per-game timer
**Preconditions:** A session plan exists.
**Steps:**
1. **Sessions** → on a plan tap **Start** → **Running Session**.
2. On the first game, tap **START** (timer begins counting up).
3. Let it run a few seconds; tap **STOP**.

**Expected:** The big timer counts up in real time. Below it a subtitle reads `<N> min planned · M:SS left` and counts **down**. **STOP** records the elapsed duration for that game (the card shows `✓ M:SS (N min planned)`) and auto-advances to the next game. Move through games and tap **Session Complete**.

## MT-02-3b: Planned-time signal & overrun (Phase 1)
**Preconditions:** A running game. To avoid a long wait, pick the shortest-planned game (W2 · Spiegel-Stand = 5 min) — or just verify at the planned-minute mark.
**Steps:**
1. **START** a game and let it run until the `… left` countdown reaches **0:00** (i.e. elapsed = the planned minutes).

**Expected — call out the non-obvious:**
- **At the planned mark, a signal fires once:** a **haptic buzz** and a short **beep**. It fires **once**, not repeatedly.
- The timer and the game card turn **amber**, and the subtitle flips to `▲ planned time reached · +M:SS over`, which keeps counting up.
- The game **does not auto-stop** — it keeps running until you tap **STOP** (overrun is allowed by design).
- **STOP** records the **full** elapsed time including the overrun.
- If you **START** the same game again, the signal is armed again (fires once more at the planned mark).
> Notes: the beep needs the phone **not** on silent (haptic still fires on silent). Signal is foreground-only — it does not fire if the app is backgrounded (no notification yet).

## MT-02-4: Completion share to Signal/AirDrop
**Steps:** Complete a running session → the system **Share** sheet appears.
**Expected:** A text summary (game names + actual durations) is shareable to Signal/AirDrop/etc.

## MT-02-5: Persistence
**Steps:** Complete a session, fully close the app, reopen.
**Expected:** The completed session shows under "Completed Sessions" (Sessions tab) and "Recent Sessions" (Dashboard).
