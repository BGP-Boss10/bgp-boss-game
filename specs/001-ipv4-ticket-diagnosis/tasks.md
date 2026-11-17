---

description: "Task list for Network-Quest First Playable — IPv4 Tickets and the BGP Boss"
---

# Tasks: Network-Quest First Playable — IPv4 Tickets and the BGP Boss

**Input**: Design documents from `specs/001-ipv4-ticket-diagnosis/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md),
[data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

**Tests**: Included. The spec (SC-001, SC-005) and Constitution I/VII require hand-checked
expected results and a test runner. Within each phase, write the tests first and confirm they
fail before implementing.

**Organization**: Tasks are grouped by user story. The BGP Boss (Level 3) is a separate phase
labelled [US1] because it completes US1 acceptance scenario 4. It sits **after** US2 and before
US3, matching the plan's build order. It is the **cut line**: if time runs short, skip Phase 5
and do T043.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: The user story the task belongs to (US1, US2, US3)
- Paths are relative to the repository root (single static web project, per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Page shell, styles skeleton, test runner, and data skeleton

- [X] T001 Create `engine/`, `ui/`, `data/`, `tests/` and the page shell in index.html: `<header>` with game title, current-rank slot, and Restart button; `<main>` with a `#view` container and a persistent explanation region (`aria-live="polite"`); `<script type="module" src="./main.js">`. Use relative URLs only (research R8).
- [X] T002 [P] Create base styles in style.css: colour tokens, a challenge → controls → explanation layout (side by side on wide screens), `.status-resolved` / `.status-open` classes that pair an icon with text, and an empty `@media (prefers-reduced-motion: reduce)` block.
- [X] T003 [P] Create the minimal test harness in tests/runner.js: `test(id, fn)`, `assertEqual`, `assertDeepEqual`, `assertThrows`, and `run()`, which returns totals plus failed test IDs and reports **failure when zero tests are registered** (research R6).
- [X] T004 Create tests/index.html. It imports tests/runner.js and an explicit list of test modules (`ipv4`, `content`, `rule-host`, `state`, `rule-bgp`), runs them, and renders totals and failed IDs in a visible summary (depends on T003).
- [X] T005 [P] Create the skeleton of data/levels.json:
  - `schemaVersion: 1`;
  - the three diagnoses (data-model.md `Document.diagnoses`, `Diagnosis.id`, `Diagnosis.label`), with labels exactly as spec FR-003;
  - one record per spec Sources entry (data-model.md `Source.id`, `Source.title`, `Source.url`, `Source.section`, `Source.claim`);
  - an empty `levels` array.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: IPv4 arithmetic, content validation, evaluator shell, feedback composition, and loading. These are needed by every story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Write tests/ipv4.test.js with hand-typed expectations:
  - parse `192.168.1.130` to 3232235906 (unsigned);
  - reject `192.168.01.1`, `256.1.1.1`, and `1.2.3`;
  - `255.255.255.128` is contiguous with prefix 25;
  - `255.255.0.255` is non-contiguous;
  - network/broadcast of 192.168.1.130/25 are 192.168.1.128/192.168.1.255;
  - network of 172.16.4.200/22 and 172.16.5.1/22 is 172.16.4.0;
  - 169.254.33.7 is APIPA and 10.20.30.44 is not.
- [X] T007 Implement engine/ipv4.js per research R2 (`>>> 0` on every bitwise result): `parseIp`, `formatIp`, `isContiguousMask`, `maskToPrefix`, `network`, `broadcast`, `isApipa`. Make T006 pass.
- [X] T008 [P] Write tests/content.test.js with a `validDoc()` builder (one valid host-config level) and, for each common and host code in contracts/content.md, a mutated copy that must fail with exactly that code and field path. Codes: `schema-version`, `missing-field`, `wrong-type`, `round-count`, `duplicate-id`, `unknown-source`, `bad-url`, `unknown-rule`, `wrong-evidence`, `ip-malformed`, `mask-non-contiguous`, `mask-out-of-range`, `host-is-network`, `host-is-broadcast`, `gateway-invalid`, `apipa-shape`, `gateway-missing`, `hints-shape`, `solution-empty`.
- [X] T009 Implement `validateContent(doc)` in engine/content.js, returning `{ ok, errors: [{ code, path, roundId }] }` per contracts/content.md. Make T008 pass. It validates:
  - data-model.md `Document.schemaVersion`, `Document.diagnoses`, `Document.sources`, and `Document.levels` (uniqueness only for now; `level-count` is added in T031);
  - `Source.id`, `Source.title`, `Source.url`, `Source.section`, `Source.claim`;
  - `Level.id`, `Level.title`, `Level.rule`, `Level.rank`, `Level.promotesTo`, `Level.phase`, `Level.outcome`, `Level.briefing`, `Level.rounds`;
  - `Round.id`, `Round.monster`, `Round.ticket`, `Round.hints`, `Round.solution`, `Round.sourceIds`;
  - the host-config evidence `Round.host.ip`, `Round.host.mask`, and `Round.host.gateway`, including every host cross-field rule.

  Uses engine/ipv4.js.
