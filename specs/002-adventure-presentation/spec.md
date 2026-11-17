# Feature Specification: Adventure Presentation — Battles, Moves, and the Map of Networklandia

**Feature Branch**: `002-adventure-presentation` (spec directory; work is on `main`)

**Created**: 2026-11-17

**Status**: Draft

**Input**: User description: "The game we made is lame, there is no graphical adventure like in
Adventure Quest. Make this more graphical. This needs to feel like an adventure, with move
selection etc. Make all of the updates that are required."

**Builds on**: [specs/001-ipv4-ticket-diagnosis](../001-ipv4-ticket-diagnosis/spec.md). The
grading rules, content, help, progress, and accessibility requirements of feature 001 are
unchanged. This feature changes **how** the same game is presented and played.

## Pitch

Every ticket becomes a battle:
- NetworkSerf stands on the left of a scene drawn for the current location; the ticket
  monster stands on the right with a health bar.
- The player picks a **move** from a battle menu (each move is one of the round's answers,
  shown with its full diagnosis or path label) and presses **Use move**.
- **Correct move:** it lands, the monster's health drops to zero, and the monster is defeated.
- **Wrong move:** it is **blocked**; the monster stands, and the battle log explains the
  mistake.
- Between levels, a **map of Networklandia** shows the journey: Help Desk Gate → Walled Towns
  → BGP Citadel.
- Each promotion changes how NetworkSerf looks: a headset at T2, a cape at T3, a crown at T4.
- The last ticket in each level is a **boss**, drawn larger and labelled "Boss".

## Clarifications

### Session 2026-11-17

The user asked for the changes to be made without further questions. These decisions were made
from the user's description and the constitution, and are recorded here so they can be
revisited:

- Q: Does the player have health or lives? → A: No. Only the monster has health, as a
  presentation of progress: one correct move defeats it. Wrong moves are blocked at no cost
  (Constitution III).
- Q: What counts as a "move"? → A: Each answer choice is a move with a short move name (for
  example "Lease Lance") **plus** the exact diagnosis label from feature 001, so the move name
  never replaces the networking claim.
- Q: Are hint and solution part of the battle menu? → A: Yes, as items: "Scout's hint" and
  "Sage's scroll". They behave exactly as feature 001's Hint and Show solution.
- Q: What art style? → A: Original hand-drawn inline SVG with CSS animation: no downloaded
  images, fonts, or audio (Constitution scope).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Battle each ticket by choosing a move (Priority: P1)

As a learner, I face each ticket as a monster, choose a move, and see it land or get blocked,
so answering feels like an adventure while I still learn from the explanation.

**Why this priority**: This is the change the user asked for; every round uses it.

**Independent Test**: Start Level 1. Then:
1. The battle scene shows NetworkSerf, The Lonely Link Imp, and its health bar.
2. Choose the move "All-Clear Ward" and use it: the scene says it was blocked, the health
   bar stays full, and the battle log explains the mistake.
3. Choose "Lease Lance" and use it: the monster is defeated, its health shows 0, and Next is
   enabled.

**Acceptance Scenarios**:

1. **Given** any round, **When** it opens, **Then** a battle scene shows NetworkSerf (drawn for
   the current rank), the round's monster with its name and a full health bar, and a scene
   background for the current level.
2. **Given** the battle menu, **Then** every answer choice is shown as a move with a move name
   and the exact diagnosis or path label, and the player can select exactly one.
3. **Given** a selected wrong move, **When** the player uses it, **Then** the scene shows
   "Blocked!", the monster's health stays full, the battle caption says the move was blocked,
   and the feedback from feature 001 appears in the battle log.
4. **Given** a selected correct move, **When** the player uses it, **Then** the scene shows the
   hit, the monster's health becomes 0, it is shown defeated, the caption says so, and Next is
   enabled.
5. **Given** no move is selected, **When** the player uses a move, **Then** the caption and
   log ask them to choose a move first, and nothing is counted.
6. **Given** the final round of a level, **Then** its monster is labelled "Boss" and drawn
   larger.

---

### User Story 2 - Journey across the map of Networklandia (Priority: P2)

As a learner, I see where I am on my journey and how far my hero has come, so promotions feel
earned.

**Why this priority**: It adds the sense of adventure between battles, but each battle works
without it.

**Independent Test**: Play the whole game. Each briefing shows the map with the current
location marked "You are here" and earlier ones marked "Cleared". Each level summary shows the
hero in their new rank's gear. The session summary shows the completed map and the crowned
hero.

**Acceptance Scenarios**:

1. **Given** a level briefing, **Then** a map shows all three locations in order, marking each
   as cleared, current ("You are here"), or locked, with a text list giving the same
   information.
2. **Given** a level is completed, **When** its summary shows, **Then** NetworkSerf is drawn in
   the gear of the new rank, beside the promotion text.
3. **Given** the session summary, **Then** the map shows every location cleared and NetworkSerf
   wears the T4 crown.
4. **Given** the player's rank changes, **Then** the header portrait and the battle hero both
   use the new rank's gear.

---

### User Story 3 - The adventure stays accessible (Priority: P1)

As a keyboard or screen-reader user, or someone who prefers reduced motion, I can play the
adventure without losing any information.

**Why this priority**: Accessibility is non-negotiable (Constitution IV).

