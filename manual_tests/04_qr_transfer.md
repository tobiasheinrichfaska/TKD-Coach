# 04 — QR Data Transfer (two phones)

Syncs data between two coaches' phones via QR codes. **Needs two devices** (Phone A = sender, Phone B = receiver) both running the app. No internet/back-channel — Phone B's camera scans Phone A's screen.

## MT-04-1: Full sender → receiver round-trip
**Preconditions:** Phone A has some data (a group + athletes) that Phone B does not. Both on the **Transfer** tab.
**Steps:**
1. **Phone A:** Transfer → **Start Transfer Sender** → on **Select Data**, tick categories (e.g. Groups + Athletes) → confirm. A **handshake QR** appears.
2. **Phone B:** Transfer → **Start Transfer Receiver** → grant camera permission if asked → point at Phone A's handshake QR.
3. **Phone A:** tap **Receiver Scanned → Start Transfer**. The first **chunk QR** appears with "Chunk 1 of N".
4. **Phone A:** hold the QR to Phone B's camera; when scanned, tap **Next**. Repeat for every chunk. Use **Previous** if Phone B missed one. On the last chunk the button reads **Finish**.
5. **Phone B:** after it has all N chunks it auto-assembles and shows the **Review Transfer** screen.

**Expected:**
- Phone B's overlay counts "Received: X/N chunks" as it scans.
- Review screen lists **New (green) / Updated (amber) / Unchanged (grey)** counts.
- **Phone A advances chunks manually** — there is **no automatic ACK**; Next/Previous are always available (this is the corrected behaviour; the button is not stuck/disabled).

## MT-04-2: Accept & merge
**Steps:** On Phone B's Review screen, tap **Accept & Merge**.
**Expected:** Shows "Import Complete"; the new groups/athletes now appear in Phone B's **Groups** tab. Re-running a transfer of the *same* data shows everything as **Unchanged**; editing an item on A then re-sending shows it as **Updated** and the edit is applied on B (not duplicated).

## MT-04-3: Reject
**Steps:** On Review, tap **Reject**.
**Expected:** Returns to scanning without changing Phone B's data.

## MT-04-4: Stop / cancel
**Steps:** Tap **Stop** (receiver) or **Cancel Transfer** (sender) mid-transfer.
**Expected:** Returns to the Transfer screen cleanly; no partial data is merged.
> Not obvious: games are always included in a sync (the built-in library), regardless of the category ticks.