- [X] T010 Implement the shell of `evaluate(level, round, answer)` in engine/evaluate.js per contracts/evaluation.md. It runs the per-round content check first (returning `content-error` with the validation code), then the input checks (`invalid-input` with `no-selection` / `unknown-choice`). Valid choice IDs come from `Document.diagnoses` for `host-config` levels. Rules are dispatched through a registry keyed by data-model.md `Level.rule`, and the rules themselves are registered in T015 and T030.
- [X] T011 [P] Implement `explain(round, result)` in engine/feedback.js. It looks up `round.feedback[result.reasonCode]` (or `feedback.correct`) and fills `{placeholder}` tokens from `result.evidence`. Invalid input gets the fixed guidance "Choose one option, then Submit." A content error gets a fixed message naming the round ID and code, which never blames the learner.
- [X] T012 Implement loading in main.js and the content-error view in ui/render.js:
  - show a loading view;
  - fetch `./data/levels.json` and run `validateContent`;
  - on errors, render the content-error view listing each `roundId`, `path`, and `code`, with a Retry button that reloads the data;
  - otherwise create the session and render the first view.

**Checkpoint**: The test page runs ipv4 and content tests green. The game page loads and shows either a content error or an empty start.

---

## Phase 3: User Story 1 - Make and understand a decision (Priority: P1) 🎯 MVP

**Goal**: Briefing → read evidence → choose → submit → explanation → retry or Next, for Levels 1–2 (host-config rule).

**Independent Test**: Fresh session shows the L1 briefing. On L1R1, submitting nothing gives guidance with no attempt counted. "Host IP settings are valid" gives "Still open ✗", attempts 1, and misconception feedback. "No DHCP lease" gives "Resolved ✓" and enables Next. Submitting again changes nothing (quickstart scenarios 1–2).

### Tests for User Story 1

- [X] T013 [P] [US1] Write tests/rule-host.test.js. Hard-code every L1–L2 row of the spec Reference Cases table and the two /25 boundaries:
  - expected choice;
  - status;
  - reason code (e.g. `config-valid/no-lease`, `config-valid/gateway-off-subnet`, `gateway-off-subnet/config-valid`);
  - key evidence: `prefix`, `hostNetwork`, `gatewayNetwork`, `apipa`.

  Expected values are typed by hand, never computed by the code under test.
- [X] T014 [P] [US1] Write tests/state.test.js (US1 part) against data-model.md State transitions:
  - `select` changes no counters;
  - `invalid-input` leaves `Round record.attempts` unchanged;
  - an incorrect submit adds 1 to attempts and keeps `Round record.resolved` false;
  - a correct submit adds 1 to attempts and sets resolved;
  - a repeated submit after resolution changes nothing;
  - Next on R1 moves to R2 of the same level.

### Implementation for User Story 1

- [X] T015 [US1] Implement the host-config rule in engine/rule-host.js per contracts/evaluation.md:
  - ordered APIPA → gateway-subnet → valid;
  - incorrect reason code `<chosen>/<expected>`;
  - evidence `{ ip, mask, prefix, hostNetwork, hostBroadcast, gateway, gatewayNetwork, apipa }`.

  Register it in engine/evaluate.js under `host-config`. Make T013 pass.
- [X] T016 [US1] Extend engine/content.js and tests/content.test.js with `feedback-missing` and `author-disagrees`:
  - for each round, evaluate every choice and require wording in data-model.md `Round.feedback` for `correct` and for each reason code produced;
  - require data-model.md `Round.authorExpects` to equal the evaluator's `expected`;
  - add one failing-copy test per code.
