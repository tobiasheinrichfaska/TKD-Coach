# Übungen

Every atomic training unit lives here — there is **one** content type (Übung) with a `kind`. See [STRUCTURE.md](../STRUCTURE.md) for the full schema, ID scheme, and app mapping.

| Folder | `kind` | What | ID prefix |
|---|---|---|---|
| [`neuro-game/`](neuro-game/) | `neuro-game` | Neuro-stimulus games embedded in TKD technique (the former W/M/C "games") | `W`/`M`/`C` |
| [`technik/`](technik/) | `technik` | Technique drills broken step-by-step ("Yop-Chagi in pieces") | `T-` |
| [`dehnung/`](dehnung/) | `dehnung` | Stretches / mobility, tagged to joints & muscles | `D-` |
| [`kondition/`](kondition/) | `kondition` | Conditioning / footwork drills | `K-` |

Each file = YAML frontmatter (machine-readable: id, kind, phase, minutes, ageGroup, `techniques[]`, `bodyParts[]`, …) + a human-readable body. The app seeds its data model from these (Phase 2).

## Neuro-game index

| ID | Title | Phase | Time | Age | Neuro-Target |
|---|---|---|---|---|---|
| [W1](neuro-game/W1-farben-chagi.md) | Farben-Chagi | warmup | 7 | all | Visual-Motor Coupling |
| [W2](neuro-game/W2-spiegel-stand.md) | Spiegel-Stand | warmup | 5 | all | Visual + Proprioceptive |
| [W3](neuro-game/W3-leiter-stand-exit.md) | Leiter-Stand-Exit | warmup | 8 | all | Proprioceptive + Motor Chaining |
| [M1](neuro-game/M1-zahlen-kombi.md) | Zahlen-Kombi | main | 11 | all | Working Memory + Sequencing |
| [M2](neuro-game/M2-vestibular-dollyo.md) | Vestibular Dollyo | main | 12 | youth-adults | Vestibular Recalibration |
| [M3](neuro-game/M3-einbein-poomsae.md) | Einbein-Poomsae | main | 12 | all | Proprioceptive + Vestibular |
| [M4](neuro-game/M4-poomsae-unter-stoerung.md) | Poomsae unter Störung | main | 18 | all | Attentional Filtering |
| [M5](neuro-game/M5-reaktions-zahl-kreis.md) | Reaktions-Zahl-Kreis | main | 8 | all | Auditory Reaction + Attention |
| [M6](neuro-game/M6-vestibularer-gangpfad.md) | Vestibularer Gangpfad | main | 10 | all | Vestibular + Gaze Stability |
| [C1](neuro-game/C1-balance-hold.md) | Balance-Hold Challenge | cooldown | 8 | all | Proprioceptive Baseline |
| [C2](neuro-game/C2-atem-augen-fokus.md) | Atem-Augen-Fokus | cooldown | 9 | all | Parasympathetic + Gaze |

**Non-TKD movements** (flagged ⚠ in their files, justified): M2 rotation · M6 walking circuit · C2 breathing protocol.

## Core rule
The neuro-stimulus is built *into* real Taekwondo movement — never compromise technique for the neuro-element. Non-TKD movements are flagged explicitly.
