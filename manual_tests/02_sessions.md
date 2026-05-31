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
2. On the first game, tap **Start** (timer begins counting up).
3. Let it run a few seconds; tap **Stop**.

**Expected:** The timer counts in real time; **Stop** records the elapsed duration for that game. Move through games and **Complete** the session.
> Not obvious (current state): there is **no audible/haptic signal at the planned duration yet** — that is Phase 1. For now the timer just counts; the coach stops manually.

## MT-02-4: Completion share to Signal/AirDrop
**Steps:** Complete a running session → the system **Share** sheet appears.
**Expected:** A text summary (game names + actual durations) is shareable to Signal/AirDrop/etc.

## MT-02-5: Persistence
**Steps:** Complete a session, fully close the app, reopen.
**Expected:** The completed session shows under "Completed Sessions" (Sessions tab) and "Recent Sessions" (Dashboard).