- [X] T017 [US1] Implement engine/state.js. `createSession(doc)`, `select`, `submit`, and `next` follow the data-model.md State transitions, using:
  - `Session.view`, `Session.levelIndex`, `Session.roundIndex`, `Session.selection`, `Session.lastResult`, `Session.records`;
  - `Round record.attempts` and `Round record.resolved`;
  - a guard so `submit` on a resolved round is a no-op.

  Make T014 pass.
- [X] T018 [US1] Implement the briefing and round views in ui/render.js:
  - **Briefing:** shows data-model.md `Level.briefing` (text, worked example, simplifications) and its sources as links with sections, plus a Start button.
  - **Round:** a ticket card with `Round.monster` and `Round.ticket`, and an "ipconfig" `<dl>` showing the address, the mask as both dotted and `/prefix`, and the gateway (or "none").
  - **Controls:** a `<fieldset>`/`<legend>` radio group of the diagnoses, plus Submit and Next. Next stays disabled until the round is resolved.
  - **Explanation region:** shows `explain()` output with "Resolved ✓" / "Still open ✗".
- [X] T019 [US1] Implement ui/controls.js. Wire Start, radio selection, Submit, and Next to engine/state.js, then re-render. Disable Submit once a round is resolved (the state guard still applies).
- [X] T020 [US1] Author Level 1 in data/levels.json: `L1`, rule `host-config`, rank `Service Desk (T1)`, `promotesTo` `NOC Engineer (T2)`, phase `foundation`, outcome `LO1`.
  - **Briefing:** IPv4 address, mask, gateway, DHCP lease versus 169.254 self-assigned address, private ranges; plus a worked example that differs from both rounds and the stated simplifications.
  - **Rounds:** L1R1 and L1R2 with the spec Reference Cases values; hints `{ method, workedStep }`, a solution, feedback for `correct` and every reason code (mistake wording from the spec), `sourceIds`, and `authorExpects`.
- **MVP checkpoint**: L1R1 and L1R2 are playable end to end and the tests are green. Stop here and validate.
- [X] T021 [US1] Author Level 2 in data/levels.json: `L2`, rank `NOC Engineer (T2)`, `promotesTo` `Network Engineer (T3)`, phase `application`, outcome `LO2`.
  - **Briefing:** ANDing an address with its mask, /prefix notation, why the gateway must be in the host's subnet.
  - **Rounds:** L2R1 "The Half-Wall Goblin" (worked interaction text from the spec) and L2R2 (/22), with hints, solution, and feedback using `{prefix}`, `{hostNetwork}`, and `{gatewayNetwork}` placeholders.
- [X] T022 [P] [US1] Implement the address ruler in ui/ruler.js (FR-027), and call it from ui/render.js for L2 rounds after a submission:
  - an SVG showing the host's subnet range as a walled town, with host and gateway markers placed by address;
  - `role="img"` with an `aria-label`;
  - adjacent visible text such as "Gateway 192.168.1.1 is outside 192.168.1.128–192.168.1.255".

**Checkpoint**: Levels 1–2 playable round by round; every L1–L2 reference case passes.

---

## Phase 4: User Story 2 - Get help, track progress, and finish the game (Priority: P1)

**Goal**: Hints and solution recorded as assistance, a progress display, level and session summaries with rank promotion, and Restart with confirmation.

**Independent Test**: Use a hint on one round and the solution on another, double-submit after a correct answer, finish all levels, then Restart → Cancel and Restart → Confirm. The counters and summaries match the spec (quickstart scenarios 4–5).

### Tests for User Story 2

- [X] T023 [P] [US2] Extend tests/state.test.js:
  - help raises data-model.md `Round record.assistance` to the max of `method` < `worked-step` < `solution`;
  - help after resolution is not recorded;
  - help never sets resolved;
  - Next after the last round of a level → `level-summary`, and the derived rank equals that level's `Level.promotesTo`;
  - Next from the last level's summary → `session-summary`;
  - `Session.confirmingRestart` cancel changes nothing;
  - confirm returns a fresh session at the L1 briefing with all records cleared.

### Implementation for User Story 2

- [X] T024 [US2] Extend engine/state.js:
  - `help(level)`, which updates `Round record.assistance` only while unresolved;
  - transitions `round → level-summary → briefing | session-summary`;
  - the current rank derived from completed levels (never stored);
  - `requestRestart` / `confirmRestart` / `cancelRestart` using data-model.md `Session.confirmingRestart`.

  Make T023 pass.
