# Manual Tests — TKD-Coach

Step-by-step checks a **non-developer** can run by hand to confirm the Expo app works. Complements (does not replace) any automated tests. Covers what only a person at the screen can confirm: navigation, timers firing, share sheets, two-phone QR sync.

## Setup

1. Install **Expo Go** (SDK 54) on a phone (iOS or Android).
2. On the dev machine, start the app:
   ```
   cd c:\skripte\public\TKD-Coach\packages\native
   npm start
   ```
   (Runs Metro on port **8082** with `--clear`.)
3. In Expo Go, open: `exp://<MACHINE-IP>:8082` (e.g. `exp://10.11.100.239:8082`). Use the **full machine IP**, not `localhost`.
4. The app opens on the **Dashboard** tab. Five bottom tabs: **Dashboard · Sessions · Humans · Other Data · Transfer**. *Humans* and *Other Data* open a hub menu; Assessment lives under *Humans*.

> ⚠️ **Dev mode:** `DEV_RESEED` (constants/config.ts) is currently **true** — the app **wipes and reseeds** factory data + a demo dataset (athletes, coach, guardian, groups, a session today, a completed session) on **every** start. Set false to test real persistence. First real launch otherwise seeds the factory catalogs into empty data (persists in AsyncStorage).

## Test files

| File | Area |
|---|---|
| [01_groups_athletes.md](01_groups_athletes.md) | Groups & athletes CRUD, athlete detail, cross-tab "Progress" |
| [02_sessions.md](02_sessions.md) | Planning, running a session, per-game timers + signal, completion share |
| [03_assessment.md](03_assessment.md) | Assessment wizard, progress history + deltas, share |
| [04_qr_transfer.md](04_qr_transfer.md) | Two-phone QR data sync (sender/receiver, manual advance, merge) |
| [05_navigation_otherdata.md](05_navigation_otherdata.md) | Tab layout, Humans hub, Other Data browse + Werkseinstellung reset |

Keep these current: when a user-facing flow changes, update the matching case in the same session.
