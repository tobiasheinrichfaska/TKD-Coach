# Trainingsplan → Werkseinstellung — claude.ai Authoring Prompt

Paste the prompt below into **claude.ai**, fill in the `<<REQUEST>>` block, and send.
claude.ai returns **one JSON object** describing a Trainingsplan. Hand that JSON back to
**Claude Code** in this repo and say *"seed this Trainingsplan as a Werkseinstellung"* —
Claude Code will match each exercise to an existing built-in Übung or mint a new
`GameDefinition`, add the `SessionTemplate` to `SESSION_TEMPLATES` + `BUILTIN_TEMPLATES`,
keep the technique/body-part catalogs referentially intact, update the catalog-integrity
tests + `docs/data-model.html`, and run the suite.

> Why JSON and not finished TypeScript: claude.ai describes the plan **by intent**
> (phase, duration, focus, technique/body-part tags). Claude Code owns the repo and turns
> that intent into seed-correct constants — reusing ids where one already fits, only
> creating new entries when nothing matches. This keeps ids and referential integrity
> under the code's control, not guessed by the web model.

The seed target is the factory data that `migrate()` seeds **once on a fresh install**
(see [`../src/domain/migration.ts`](../src/domain/migration.ts)): `BUILTIN_GAMES`,
`SESSION_TEMPLATES`/`BUILTIN_TEMPLATES`, and the `bodyParts`/`techniques`/`metricSchemas`
catalogs.

---

## The prompt (copy everything below the line)

---