- [X] T025 [US2] Add help controls and a progress bar in ui/render.js:
  - **Hint button:** reveals `Round.hints.method`, then `Round.hints.workedStep`.
  - **Show solution button:** reveals `Round.solution`.
  - **Always-visible status:** current rank, "Round x of 2", attempts, and hints used (FR-014). No XP.
- [X] T026 [US2] Add the level-summary and session-summary views in ui/render.js:
  - **Level summary:** per round, completed / valid attempts / assistance, plus "Promoted to {Level.promotesTo}".
  - **Session summary:** the same figures per level as separate columns, with wording that does not present completion as mastery (FR-015).
- [X] T027 [US2] Implement Restart in ui/controls.js and index.html with a native `<dialog>`: Confirm and Cancel buttons, Escape cancels, and focus returns to the Restart button on cancel. Wire it to the state restart functions.

**Checkpoint**: A full Levels 1–2 session works with help, summaries, and Restart. (Until Phase 5 lands, the session summary follows the last level present in the data.)

---

## Phase 5: User Story 1 (continued) - The BGP Boss, Level 3 (Priority: P1) ✂️ Cut line

**Goal**: Level 3 best-path selection: a path table, path choices, the elimination-rule grading, and an elimination trace (spec FR-002, FR-006, FR-027; US1 scenario 4).

**Independent Test**: On L3R2, choosing C says it was eliminated at AS-path length, choosing A says it was eliminated at origin, and choosing B resolves the round with the trace weight tie → local pref tie → C out → A out (quickstart scenario 3).

### Tests for the BGP Boss

- [X] T028 [P] [US1] Write tests/rule-bgp.test.js. Hard-code:
  - L3R1 (B correct; A → `A/lost-local-pref`);
  - L3R2 (B correct; C → `C/lost-as-path`; A → `A/lost-origin`; `decidingStep` `origin`; `eliminatedAt` `{C: "as-path", A: "origin"}`; the step survivors list);
  - the weight boundary (B wins at `weight`) and the MED boundary (B wins at `med`, same neighbouring AS 64501);
  - `content-error` `bgp-full-tie` and `bgp-med-cross-as` cases.
- [X] T029 [P] [US1] Extend tests/content.test.js with failing copies for `level-count`, `prefix-malformed`, `path-count`, `path-attribute` (out-of-range weight, unknown origin, empty `asPath`), `duplicate-id` (path), `wrong-evidence` (BGP round with `host`), `bgp-full-tie`, and `bgp-med-cross-as`.

### Implementation for the BGP Boss

- [X] T030 [US1] Implement the best-path rule in engine/rule-bgp.js per contracts/evaluation.md:
  - elimination steps `weight`, `local-pref`, `as-path`, `origin` (igp=0, egp=1, incomplete=2), and `med` (only if survivors share `asPath[0]`);
  - incorrect reason code `<pathId>/lost-<step>`;
  - evidence `{ steps, decidingStep, eliminatedAt, neighbourAs }`.

  Register it in engine/evaluate.js under `bgp-best-path`, with valid choice IDs taken from data-model.md `Path.id`. Make T028 pass.
- [X] T031 [US1] Extend engine/content.js with BGP and level-count validation. Make T029 pass. It validates:
  - data-model.md `Round.prefix` and `Round.paths`;
  - `Path.id`, `Path.label`, `Path.nextHop`, `Path.weight`, `Path.localPref`, `Path.asPath`, `Path.origin`, `Path.med`;
  - the BGP cross-field rules (`bgp-full-tie` and `bgp-med-cross-as`, by running the rule);
  - `level-count`: exactly 3 levels per data-model.md `Document.levels`.
- [X] T032 [US1] Implement ui/paths.js and call it from ui/render.js for `bgp-best-path` rounds:
  - **Path table:** shows the destination prefix and a `<table>` with `<th scope>` columns for label, next hop, weight, local pref, AS path (with length), origin, and MED, inside a labelled scrollable region;
  - **Choices:** a radio group of the paths;
  - **After a submission:** an ordered elimination trace (`<ol>`) naming each step's values and which paths dropped out.

  Add BGP placeholders (`{decidingStep}`, attribute values) to engine/feedback.js.
