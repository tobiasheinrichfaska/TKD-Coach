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

## MT-01-5: An athlete in several groups (many-to-many membership)
**Preconditions:** At least two groups and one athlete.
**Steps:**
1. **Groups** → open the athlete → **Athlet** detail.
2. Under **Groups**, the current group shows as a red chip. Tap a group under **Add to:**.
3. Repeat to add a second/third group.
4. Tap a red member chip (it ends with **✕**) to remove that membership.

**Expected:** The athlete's group chips update immediately; each affected group's athlete count on the Groups list reflects the add/remove. The same athlete now appears inside every group it belongs to.
> Not obvious: membership is many-to-many now — there is no single "the group" for an athlete. Adding/removing here edits the group's roster, not a field on the athlete.

## MT-01-6: All Athletes + find ungrouped athletes
**Preconditions:** Some athletes exist.
**Steps:**
1. **Groups** tab → tap the **All Athletes** row at the top (shows total, and "N ungrouped" if any).
2. On the list, use the **All** / **Ungrouped** filter tabs.
3. Tap **+** (bottom-right) → create an athlete (Name + Belt) → **Save** (do *not* open it from a group).
4. Back on All Athletes, switch to **Ungrouped**.

**Expected:** Every athlete is listed regardless of group, each with a badge — either "N group(s)" (with the group names) or an amber **Ungrouped** badge. The athlete you just created appears under **Ungrouped**. Tapping a row opens its detail (where you can then add it to groups via MT-01-5).
> Not obvious: this is the only place an athlete that belongs to **no** group can be seen. The full roster is independent of group membership.

## MT-01-7: Deleting a group does NOT delete its athletes (changed behaviour)
**Preconditions:** A group with at least one athlete; ideally that athlete is also in a second group.
**Steps:** Delete a group that has athletes (if a delete affordance is present).
**Expected:** Only the group disappears. Its athletes **remain** — visible under **All Athletes**, and still inside any other groups they belong to. An athlete left in no group shows up under **All Athletes → Ungrouped**.
> Not obvious: this reverses the old cascade. Because an athlete can belong to many groups, removing one group must not delete shared athletes. (Deleting an *athlete*, however, still removes it from every group and deletes its assessments.)
