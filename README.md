# TKD-Coach: Neuroathletik × Taekwondo

**Coaching methods, games and background on coaching Taekwondo through neural system training**

This is a complete, ready-to-use library of 11 neuro-stimulus games embedded in authentic Taekwondo technique. Designed for Breitensport coaches in Germany working with kids (8–13), youth, and adults in 2-hour and 1.5-hour weekly sessions.

---

## Core Principle

**The neuro-stimulus is built *into* real Taekwondo movement — not added alongside it.**

- Technique is never compromised for the neuro-element
- All games use correct TKD form, stances, and kicks
- If a non-TKD movement is required, it is flagged explicitly with a ⚠ and justified scientifically
- The goal is better Taekwondo athletes, not laboratory subjects

---

## Who This Is For

- **Breitensport coaches** in Germany running mixed-age Taekwondo sessions
- **Kids 8–13:** 2-hour weekly sessions (71 min core games + buffer)
- **Youth & Adults:** 1.5-hour sessions (90 min, higher intensity)
- Coaches with **no access to expensive vestibular equipment** — all games use cones, pads, mats, ladders (standard training gear)
- Programs that treat **balance, reaction speed, and sequence memory as trainable skills**, not innate talent

---

## How This Repo Is Organized

### [`games/`](games/) — The Game Library

11 games organized by session phase:

- **`warmup/`** (3 games): Activate nervous system, establish visual-motor coupling, prime stances/footwork
  - W1 Farben-Chagi (color-kick visual cueing)
  - W2 Spiegel-Stand (mirror stance + proprioceptive mirroring)
  - W3 Leiter-Stand-Exit (coordination ladder → stance exits)

- **`main/`** (6 games): Technique under neuro-load; working memory, vestibular, proprioceptive challenge
  - M1 Zahlen-Kombi (working memory → kick combo sequencing)
  - M2 Vestibular Dollyo (post-rotation balance → full kick) ⚠ *youth/adults only*
  - M3 Einbein-Poomsae (single-leg Poomsae arm sequences)
  - M4 Poomsae unter Störung (motor persistence under visual distraction)
  - M5 Reaktions-Zahl-Kreis (auditory cue → block selection; group re-engagement)
  - M6 Vestibularer Gangpfad (gaze-fixed directional walk → VOR training) ⚠ *non-TKD movement*

- **`cooldown/`** (2 games): Parasympathetic activation, proprioceptive consolidation, metric capture
  - C1 Balance-Hold Challenge (timed single-leg hold — *primary tracking metric*)
  - C2 Atem-Augen-Fokus (breathing + gaze parasympathetic protocol) ⚠ *non-TKD breathing*

**Each game file contains:**
- Neuro-target (what nervous system capacity is trained)
- Taekwondo Technique (the TKD movements, with form-preservation notes)
- TKD Link (how it transfers to sparring, Poomsae, technique)
- Setup & How to Play (step-by-step)
- Variations (easier/harder progressions)
- Log Metric (what to measure)
- Why It Works Neurologically (the science)

See [`games/README.md`](games/README.md) for the complete index.

### [`sessions/`](sessions/) — Ready-to-Run Session Templates

- **[`kids-2h.md`](sessions/kids-2h.md):** Ages 8–13, 2-hour session (W1, W3, M1, M3, W2, M4, C1, C2)
- **[`youth-adult-1h30.md`](sessions/youth-adult-1h30.md):** Youth & Adults, 1.5-hour session (W3, W1, M2, M3, W2, M4, C1, C2)

Each template:
- Lists games in order with timing
- Links to each game file
- Notes on progression, group dynamics, and energy management
- Substitution rules (e.g., M2 is youth/adults only; use M3 for kids instead)

### [`assessment/`](assessment/) — Tracking & Progress

- **[`system.md`](assessment/system.md):** The full assessment framework
  - In-game metrics (which game measures what)
  - Group/team formats (relay races, team totals, tournaments)
  - Retest rhythm (C1 every 4–6 weeks — the primary metric)
  - What "better" looks like (observable signs of neuro-progress in TKD terms)

- **[`log-template.md`](assessment/log-template.md):** Quick log table (name, date, balance time, combo%, notes)
  - Copy to your coaching notebook or phone
  - ~30 seconds per session to fill
  - 4–6 week retest reminder

### [`_source/`](_source/) — Source Provenance