- [X] T033 [US1] Author Level 3 in data/levels.json: `L3`, rule `bgp-best-path`, rank `Network Engineer (T3)`, `promotesTo` `Senior Network Engineer (T4)`, phase `transfer`, outcome `LO3`, and the title of the BGP Boss level.
  - **Briefing:** introduces an autonomous system, a prefix, a path, and the five attributes in order, with a worked example different from both rounds. The simplifications state the Cisco-specific weight, the excluded tie-breakers, and MED only within the same neighbouring AS.
  - **Rounds:** L3R1 and L3R2 with the spec Reference Cases values (prefix 203.0.113.0/24, documentation next hops, private ASNs), hints, solution, feedback for every `<pathId>/lost-<step>` code, and `authorExpects` `B`.
  - **Sources:** RFC 4271, Cisco best-path, RFC 5737, RFC 6996.

**Checkpoint**: All six rounds are playable; the session summary appears after L3 with promotion to Senior Network Engineer (T4).

---

## Phase 6: User Story 3 - Play entirely with accessible controls (Priority: P1)

**Goal**: Keyboard-only play, visible focus, text and announced feedback, reduced motion, and a narrow layout (FR-022 to FR-026).

**Independent Test**: Complete the full session keyboard-only in a ~360 px wide window with reduced motion on (quickstart scenarios 6–7).

- [X] T034 [US3] Add focus management in ui/render.js and ui/controls.js:
  - after every view change, move focus to the new view's `<h2 tabindex="-1">`;
  - give every control an accessible name;
  - keep the DOM order matching the visual order (evidence → choices → Submit/Hint/Solution/Next);
  - Restart stays reachable from the header.
- [X] T035 [P] [US3] Make styles accessible in style.css:
  - a high-contrast `:focus-visible` outline on every interactive element;
  - status shown with text and icon, never colour alone;
  - at narrow widths (≤ 480 px), a single column with the ipconfig card and path table in labelled regions that scroll horizontally (`role="region"`, `aria-label`, `tabindex="0"`), with action buttons always visible.
- [X] T036 [P] [US3] Apply reduced motion in style.css, ui/ruler.js, and ui/paths.js:
  - marker-drop and trace animations run only under `prefers-reduced-motion: no-preference`;
  - feedback text and controls are rendered before any animation starts, never after it ends.
- [X] T037 [US3] Make announcements reliable in ui/render.js. On every submission, including invalid input, write the explanation text into the persistent `aria-live="polite"` region (replace its content rather than re-creating the region) so screen readers announce it.
- [X] T038 [US3] Run quickstart scenarios 6 (keyboard only) and 7 (narrow window and reduced motion). Record pass/fail/not run with browser/OS and date in the README.md verification table.

**Checkpoint**: All three user stories are complete and verified.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T039 Check every source in data/levels.json against the cited text, fix any section number or claim that doesn't match, and record the reviewer and date in README.md:
  - RFC 3927 §2.1, RFC 1122 §3.3.1.1, RFC 4632 §3.1, RFC 1918 §3;
  - RFC 4271 §5.1.1/§5.1.2/§5.1.4/§5.1.5/§9.1.1/§9.1.2.2;
  - Cisco "BGP Best Path Selection Algorithm", RFC 5737 §3, RFC 6996 §5.
- [X] T040 Review the teaching content in data/levels.json. For every wrong choice in every round, the feedback names what was wrong and which value to re-check (SC-004), and every briefing, hint, and solution agrees with the grading rule (SC-006).
- [X] T041 [P] Rewrite README.md from the template:
  - the game name and pitch, "What you'll learn" (LO1–LO3), Play locally (exact commands from quickstart.md), and How to play with the actual controls;
  - What this game models and what lies outside the model (both IPv4 and BGP), plus references;
  - How it was built, Known limitations, Credits, and License.

  Remove the attendee note and every placeholder.
- [X] T042 Run all quickstart.md scenarios (1–5, 8, 9) and the test page. Record totals, failed IDs, and each scenario's pass/fail/not run result with date, browser/OS, and commit in the README.md verification table.
- [X] T043 **Only if Phase 5 was skipped (cut line):** *Not needed: Phase 5 shipped, so no cut was applied.*
  - set the `level-count` expectation to 2 in engine/content.js;
  - make Level 2's summary lead to the session summary;
  - update the scope in spec.md, the Phase 5 status in this tasks.md, and the README.md Known limitations to say Level 3 (BGP) is not shipped.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup; blocks all stories.
