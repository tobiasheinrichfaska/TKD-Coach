# Contributing

## How to Add a New Game

This library grows by adding new games that embed neuro-stimulus into authentic TKD technique. Here's how:

### 1. Copy an Existing Game File

Pick a game from the appropriate phase (warmup, main, cooldown) that's closest to what you're creating. Copy it as a template.

### 2. Assign the Next ID

**Warm-up:** W1, W2, W3, W4, ...  
**Main:** M1, M2, M3, M4, M5, M6, M7, ...  
**Cool-down:** C1, C2, C3, ...

Name your file following the pattern: `<PHASE>-<kebab-case-game-name>.md`

Examples: `W4-tempo-chagi.md`, `M7-partner-poomsae-exchange.md`, `C3-partner-balance-hold.md`

### 3. Keep the Full Field Set

Every game file must include (in order):

- **H1 Title:** Game name in Korean/German
- **Tagline:** One-line description (how to read it)
- **Tag Row:** `Phase · Time · Age · Neuro-Category`
- **Neuro-Target:** What nervous system capacity is trained (2–3 sentences)
- **Taekwondo Technique:** The TKD movements involved, with form-preservation statement
- **TKD Link:** How the game transfers to sparring, Poomsae, technique
- **Setup:** Equipment needed and space required
- **How to Play:** Step-by-step instructions
- **Variations:** Easier (↓) and harder (↑) progressions
- **Log Metric:** What to measure and track (if applicable)
- **Why It Works Neurologically:** The science behind the stimulus (3–4 sentences)

### 4. Restate the Core Rule

When proposing a new game, explicitly state:

- **Form is never compromised.** Does the game preserve correct TKD technique?
- **Non-TKD elements are flagged.** Does it include any movements outside TKD? If yes, include ⚠ and justify it (e.g., "non-TKD stimulus is justified because...").
- **The neuro-stimulus is embedded, not external.** The TKD movement itself IS the stimulus; neurofeedback/laser pointers/fancy gear is not required.

### 5. Add a Row to `games/README.md`

Update the index table in [`games/README.md`](games/README.md) with:
- Game name (linked to the new file)
- Phase (Warm-up / Main / Cool-down)
- Time (range, e.g., 8–10 min)
- Age group (All / Youth + Adults only)
- Neuro-Target (category from your game file)

Insert in the correct phase section, in ID order (W1, W2, W3, ... M1, M2, ... C1, C2, ...)

### 6. Test It

Run the game with your group once before submitting. Notes:

- Does form hold under the neuro-load?
- Is the progression (easier → harder) realistic?
- Is the metric easy to track?
- Does the transfer to sparring/Poomsae/technique feel real?

### Example: Adding a New Main-Block Game

Say you want to add a game called "Partner Poomsae Exchange" (M7). Follow these steps:

1. Copy `M4-poomsae-unter-stoerung.md` (similar structure: Poomsae + external load)
2. Rename to `M7-partner-poomsae-exchange.md`
3. Fill in all fields with your new game details
4. Include ⚠ if any non-TKD movement is present; justify it
5. Add to `games/README.md`:
   ```
   | [M7 · Partner Poomsae Exchange](main/M7-partner-poomsae-exchange.md) | Main | 15 min | All | Motor Synchronization |
   ```
6. Test with your athletes
7. Submit

---

## Standards

- **Naming:** German game names, Korean technique terms — keep them as written
- **Formatting:** Use markdown consistently. Tables for variations (↓ Easier / ↑ Harder)
- **Brevity:** 300–400 words per game is the target. Enough detail to coach, not a thesis.
- **Links:** All internal links use relative paths (`../games/main/M1-zahlen-kombi.md`)
- **Form preservation:** Every game must state explicitly whether TKD form is preserved (✓) or compromised. "Compromised" games are rejected — rework until form is defended.

---

## What Makes a Good Game

- ✅ Embeds neuro-stimulus INTO real TKD movement (not added alongside)
- ✅ Preserves correct technique (stances, kicks, blocks, Poomsae)
- ✅ Has clear easier → harder progression
- ✅ Produces a trackable metric (time, count, errors)
- ✅ Transfers visibly to sparring, Poomsae, or grading performance
- ✅ Runs in standard gym with basic equipment (no laser systems, force plates, expensive gear)
- ✅ Neurobiologically justified (references a specific nervous system capacity)

---

## Questions?

Refer to [`games/README.md`](games/README.md) for the core rule and how the library is organized.

See [`assessment/system.md`](assessment/system.md) for how to design a log metric that's easy to track.

---

*Keep the library focused. New games should expand a specific neuro-domain (vestibular, proprioceptive, auditory-motor, working memory, attentional filtering) or serve a specific group (kids, spinning-kick specialists, grading-prep). Games that are "vague neuro benefit" or "just fun movement" are not added.*