The two original source files that generated this scaffold:
- `Games_20260530.md` — v1.1 Coach Reference (primary source)
- `20260530_02.md` — v1 log (secondary cross-check)

These are archived here for reference and provenance. The repo content is the definitive version.

---

## Standing Constraints & Design Principles

**No expensive gear required:**
- Cones, A4 paper, pads, kick shields, coordination ladder (or tape on floor), yoga mat
- All games run in a standard dojo or gym space with 3–5m working room per person

**Warm-up / Main / Cool-down structure is fixed:**
- Always start with warm-up (visual-motor + proprioceptive priming)
- Run main-block games in sequence (working memory, vestibular, proprioceptive load)
- Always end with cool-down (C1 balance baseline, C2 parasympathetic reset)

**Mixed-ability adaptable:**
- Every game has easier (↓) and harder (↑) variations
- Run the same game with multiple difficulty levels in the same session (pairs/groups)
- Form is never negotiable — athletes must execute correct technique before speed/neuro-challenge counts

**Correct TKD technique is non-negotiable:**
- If an athlete is losing form to speed, reduce the neuro-load
- The game is only valid if the technique is preserved
- "Fast and sloppy" does not equal "trained"

---

## Getting Started

1. **Pick a session template** → [`sessions/kids-2h.md`](sessions/kids-2h.md) or [`sessions/youth-adult-1h30.md`](sessions/youth-adult-1h30.md)

2. **Read the game files** for the games in your session → [`games/`](games/)
   - Each file is stand-alone and takes ~2–3 minutes to read

3. **Set up equipment** (cones, pads, ladder) before the session

4. **Run the session** in the warm-up → main → cool-down order

5. **Log metrics** using [`assessment/log-template.md`](assessment/log-template.md) — takes 30 seconds per session

6. **Retest C1 Balance Hold every 4–6 weeks** to track neuro-adaptation

See [`assessment/system.md`](assessment/system.md) for full guidance on tracking and retest rhythm.

---

## Open Tasks & Future Expansion

- [ ] Expand game library (sport-specific: spinning kicks, advanced blocking combinations)
- [ ] Create printable session cards (QR-code linked to game files, one-page formats for coaches)
- [ ] Parent/student progress reporting (how to communicate neuro-training benefits to families)
- [ ] Poomsae-specific neuro sequences (supplement Poomsae training with vestibular/proprioceptive sequences)
- [ ] Video demonstrations (1–2 min clips for each game, YouTube/repo link)

---

## Why This Approach Works

### For Kids (8–13)
- Games feel like play, not testing
- Color-naming, peer energy, and competitive framing create natural engagement
- Visible improvement in balance and reaction speed over 6 weeks builds confidence
- Correct technique reinforcement happens without "technique lectures"

### For Youth & Adults
- Neuro-training frames as elite performance protocol, not remedial work
- Fast feedback (metrics, retest cycles) shows adaptation is real
- Transfer to sparring and grading anxiety reduction is observable within 4 weeks
- Competitive and team formats maintain engagement through challenging drills

### Neurobiologically
- The games target specific neural pathways (vestibular, proprioceptive, auditory-motor, attentional filtering, motor memory consolidation)
- Progression from visual-motor cueing (W1) → proprioceptive overload (M3) → attentional filtering (M4) → parasympathetic recovery (C2) matches how the nervous system learns and consolidates under training
- Retest metrics (C1 balance hold) are sensitive to real neural adaptation — improvement is genuine neuro-progress, not just technique polish

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for how to add new games and expand the library.

---

## License

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

This project is licensed under the **GNU Affero General Public License v3.0** (AGPLv3).
You are free to use, modify, and distribute this software under the terms of the AGPLv3.
If you use this software to provide a network service, you must make the full source code
of your modifications available to users of that service.

**Commercial License:** If you wish to use this software in a closed-source or proprietary
product, a commercial license is available. Contact: tobias.a.w.heinrich@gmail.com

See [LICENSE](LICENSE) for the full AGPLv3 text.
See [LICENSE_COMMERCIAL.md](LICENSE_COMMERCIAL.md) for commercial licensing terms.

---

**TKD-Coach v1.1** · *Neuroathletik × Taekwondo Breitensport* · *Adapt freely*

Provenance: Games_20260530.md (v1.1 Coach Reference) + 20260530_02.md (v1 log)