- **US1 (Phase 3)**: depends on Foundational. MVP.
- **US2 (Phase 4)**: depends on Phase 3 state and render modules (T017–T019).
- **BGP Boss (Phase 5)**: depends on Foundational (evaluate registry, content.js) and Phase 3 render/controls. It is independent of Phase 4 except that the final session summary is verified after it.
- **US3 (Phase 6)**: depends on the views it makes accessible (Phases 3–4, and Phase 5 if shipped).
- **Polish (Phase 7)**: depends on all shipped phases.

### Within Each Phase

- Tests (T006, T008, T013, T014, T023, T028, T029) are written before their implementation and must fail first.
- Engine modules come before UI; data authoring comes after the validator, so authoring errors are caught.
- engine/content.js is edited in T009, T016, and T031, so those tasks run in that order.
- tests/content.test.js is edited in T008, T016, and T029, so those tasks are sequential too.

### Parallel Opportunities

- Phase 1: T002, T003, and T005 in parallel (T004 after T003).
- Phase 2: T006 and T008 together; then T007 → T009; T011 alongside T009 or T010.
- Phase 3: T013 and T014 together; T022 alongside T020–T021.
- Phase 5: T028 and T029 together; T030 and T032 can start in parallel once the tests exist.
- Phase 6: T035 and T036 together.

---

## Parallel Example: User Story 1

```text
# Tests first, together:
Task: "Write tests/rule-host.test.js (L1–L2 reference cases + /25 boundaries)"
Task: "Write tests/state.test.js US1 part (select, invalid input, attempts, once-only resolve, Next)"

# Then, alongside the content authoring:
Task: "Implement the SVG address ruler in ui/ruler.js"
```

## Parallel Example: BGP Boss

```text
Task: "Write tests/rule-bgp.test.js (L3R1, L3R2, weight/MED boundaries, tie and cross-AS errors)"
Task: "Extend tests/content.test.js with BGP and level-count codes"
```

---

## Implementation Strategy

### MVP First

1. Phase 1 Setup → Phase 2 Foundational.
2. Phase 3 through T020: L1R1 and L1R2 playable with the host rule proven by tests.
3. **Stop and validate** with quickstart scenario 1.

### Incremental Delivery

1. Add Level 2 and the ruler (T021–T022): the subnet lesson.
2. Add US2 (Phase 4): help, summaries, Restart. This is a complete Levels 1–2 game.
3. Add the BGP Boss (Phase 5): the full three-level game.
4. Add US3 (Phase 6): accessibility hardening and checks (never cut).
5. Polish (Phase 7): source check, content review, README, recorded verification.

### Time Pressure (60-minute build)

Correctness (Phases 2–3) and accessibility (Phase 6) are never cut. If time runs short, skip
Phase 5 and run T043, so the spec, tasks, and README all describe the two-level game that
actually ships (Constitution VII).

---

## Notes

- Expected test values come from the spec's Reference Cases table, typed by hand.
- Content errors are never resolved in the author's favour (`author-disagrees`).
- A checked task box is not evidence. Record actual results in the README verification table.

---

## Implementation Notes (2026-11-17)

- **Extra files beyond the plan:**
  - `tests/fixtures.js`: shared, hand-typed reference rounds.
  - `ui/dom.js`: a tiny text-safe DOM builder.
  - `tests/playthrough.html`: an automated end-to-end playthrough of the real game.
- **Small deviations from the plan:**
  - **Ruler and trace timing:** the address ruler (L2) and elimination trace (L3) appear once the ticket is **resolved**, matching the spec's worked interaction. Showing them after a wrong answer would give the answer away.
  - **Round count:** the status bar shows "Round x of N", with N taken from the content, so a trial round (SC-008) needs no code change. `validateContent` accepts `levelCount`/`roundsPerLevel` options for that trial; the shipped game uses the defaults (3 and 2).
  - **Help display:** the state stores `helpShown` (the help level displayed, which is UI only) separately from `Round record.assistance` (the help level recorded while unresolved).
- **Verification results** are recorded in README.md. T038's human keyboard-only run is recorded there as **Not run**; only automated focus checks were done. T039's source check was AI-assisted and still needs a human teammate review.
- **Delivered by feature 002:** the "Experience direction" from StarterKit/SPEC.md (ticket monsters
  in Networklandia, a memorable moment per answer) is delivered by
  `specs/002-adventure-presentation`. That feature adds battle scenes, move selection, bosses, a
  world map and rank gear, and leaves this feature's rules and content unchanged.
