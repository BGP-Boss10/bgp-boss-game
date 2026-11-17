<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0 (MINOR: materially expanded guidance on presentation;
  includes PATCH-level wording fixes)
- Modified principles:
  - II. Every Round Teaches Through a Decision: "Each level follows this learning sequence"
    → "The game follows this learning sequence across its levels" (restores the team's
    StarterKit C2 intent; resolves /speckit-analyze finding D1).
  - III. Progress Is Honest and Retry Is Safe: added that monster health is presentation
    only and a wrong move costs the player nothing.
  - IV. Access Is Part of the Core Game: added that art is decorative and every battle
    outcome is also stated in text.
- Purpose: now states that the game is a graphical adventure (battle scenes, move selection,
  a world map, a hero whose look changes with rank); "earns the experience" wording replaced
  with rank promotion (resolves analysis finding F3).
- Added sections: none. Scope & Technical Constraints gains an "Adventure presentation"
  bullet, and the first-release budget records feature 002 as agreed follow-up scope.
- Removed sections: none
- Follow-up: specs/001 stays valid; specs/002-adventure-presentation adds the presentation.
- Deferred TODOs: none.
-->

# Network-Quest Constitution

**Purpose:** Network-Quest helps new network engineers practise real networking skills by
solving the tickets and problems they would meet along their career, from basic Wi-Fi and
addressing questions on the service desk up to traffic-engineering decisions at network
architect level. Each level simulates the questions of one career stage; resolving its
tickets promotes the player to the next stage. The game is a graphical adventure:
- the hero, NetworkSerf, faces each ticket monster in a battle scene;
- the player chooses a move (their answer) and watches it land or get blocked;
- levels are places on a map of Networklandia;
- every promotion changes the hero's look.

It takes this style from classic browser RPGs as genre inspiration only: all names,
characters, art, and assets MUST be original.

## Core Principles

### I. Technical Truth Is a Release Requirement

- The game MUST NEVER reward a technically incorrect answer.
- Grading MUST be reproducible from a documented rule and the challenge inputs alone.
- Unsupported or ambiguous content is an authoring error: the game MUST show that the
  challenge is unavailable, with an explanation, and MUST NOT grade it.
- The model taught is drawn from core Cisco CCNA, CCNP, and CCIE concepts. Every networking
  rule MUST cite an authoritative source (RFC or vendor documentation) with section.
- Simplifications MUST appear in the briefing and the README wherever they affect what the
  player can conclude. Fictional worlds and animations MAY illustrate a rule; they MUST NOT
  change it.

**Evidence:** hand-checked correct, incorrect, and boundary cases; a source link and section
for each networking rule; review of all shipped briefings and explanations. Expected results
are recorded independently of the implementation under test.

**Rationale:** a learning game that teaches a wrong rule does active harm; correctness is
the product.

### II. Every Round Teaches Through a Decision

- The player's main action MUST exercise the target skill.
- A concept MUST be introduced before it is tested, and the values needed to reason about the
  answer MUST be visible.
- A wrong answer MUST explain the specific mistake and give a useful next step. A correct
  answer MUST explain why it works.
- The game follows this learning sequence across its levels:
  1. **Foundation:** recognise and recall the concept through a short, direct ticket, with a
     full explanation after every answer.
  2. **Application:** diagnose a realistic user ticket by reading the symptoms and values
     shown (for example, an `ipconfig` output).
  3. **Transfer / edge case:** a level-boss ticket where the concept appears in a new context
     or the obvious answer is wrong, mixing the level's concepts.
- Hints reveal a method first, then a worked step. Worked solutions are available when a
  learner is stuck; viewing one MUST be recorded as assistance, never as independent mastery.

**Evidence:** a teammate can connect each player action to a learning outcome and describe
what they learned from a deliberately wrong choice.

**Rationale:** learning comes from committing to a decision and seeing why it was right or
wrong, not from reading.

### III. Progress Is Honest and Retry Is Safe

- A round completes only on a valid, correct submission. Incorrect answers keep the challenge
  available.
- Empty or malformed submissions MUST give input guidance without counting as a wrong attempt.
- Repeated Submit actions MUST NOT award progress (or experience) twice.
- The first version has no lives, countdown, or speed bonus. Hints and retries carry no
  penalty. Monster health is presentation only: one correct move defeats the monster, and a
  wrong move is blocked without costing the player anything.
- Completed rounds, attempts, and assistance MUST be shown separately; completion is not
  proof of independent mastery.
- The specification MUST state exactly what advances a round, finishes a level, and resets a
  session.

**Evidence:** wrong-answer, repeated-submit, hint, completion, and reset checks match the
specification.

**Rationale:** level-ups only mean something if the counters behind them cannot be gamed or
silently inflated.

### IV. Access Is Part of the Core Game

- All core actions MUST be usable by keyboard, with visible focus, readable labels, and an
  understandable order.
- Success and failure MUST be conveyed in text as well as colour.
- Essential diagrams MUST have a text equivalent. Decorative art (characters, scenes, effects)
  is hidden from assistive technology, and every battle outcome is also stated in text.