You are a Taekwondo **neuro-athletic training** expert *and* a precise data formatter.
Design one training session ("Trainingsplan") for the **TKD-Coach** app and return it as a
single JSON object that conforms exactly to the schema and controlled vocabularies below.
Output **only** the JSON in one ```json code block — no prose before or after.

### My request

```
<<REQUEST>>
Age group:        kids (8–13) | youth & adults | mixed/all      ← pick one
Session length:   e.g. 90 min
Belt / level:     e.g. colour belts up to Kup-5
Focus this time:  e.g. roundhouse-kick power + vestibular balance after spins
Constraints:      e.g. small hall, no equipment, 12 athletes
Notes:            anything else
<<END REQUEST>>
```

### The 5-phase protocol (every plan follows this order)

| Phase | Meaning | Typical content |
|---|---|---|
| 1 | Warm-Up · Mobility | joint prep (ankle/knee/hip circles, spinal flow) |
| 2 | Warm-Up · Dynamic | leg swings, footwork, **neuro warm-up games** |
| 3 | Main | the neuro-athletic main drills (combos, balance-after-spin, poomsae under load) |
| 4 | Cool-Down · Static | static stretches, balance hold |
| 5 | Meditation | breathing / parasympathetic down-regulation |

A plan need not use every phase, but the phases it uses must be in ascending order and the
total of all `durationMin` should land within ±10 % of the requested session length.

### Output schema

```jsonc
{
  "trainingsplan": {
    "name": "string — German, e.g. 'Kinder · Kick-Fokus'",
    "ageGroup": "kids" | "youth-adults" | "all",
    "description": "string — one German sentence, what this session trains",
    "exercises": [                       // ORDERED; phase ascending
      {
        "phase": 1,                      // 1..5, see protocol table
        "durationMin": 7,                // integer minutes
        // EITHER reuse an existing built-in Übung by id …
        "reuseId": "W1",                 // optional; an id from "Existing Übungen" below
        // … OR (omit reuseId and) define a new exercise:
        "name": "string — German",       // required when no reuseId
        "shortName": "string — ≤10 chars",
        "ageGroup": "all" | "youth-adults",
        "focus": "free German text — the neuro/physio intent",
        "techniques": ["ap-chagi"],      // ids from the Technique vocab (or [] )
        "bodyParts": ["hip","balance"],  // ids from the BodyPart vocab (≥1)
        "metric": null,                  // null OR one of the 6 metric ids below
        "description": "string — German, 1 sentence"
      }
    ]
  }
}
```

Rules:
- Prefer `reuseId` whenever an existing Übung already fits the intent — only define a new
  exercise when nothing in the list matches.
- For a **new** exercise, every `techniques` and `bodyParts` entry **must** be an id from
  the vocabularies below. If you need a concept that has no id, put it in `focus`/
  `description` as prose and tag the closest existing ids — **do not invent ids**.
- `metric` may **only** be `null` or one of the six metric ids listed — these are the only
  trackable assessment metrics the app compiles in. Never invent a new metric id.
- All human-facing strings (`name`, `shortName`, `focus`, `description`) in **German**.

### Controlled vocabularies

**Metric ids** (`metric`, or `null`): `balance_hold`, `reaction_errors`, `combo_accuracy`,
`vestibular_landing`, `balance_poomsae`, `poomsae_distraction`.

**BodyPart ids** (anatomical + neuro abilities):
`ankle, calves, knee, hamstrings, quads, adductors, hip, hip-flexors, glutes, core, spine,
shoulders, arms, neck, wrist, feet, lower-back, obliques, hip-rotators, it-band, achilles,
full-body, vestibular, visual, proprioception, reaction, coordination, balance,
working-memory, attention, gaze-stability, recovery`

**Technique ids:**
`ap-chagi, dollyo-chagi, yop-chagi, dwit-chagi, naeryo-chagi, bandal-chagi, huryeo-chagi,
dwit-huryeo-chagi, momdollyo-chagi, twio-chagi, ap-seogi, juchum-seogi, seogi, ap-kubi,
dwit-kubi, beom-seogi, makki, arae-makki, momtong-makki, olgul-makki, sonnal-makki, an-makki,
bakkat-makki, batangson-makki, jireugi, sonnal-chigi, palkup-chigi, dung-jumeok, poomsae,
footwork, taegeuk-1, taegeuk-2, taegeuk-3, taegeuk-4, taegeuk-5, taegeuk-6, taegeuk-7,
taegeuk-8, koryo, keumgang, taebaek, pyongwon, sipjin, jitae, cheonkwon, hansu, ilyeo`

**Existing Übungen** (use these ids in `reuseId`):

| id | name | phase | logs metric |
|---|---|---|---|
| `W1` | Farben-Chagi | 2 | reaction_errors |
| `W2` | Spiegel-Stand | 2 | — |
| `W3` | Leiter-Stand-Exit | 2 | — |
| `M1` | Zahlen-Kombi | 3 | combo_accuracy |
| `M2` | Vestibular Dollyo (youth-adults) | 3 | vestibular_landing |
| `M3` | Einbein-Poomsae | 3 | balance_poomsae |
| `M4` | Poomsae unter Störung | 3 | poomsae_distraction |
| `M5` | Reaktions-Zahl-Kreis | 3 | — |
| `M6` | Vestibularer Gangpfad | 3 | — |
| `C1` | Balance-Halten Challenge | 4 | balance_hold |
| `C2` | Atem-Augen-Fokus | 5 | — |
| `C3` | Atem-Fokus / Meditation | 5 | — |
| `K-ankle-circles` | Sprunggelenk-Kreise | 1 | — |
| `K-knee-circles` | Knie-Kreise | 1 | — |
| `K-hip-cars` | Hüft-CARs | 1 | — |
| `K-scorpion` | Skorpion | 1 | — |
| `K-spinal-flow` | Wirbelsäulen-Flow | 1 | — |
| `K-leg-swings-fb` | Beinschwünge vor/zurück | 2 | — |
| `K-leg-swings-lat` | Beinschwünge seitlich | 2 | — |
| `K-march-knee-heel` | Knie-zur-Brust + Ferse-zum-Gesäß | 2 | — |
| `K-footwork-skip` | Beinarbeit / Hüpfen | 2 | — |
| `K-neck-refocus` | Nacken-Rotation + Refokus | 2 | — |
| `K-single-leg-balance` | Einbein-Balance | 2 | — |
| `D-standing-forward-fold` | Stehende Vorbeuge | 4 | — |
| `D-seated-forward-fold` | Sitzende Vorbeuge | 4 | — |
| `D-hip-flexor-lunge` | Hüftbeuger-Ausfallschritt | 4 | — |
| `D-straddle-pancake` | Grätsche / Pancake | 4 | — |
| `D-butterfly` | Schmetterling | 4 | — |
| `D-downward-dog` | Herabschauender Hund | 4 | — |

### Example (shape only — kids kick-focus, abbreviated)

```json
{
  "trainingsplan": {
    "name": "Kinder · Kick-Fokus",
    "ageGroup": "kids",
    "description": "Aufwärmen, Roundhouse-Schwerpunkt im Hauptteil, Balance- und Atem-Cool-down.",
    "exercises": [
      { "phase": 1, "durationMin": 2, "reuseId": "K-hip-cars" },
      { "phase": 2, "durationMin": 7, "reuseId": "W1" },
      { "phase": 3, "durationMin": 11, "reuseId": "M1" },
      {
        "phase": 3, "durationMin": 10,
        "name": "Bandal-Tornado-Stationen", "shortName": "Bandal", "ageGroup": "all",
        "focus": "Schnellkraft im Bandal Chagi unter Richtungswechsel",
        "techniques": ["bandal-chagi", "dollyo-chagi"],
        "bodyParts": ["hip", "knee", "coordination", "balance"],
        "metric": null,
        "description": "Stationswechsel mit Bandal/Dollyo-Kombinationen auf Kommando."
      },
      { "phase": 4, "durationMin": 8, "reuseId": "C1" },
      { "phase": 5, "durationMin": 5, "reuseId": "C3" }
    ]
  }
}
```

---

## How Claude Code seeds the returned JSON (reference — what happens here)

When you paste the JSON back into Claude Code:

1. **Resolve exercises.** For each entry with `reuseId`, verify the id exists in
   `BUILTIN_GAMES`. For each new exercise, assign a stable id (e.g. `M7`, or a kebab id
   for protocol-style drills), validate every `techniques`/`bodyParts` id against the
   catalogs, and confirm `logMetricType` is one of the six compiled types (or omitted).
2. **Add missing catalog entries** only if unavoidable — a new technique/body-part needs a
   real entry in `techniques.ts`/`bodyparts.ts`; a brand-new metric additionally needs a
   `types/index.ts` union change (flagged, not silently added).
3. **Append new `GameDefinition`s** to `BUILTIN_GAMES` (`isBuiltIn: true`).
4. **Add the template:** a new `SESSION_TEMPLATES.<KEY>` ordered id array + a
   `BUILTIN_TEMPLATES` entry (`id`, `name`, `ageGroup`, `itemIds`, `isBuiltIn: true`,
   `description`).
5. **Guard rails:** update/extend the catalog-integrity + templates tests so every new id
   resolves, refresh the **Factory defaults** section of `docs/data-model.html`, then run
   `npm test`.

Because seeding is **seed-once when empty**, the new plan ships to fresh installs; existing
users adopt it by tapping **Werkseinstellung** (factory reset) on the *Other Data* hub.
