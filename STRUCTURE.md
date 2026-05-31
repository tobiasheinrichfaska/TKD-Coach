# Content Structure

The human-authored **source of truth** for the app. Plain markdown + YAML frontmatter, committed to git (so nothing is lost). The Expo app seeds its data model from these files (see [`plan_features_2026-06.md`](plan_features_2026-06.md) Phase 2).

## The four content types

```
uebungen/            ÜBUNG — every atomic training unit (one "exercise"). Games are Übungen too.
  neuro-game/        kind: neuro-game  (the W/M/C neuro-stimulus games)
  technik/           kind: technik     (technique drills, broken step-by-step — "Yop-Chagi in pieces")
  dehnung/           kind: dehnung     (stretches, tagged to joints/muscles)
  kondition/         kind: kondition   (conditioning / footwork drills)
session-templates/   reusable blueprints — an ordered block sequence of Übungen with timings
sessions/            concrete sessions — a template instantiated for a group + date (what you run)
```

> **Decision (2026-05-31):** "Übungen replace Games" — there is **one** content type (Übung) with a `kind` field. The former neuro-games are Übungen with `kind: neuro-game`. This keeps a single authoring model for games, technique drills, stretches and conditioning.

## ID scheme

Stable, unique, used for cross-references and as the app entity id. Filename = `<ID>-<kebab-title>.md`.

| kind | prefix | example |
|---|---|---|
| neuro-game | `W`/`M`/`C` (phase-based, legacy) | `W1`, `M3`, `C1` |
| technik | `T-` | `T-yop-chagi` |
| dehnung | `D-` | `D-hamstring` |
| kondition | `K-` | `K-leiter-fast` |
| session-template | `ST-` | `ST-kids-2h` |
| session | `S-` | `S-2026-06-03-kids-mo` |

## Übung frontmatter

```yaml
---
id: W1
title: Farben-Chagi
kind: neuro-game            # neuro-game | technik | dehnung | kondition
phase: warmup               # warmup | main | cooldown  (placement; required for neuro-game)
minutes: 7                  # default duration
ageGroup: all               # all | kids | youth-adults
neuroTarget: Visual-Motor Coupling   # neuro-games only
techniques: [ap-chagi, dollyo-chagi, yop-chagi]   # technique ids trained (kebab)
bodyParts: [hip, knee, ankle]        # joints/muscles loaded (Phase 2 anatomy)
logMetric: reaction_errors           # optional — assessment metric key, else omit
hasSteps: false             # technik drills set true and provide an ordered "## Steps" section
---
```
Body = the human-readable content (Neuro-Target / Technique / Setup / How to Play / Variations / Log Metric / Why It Works for games; for `technik` an ordered **## Steps** section).

## Session template frontmatter

```yaml
---
id: ST-kids-2h
title: "Kids 8–13 · 2h"
ageGroup: kids
durationMinutes: 90
items:                      # ordered; each refs an Übung id (+ optional minutes override)
  - { ref: W1, minutes: 8 }
  - { ref: W3, minutes: 8 }
  - { ref: M1, minutes: 12 }
---
```
`items` is the machine-readable sequence the app parses; the body keeps the readable block table + coaching notes.

## Session frontmatter

```yaml
---
id: S-2026-06-03-kids-mo
date: 2026-06-03
group: Kids Montag
template: ST-kids-2h         # the template it was built from (or omit if ad-hoc)
coaches: [tobias]
---
```
A session is a template instantiated for a real group/date. Actual run data (per-game durations, attendance) is captured by the app at runtime; this file is the plan/record + notes.

## Cross-references

- Use the **id** in frontmatter (`techniques:`, `items: ref:`) for machine links.
- Use relative markdown links in prose for humans, e.g. `[W1 · Farben-Chagi](../uebungen/neuro-game/W1-farben-chagi.md)`.

## App mapping (Phase 2)

| content | app entity |
|---|---|
| Übung `kind: neuro-game` | `GameDefinition` |
| Übung `kind: technik` (+ Steps) | `Technique` (+ `TechniqueStep[]`) |
| Übung `kind: dehnung` | `Stretch` |
| `techniques:` / `bodyParts:` tags | technique/body-part links + heatmap coverage |
| session-template | `SessionPlan` template / `Block` |
| session | `SessionPlan` / `SessionLog` |

Adding a new content file therefore feeds both the per-step activity data and the templates automatically.
