# 01 — Groups & Athletes

## MT-01-1: Create a group
**Preconditions:** Fresh app or existing data.
**Steps:**
1. Tap the **Groups** tab.
2. Tap the **+** button (bottom-right).
3. Enter a name (e.g. "Kids Mo"). Tap **Save**.

**Expected:** Returns to the group list; the new group appears with "0 athletes".

## MT-01-2: Add an athlete to a group
**Preconditions:** At least one group (MT-01-1).
**Steps:**
1. **Groups** tab → tap a group → its detail screen ("Athlet" list).
2. Tap the **+** button.
3. Enter a Name and a Belt (free text, e.g. `yellow`). Optionally Phone / Parent Name. Tap **Save**.

**Expected:** Returns to the group; the athlete appears in the list with belt shown. The group's athlete count increases.
> Not obvious: belt is free text right now — any string is accepted and stored as-is.

## MT-01-3: Edit an existing athlete (regression — this was previously broken)
**Preconditions:** A group with an athlete.
**Steps:**
1. **Groups** → group → tap the athlete → **Athlet** detail screen.
2. Tap **Edit**.
3. Change the Name (e.g. add a surname). Tap **Save**.

**Expected:** Returns to the athlete detail; the **changed name is shown**, and it persists after closing/reopening the app.
> Not obvious: editing must actually save. (A past bug made Save silently do nothing in edit mode — this case guards that.)

## MT-01-4: Cross-tab "Progress" jump (regression — cross-tab nav)
**Preconditions:** An athlete exists.
**Steps:**
1. Open an athlete's **Athlet** detail screen.
2. Tap **Progress**.

**Expected:** The app switches to the **Assessment** tab and opens that athlete's **Progress** screen (not a no-op, no crash).
> Not obvious: this navigates *across* tabs. Previously it pointed at a non-existent tab and did nothing.

## MT-01-5: Delete cascade (optional)
**Steps:** Delete a group that has athletes (if a delete affordance is present).
**Expected:** The group's athletes and their assessments are also removed (no orphaned athletes remain in other lists).
