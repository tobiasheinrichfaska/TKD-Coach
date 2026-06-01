# 05 — Navigation & Other Data

## MT-05-1: Tab layout + Humans hub
**Steps:**
1. Note the five bottom tabs: **Dashboard · Sessions · Humans · Other Data · Transfer**.
2. Tap **Humans**.

**Expected:** A hub with rows **Athletes**, **Groups**, **Emergency contacts & guardians**, **Assessment & progress** (each with a count). Tapping a row opens that list; tapping an athlete → detail; the **Progress** button there still opens the assessment Progress screen (now reached within Humans, not a separate tab).

## MT-05-2: Other Data browse
**Steps:**
1. Tap **Other Data**.
2. Open each row: **Übungen**, **Techniques**, **Body parts & neuro**, **Session templates**, **Metric schemas**.

**Expected:** Each shows the full catalog (read-only for now): games with minutes/phases/tag counts; techniques with Korean + category + body parts; body parts with region + kind (incl. the `neuro` ones); templates with age group + Übung count; metric schemas with their fields.
> Not obvious: these are editable seed-once stores under the hood; per-entry **editing** is the next increment — this screen currently **browses** them.

## MT-05-3: Werkseinstellung (factory reset)
**Preconditions:** Easiest with `DEV_RESEED` **false** (so edits would otherwise persist).
**Steps:**
1. **Other Data** → scroll down → **↺ Werkseinstellung (Kataloge zurücksetzen)**.
2. Read the dialog, tap **Zurücksetzen**.

**Expected:** Games, templates, body parts, techniques and metric schemas are restored to the factory data. **Athletes, groups, sessions and contacts are untouched.** A confirm dialog warns before resetting (catalog edits are lost).
> Not obvious: this is the production counterpart to the dev `DEV_RESEED` wipe — it only re-seeds the five catalogs, never the user's real data.