**Independent Test**: Complete the game keyboard-only with reduced motion on, and with a
screen reader confirm that every outcome is announced in text.

**Acceptance Scenarios**:

1. **Given** any battle, **Then** characters, scenery, and effects are decorative (hidden from
   assistive technology), and a visible caption states who is fighting, the monster's health,
   and the last outcome.
2. **Given** reduced motion is on, **When** a move is used, **Then** no animation plays, and
   the outcome, caption, and log appear immediately.
3. **Given** the battle menu, **Then** it is a single radio group with a legend, moves are
   chosen with the arrow keys, and Use move, Scout's hint, Sage's scroll, and Next are native
   buttons with visible focus.
4. **Given** a narrow (360 px) window, **Then** the battle scene scales down, the menu stacks
   in one column, and no control is hidden.

### Edge Cases

- **Repaint without a new move:** selecting a different move after a defeat, or reopening help,
  must not replay the hit or block animation. Effects play only once, for a new result.
- **Repeated Use move after victory:** nothing changes (feature 001 FR-011); the monster stays
  defeated.
- **Unknown art or scene ID in content:** this is a content error (`unknown-art`,
  `unknown-scene`), shown before play like any other.
- **Very long move or path labels:** these wrap inside the move button; the layout must not
  overflow.

## Requirements *(mandatory)*

### Functional Requirements

- **AP-001**: Each round MUST be presented as a battle scene. It shows the hero in the current
  rank's gear, the round's monster art and name, the monster's health bar, and the level's
  scene background.
- **AP-002**: Answer choices MUST be presented as moves in a battle menu. Each move shows a
  move name and the exact label from feature 001 (FR-003). Diagnosis move names come from
  content; path moves are named "Follow Path A/B/C".
- **AP-003**: The submit action MUST be labelled **Use move**. Hint and Show solution MUST
  appear as the items **Scout's hint** and **Sage's scroll**, with feature 001 behaviour
  (FR-010).
- **AP-004**: A correct result MUST show a hit effect, set the monster's health to 0, show the
  monster defeated, and state "defeated" in the caption. An incorrect result MUST show
  "Blocked!", keep the monster's health full, and state "blocked" in the caption.
- **AP-005**: Effects MUST play only when a new result arrives. Repainting for any other reason
  must show the static state.
- **AP-006**: The final round of each level MUST be marked as a boss (content flag `boss`),
  drawn larger and labelled "Boss".
- **AP-007**: Each briefing MUST show the world map with every level's location and status
  (cleared / you are here / locked), plus a text list with the same information.
- **AP-008**: The hero's gear MUST reflect the current rank: T1 tunic; T2 adds a headset;
  T3 adds a cape; T4 adds a crown. The header MUST show a small hero portrait next to the rank.
- **AP-009**: The level summary MUST show the hero in the newly earned gear. The session
  summary MUST show the completed map and the T4 hero.
- **AP-010**: All art MUST be original inline SVG/CSS in project files and hidden from
  assistive technology. Every outcome MUST also be stated in visible text (caption plus
  battle log).
- **AP-011**: With reduced motion on, no animation may run, and outcomes MUST appear
  immediately.
- **AP-012**: Content gains `Diagnosis.move`, `Round.art`, `Round.boss`, and `Level.scene`,
  validated before play. Unknown art or scene IDs are content errors.
- **AP-013**: No player health, lives, timers, points, or XP may be introduced (Constitution
  III; feature 001 FR-018).
- **AP-014**: The presentation MUST NOT decide correctness. Hit or blocked comes only from the
  evaluator result (Constitution I, VI).

### Key Entities

- **Diagnosis** (feature 001) gains `move`: a short move name shown in the battle menu.
- **Round** (feature 001) gains `art` (the monster sprite ID) and `boss` (optional boolean).
- **Level** (feature 001) gains `scene` (the battle background and map location ID).
- **Battle view state** (UI only): the outcome to display (`ready`, `blocked`, `defeated`,
  `need-move`) and whether effects should play (only for a new result).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All feature 001 unit tests still pass, and the automated playthrough passes with
  new checks for battle scenes, moves, hit/blocked outcomes, bosses, the map, and hero gear.
- **SC-002**: Every round shows a distinct monster; each of the three levels shows a distinct
  scene.
- **SC-003**: With reduced motion forced on, a full playthrough shows no animation and loses no
  information.
- **SC-004**: At 360 px and 1280 px widths, the battle scene, move menu, and evidence fit
  without hiding any control.
- **SC-005**: Every new content field is validated, and each new error code fails on a mutated
  copy with exactly that code.

## Assumptions

- No new level, ticket, rule, or networking claim is added; the teaching content from feature
  001 is unchanged apart from the new presentation fields.
- Move names for the three diagnoses: "Lease Lance" (No DHCP lease), "Outer-Gate Strike"
  (gateway outside the subnet), and "All-Clear Ward" (settings valid). They don't hint at the
  correct answer for any particular round.
- Scene and location names: Help Desk Gate (L1), Walled Towns (L2), BGP Citadel (L3).
- Monsters, all original designs:
  - Level 1: The Lonely Link Imp, then The Suspicious Sprite (boss).
  - Level 2: The Half-Wall Goblin, then The Third-Octet Troll (boss).
  - Level 3: The Shortcut Wraith, then The Low-MED Mimic (the BGP Boss).
- No audio (excluded by the constitution's scope).
