---

description: "Task list for Adventure Presentation"
---

# Tasks: Adventure Presentation — Battles, Moves, and the Map of Networklandia

**Input**: [spec.md](spec.md), [plan.md](plan.md), [data-model.md](data-model.md),
[quickstart.md](quickstart.md); builds on feature 001.

**Tests**: Included. Constitution VII requires every check to be recorded, and SC-001 and
SC-005 need automated coverage.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 Create specs/002-adventure-presentation/checklists/requirements.md and point .specify/feature.json at `specs/002-adventure-presentation`.

## Phase 2: Foundational (content fields and validation)

- [X] T002 [P] Extend tests/fixtures.js `validDoc()` with every new field:
  - data-model.md `Diagnosis.move` and `Level.scene`;
  - data-model.md `Round.art` and `Round.boss` (on each level's second round).
- [X] T003 Add failing content tests to tests/content.test.js for:
  - data-model.md `Round.art`: `unknown-art`;
  - data-model.md `Level.scene`: `unknown-scene`;
  - `Diagnosis.move`: `missing-field`;
  - `Round.boss`: `wrong-type`.
- [X] T004 Extend engine/content.js. Export `ART_IDS` and `SCENE_IDS`, and validate data-model.md `Diagnosis.move`, `Round.art`, `Round.boss`, and `Level.scene`. Make T003 pass.
- [X] T005 Add to data/levels.json:
  - move names for the three diagnoses (spec Assumptions);
  - `art` for all six rounds;
  - `boss: true` on L1R2, L2R2, and L3R2;
  - `scene` for each level.

## Phase 3: User Story 1 - Battle each ticket by choosing a move (P1) 🎯 MVP

**Independent Test**: [quickstart.md](quickstart.md) step 3.

- [X] T006 [P] [US1] Write tests/art.test.js:
  - every `ART_IDS` and `SCENE_IDS` entry renders an `aria-hidden` SVG via ui/art.js;
  - hero gear tiers 1–4 add their pieces cumulatively;
  - an unknown ID throws.
- [X] T007 [US1] Create ui/art.js. Export:
  - `heroSvg(tier)`: a tunic, plus a headset from T2, a cape from T3, and a crown at T4, plus the RJ45 cable sword;
  - `monsterSvg(id)` for the six original monsters;
  - `sceneSvg(id)` for the three backdrops;
  - `MOVE_ICONS`.

  Make T006 pass. Register T006 in tests/index.html.
- [X] T008 [US1] Create ui/battle.js with `buildBattle(s, { fresh })`. It shows:
  - the scene backdrop, the hero at the current tier, the monster with its nameplate, a "Boss" label, and a health bar;
  - an effects layer: a hit spark, "Blocked!", "Defeated!";
  - a visible caption stating the fighters, the monster's health, and the outcome.

  The outcome comes from data-model.md "Battle view state", and the effect classes apply only when `fresh` is true.
- [X] T009 [US1] Rework the round view in ui/render.js:
  - a stage, then the ticket scroll, then the evidence, then the battle menu;
  - each move shows its move name (`Diagnosis.move`, or "Follow Path X") and the exact label;
  - the actions read **Use move**, **Scout's hint**, **Sage's scroll**, and Next. Keep the element IDs used by the tests.
- [X] T010 [US1] Pass `fresh` from ui/controls.js `paint()` (fresh = a new `lastResult` not yet announced) into `buildView`.
- [X] T011 [US1] Style the battle stage, sprites, health bar, move menu, item buttons, and effects in style.css. Keyframes (lunge, hit spark, shake/block, defeat fall, health drain) run only under `prefers-reduced-motion: no-preference`.

## Phase 4: User Story 2 - Journey across the map of Networklandia (P2)

**Independent Test**: [quickstart.md](quickstart.md) step 5.

- [X] T012 [P] [US2] Create ui/map.js with `buildMap(s, { allCleared })`. It returns an SVG map of the three locations (from `Level.scene`) with a path, hero token, and status markers, plus a visible `<ol>` text equivalent ("Cleared", "You are here", "Locked").
- [X] T013 [US2] Update ui/render.js:
  - the briefing shows the map above the briefing text;
  - the level summary shows the hero in the new tier with "Promoted to …";
  - the session summary shows the fully cleared map and the T4 hero.
- [X] T014 [US2] Add a header hero portrait in index.html and ui/controls.js (updated on every paint from the derived rank), and style the map, portrait, and victory scenes in style.css.

## Phase 5: User Story 3 - The adventure stays accessible (P1)

**Independent Test**: [quickstart.md](quickstart.md) steps 6–7.

- [X] T015 [US3] Audit:
  - all art SVGs are `aria-hidden="true"` and `focusable="false"`;
  - the caption is visible text, and the battle log heading is visible;
  - the move menu is one fieldset/legend radio group;
  - every animation sits under `no-preference`;
  - the 360 px layout stacks.

  Fix anything that fails in ui/*.js and style.css.
- [X] T016 [US3] Extend tests/playthrough.html with checks for:
  - the battle scene and monster name;
  - move names alongside the exact labels;
  - the blocked caption with full health;
  - the defeated caption with 0 health;
  - the boss label on R2;
  - the map statuses;
  - the hero tier classes in the header and summary;
  - no replayed effect on a non-fresh repaint.

## Phase 6: Polish

- [X] T017 Run tests/ and tests/playthrough.html headless, capture screenshots at 1280 px and at 360 px with reduced motion and dark mode, and fix any visual problems found.
- [X] T018 Update README.md (pitch, How to play controls, verification table, credits for original art) and record results.
- [X] T019 Mark feature 001's "Experience direction" as delivered by feature 002 in specs/001-ipv4-ticket-diagnosis/tasks.md implementation notes.

## Dependencies

Phase 2 must come before Phase 3, and Phase 3 before Phase 4. US3 (Phase 5) audits the
outputs of Phases 3–4. Polish runs last.
- T006 must be written before T007.
- T003 must be written before T004.
- render.js is edited in T009 and then T013, in that order.

---

## Implementation Notes (2026-11-17)

- **Results:** all 19 tasks done. `tests/`: 102 of 102 pass. `tests/playthrough.html`: 84 of 84 pass,
  including 22 new adventure checks. Screenshots were taken at 1280 px and 360 px, in light and dark
  modes, with forced reduced motion.
- **Visual fixes:** the screenshot review (T017) led to these changes:
  - the stage aspect changed to 16:7 on desktop and 4:3 on phones;
  - the map's hero token moved beside the location instead of over it;
  - the heading focus marker became a quiet underline, because headings are not controls;
  - the ticket label now reads "Ticket carried by …".
- **Extra UI-only state:** `app.lastMove` (in ui/controls.js) remembers the last move used, so the
  caption can name it ("Your All-Clear Ward was blocked!").
- **Still open (human checks):** the keyboard-only playthrough and the human content review from
  feature 001 still apply; see README.md Verification.