- Reduced-motion preferences MUST be respected; animation MUST NOT delay the availability of
  feedback or controls.
- The challenge MUST stay usable on a typical laptop and in a narrow browser window. Dense
  technical data MAY scroll within its own labelled container, without hiding the action
  buttons.

**Evidence:** a keyboard-only playthrough, a narrow-window check, and a reduced-motion check.
Record what was actually checked; do not claim full accessibility certification.

**Rationale:** a learner who cannot operate the game cannot learn from it.

### V. Deterministic and Self-Contained First Version

- The first version ships authored content and deterministic domain logic.
- It MUST require no account, backend, live device connection, model, or API key.
- AI MAY help write code and assets during development; its output receives the same review
  as any other contribution.
- Runtime AI tutoring, generated questions, and free-text AI grading are stretch work. Adding
  any of them requires an explicit amendment to this constitution, the specification, and the
  verification approach before implementation.

**Evidence:** a clean browser session can play using only the project's static files; no
external content service decides an answer.

**Rationale:** deterministic grading is what makes Principle I verifiable.

### VI. Content and Logic Are Reviewed Separately

- Level content, hints, sources, and difficulty MUST live in editable data.
- Domain rules MUST be separate from rendering and progress tracking.
- Data MUST be validated before a challenge is presented.
- Feedback MUST agree with the evaluator's reasoning; a hand-authored answer key MUST NOT
  silently override the rule engine.
- Adding another challenge that uses an existing mechanic MUST require only a data change and
  its checks, not a new scoring path or a new screen implementation.

**Evidence:** inspect one level's data, trace one answer through the evaluator, and add a
trial challenge without modifying the rule engine.

**Rationale:** the curriculum must grow from service desk to architect level without
rewriting the engine, and a networking reviewer must be able to check content without
reading code.

### VII. Done Is Demonstrated

- Ship only the agreed scope. Requirements, plan, tasks, and README MUST describe the same
  game.
- A feature is complete when its acceptance criteria pass and its actual status is recorded.
  A screenshot, a checked task box, or the agent saying "done" is insufficient by itself.
- When time is short, reduce scope explicitly. Fix incorrect teaching and broken core
  interactions before adding visual effects.
- Failed and untested checks MUST stay visible.

**Evidence:** reproducible run/test commands, recorded verification results, a fresh-start
playthrough, and a README another attendee can follow.

**Rationale:** honest status is what lets the next contributor trust and extend the build.

## Scope & Technical Constraints

- **First-release budget:** one core mechanic and three short levels in one browser. The
  teaching core (feature 001) was built within a 60-minute workshop block. The adventure
  presentation (feature 002) is agreed follow-up scope for the same release. This budget
  changes only by updating the agreed scope (see Governance).
- **Adventure presentation:** battle scenes, characters, effects, and the world map are drawn
  with inline SVG and CSS in the project's own files: no image downloads, web fonts, or audio.
  The presentation only shows the evaluator's result; it never decides it (Principle I).
- **Runtime:** static files only (semantic HTML, CSS, native JavaScript modules) served over
  HTTP; no framework, bundler, backend, persistence service, or runtime model unless a
  constitution amendment and plan update record the dependency, its version, loading
  strategy, reason, and accessible alternative.
- **Content scope:** later career stages (CCNP/CCIE-level topics such as BGP and traffic
  engineering) are added as new levels through data and the existing mechanic where possible
  (Principle VI); a new mechanic requires its own specification.
- **Originality:** all game names, characters, art, music, and text are original or properly
  licensed and credited in the README.

## Development Workflow & Quality Gates

- Work follows the Spec Kit sequence: constitution → specify → clarify → plan → tasks →
  analyze → implement.
- Every plan MUST include a Constitution Check against Principles I–VII; any deviation MUST be
  justified in the plan's complexity tracking or resolved before tasks are generated.
- `/speckit-analyze` findings that conflict with this constitution are CRITICAL and MUST be
  resolved before implementation proceeds.
- Before a change is reported as done: the test runner shows a non-empty suite with recorded
  totals and failures; the evidence listed under each affected principle has been gathered;
  and the README verification table reflects what was actually checked.

## Governance

- This constitution supersedes other project practices. A conflict between it and a spec,
  plan, task, or implementation is resolved openly; the build agent MUST NOT weaken a
  principle merely to make its implementation pass.
- **Amendments:** any material change records its reason, updates the affected spec and plan,
  and reruns analysis. Changes are agreed by the project team and applied via
  `/speckit-constitution`.
- **Versioning:** semantic versioning. MAJOR for removing or redefining a principle in a
  backward-incompatible way; MINOR for adding a principle or section, or materially expanding
  guidance; PATCH for clarifications and wording fixes.
- **Compliance review:** every plan's Constitution Check and every analysis pass verifies
  compliance; the README verification section is the record of evidence.

**Version**: 1.1.0 | **Ratified**: 2026-11-17 | **Last Amended**: 2026-11-17
