# 03 — Assessment & Progress

## MT-03-1: Log an assessment (C1 Balance Hold)
**Preconditions:** A group with an athlete exists.
**Steps:**
1. **Assessment** tab → step through the wizard: pick **group → athlete → game**.
2. Choose **C1 Balance-Hold Challenge**.
3. Enter the metric (seconds, dominant / non-dominant). Save.

**Expected:** The assessment is recorded; returns to the wizard/list without error.
> Not obvious: only some games show a metric form. C1 (balance hold), M1 (combo accuracy) and reaction-error games have forms; a few game types currently show "No metric form for this game" — that's a known gap.

## MT-03-2: Progress history with deltas
**Preconditions:** The same athlete + game logged **at least twice** with different values.
**Steps:**
1. Open the athlete (Groups → athlete → **Progress**), or Assessment → Progress.
2. View the history for that game.

**Expected:** Entries are grouped by game, newest first, each showing the change vs the previous entry — **green for improvement, amber for regression**.
> Not obvious: the colour reflects *direction of change*, and for some metrics "lower is better" (e.g. error counts) — confirm an improvement (fewer errors / longer hold) shows green.

## MT-03-3: combo_accuracy entry validity (regression guard)
**Steps:** Log an M1 combo-accuracy assessment; fill **both** Correct and Total before saving.
**Expected:** Saves a valid entry. 
> Not obvious: filling only one of the two fields can persist an incomplete metric — fill both.

## MT-03-4: Share a progress summary
**Steps:** From Progress, tap the share action.
**Expected:** System Share sheet with a text summary (athlete + belt + metric values + deltas) for sending to a parent/athlete.
