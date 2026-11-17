# Implementation Plan: Network-Quest First Playable — IPv4 Tickets and the BGP Boss

**Branch**: `001-ipv4-ticket-diagnosis` (spec directory; work is on `main`) | **Date**: 2026-11-17 |
**Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-ipv4-ticket-diagnosis/spec.md`, plus the team's
starter plan `StarterKit/PLAN.md` (adapted for the BGP Level 3 decided in clarification).

## Summary

A static browser game with six rounds across three levels. Each round shows evidence, the
player picks one choice and submits it, and a pure evaluator grades the choice and explains
why. Levels 1–2 use a **host-configuration rule** (APIPA check, then gateway-subnet check,
using unsigned 32-bit IPv4 arithmetic). Level 3 uses a **BGP best-path rule** (weight → local
preference → AS-path length → origin → MED within the same neighbouring AS). Content lives in
one validated JSON file. Session state, help, and progress are in memory. The UI uses native
HTML controls with an SVG address ruler (Level 2) and an elimination trace (Level 3), each with
a text equivalent. A dependency-free browser test runner checks both rules, state transitions,
and content validation against hand-typed expected results.

**Hardest behaviour to get right:**

1. JavaScript bitwise operators return *signed* 32-bit integers. Every IPv4 result must be
   normalised with `>>> 0`, or 192.x.x.x addresses compare incorrectly.
2. The BGP elimination order and its two unsupported cases (full tie; MED reached across
   different neighbouring ASes). These must become content errors, never guesses.
3. Repeated Submit after success must change nothing (spec FR-011).

**First evidence to check:** reference case **L1R1** (`no-lease` correct; `config-valid`
incorrect with reason `config-valid/no-lease`). Then **L2R1** (host network 192.168.1.128,
gateway network 192.168.1.0). Then **L3R2** (C out at `as-path`, A out at `origin`, B wins).

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2020 native modules)

**Primary Dependencies**: None at runtime or build time (no framework, bundler, or library)

**Storage**: Authored content in `data/levels.json`, loaded over HTTP by relative URL. Session
state in memory only; no persistence (FR-017).

**Testing**: Dependency-free browser test runner at `tests/index.html` (ES modules, visible
pass/fail totals, failed case IDs; zero discovered tests counts as failure)

**Target Platform**: Current evergreen desktop browsers (Chromium, Firefox, Safari) on a typical
laptop and a narrow window; served by any static HTTP server, including a GitHub Pages
repository subpath

**Project Type**: Static single-page web game

**Performance Goals**: Feedback and controls appear in the same frame as the submission
(no waiting on animation, FR-024). Content loads and validates before the first briefing.

**Constraints**: Works offline after load; no account, backend, model, or API key (FR-028);
relative asset paths and case-correct filenames; `file://` is not a supported run path

**Scale/Scope**: 3 levels × 2 rounds; 2 grading rules; 1 player per page session; build within a
60-minute workshop block

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design (see end).*

| Principle | Gate | Plan evidence | Status |
| --- | --- | --- | --- |
| I. Technical truth | Grading is reproducible from a documented rule; unsupported content is not graded; every rule cites a source | Two pure evaluators ([contracts/evaluation.md](contracts/evaluation.md)); content-error codes for every unsupported case; `sources[]` with section on every briefing; tests hard-code spec cases | PASS |
| II. Teaching through decisions | Concept before test; values visible; wrong answers explain the specific mistake | Briefing view precedes each level; per-reason-code feedback in data; L2 ruler and L3 elimination trace show the deciding values | PASS |
| III. Honest progress | One attempt per valid submit; once-only completion; invalid input free; assistance separate | State module guards; `invalid-input` never counts; assistance tracked per round; no XP, timers, or lives | PASS |
| IV. Access | Keyboard, focus, text feedback, reduced motion, narrow layout | Native radio groups and buttons; `aria-live` explanation; `prefers-reduced-motion`; `<table>` and text equivalents for SVG | PASS |
| V. Deterministic and self-contained | No runtime service decides an answer | Static files only; no network calls except loading `levels.json` | PASS |
| VI. Content and logic separate | Content in data; rules separate from rendering and state; author key cannot override | `data/levels.json`; `engine/` has no DOM; `authorExpects` is only a cross-check that raises a content error on disagreement | PASS |
| VII. Done is demonstrated | Reproducible run/test commands; results recorded | [quickstart.md](quickstart.md); README verification table; build order puts correct teaching before polish | PASS |
| Scope & constraints | One core mechanic, three levels, static stack | One mechanic (pick one choice from evidence, submit, explanation) with two grading rules; see Complexity Tracking | PASS (noted) |

## Project Structure

### Documentation (this feature)

```text
specs/001-ipv4-ticket-diagnosis/
├── spec.md              # Clarified feature specification
├── plan.md              # This file
├── research.md          # Phase 0: decisions and rationale
├── data-model.md        # Phase 1: entities, fields, validation, state transitions
├── quickstart.md        # Phase 1: run and validation guide
├── contracts/
│   ├── evaluation.md    # evaluate() contract for both grading rules
│   └── content.md       # levels.json schema and validation codes
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 (/speckit-tasks; not created here)
```

### Source Code (repository root)

```text
index.html                 Semantic page shell and module entry point
style.css                  Layout, focus, feedback states, narrow layout, reduced motion
main.js                    Load → validate → start; loading and content-error screens
engine/
  ipv4.js                  Parse dotted quads, mask → prefix, network/broadcast (unsigned 32-bit)
  rule-host.js             Levels 1–2 ordered diagnosis rule (pure)
  rule-bgp.js              Level 3 best-path elimination rule (pure)
  evaluate.js              evaluate(level, round, answer): input checks, rule dispatch by level.rule
  content.js               Validate the whole levels.json document; returns errors with paths
  state.js                 Session transitions, attempts, assistance, completion, restart
  feedback.js              Build explanation text from data wording + evaluator evidence
ui/
  render.js                Briefing, challenge, feedback, level summary, session summary views
  ruler.js                 Level 2 SVG address ruler with text equivalent
  paths.js                 Level 3 path table and elimination trace
  controls.js              Input events, keyboard/focus management, restart confirmation
data/
  levels.json              Briefings, rounds, hints, solutions, feedback, sources
tests/
  index.html               Browser test runner with visible pass/fail summary
  runner.js                Minimal assert/describe; fails on zero tests
  rule-host.test.js        Spec cases L1R1–L2R2 and subnet boundaries, hand-typed expectations
  rule-bgp.test.js         Spec cases L3R1–L3R2, weight and MED boundaries, unsupported cases
  state.test.js            Attempts, invalid input, duplicate submit, help, level/session completion, restart
  content.test.js          Every validation code, plus the shipped levels.json validates cleanly
README.md                  Actual run instructions, behaviour, verification evidence
```

**Structure Decision**: Single static web project at the repository root, as in the starter
plan, so it can be served directly (including from a GitHub Pages subpath). `engine/` holds
pure, DOM-free modules that the test runner imports directly. `ui/` holds rendering only. The
starter plan's single `rules.js` is split into `ipv4.js`, `rule-host.js`, `rule-bgp.js`, and
`evaluate.js` because Level 3 now has its own rule.

## Implementation Order

| Slice | Deliverable | Evidence before the next slice |
| --- | --- | --- |
| 1 · Prove the host rule | `ipv4.js`, `rule-host.js`, `evaluate.js`, host tests | L1–L2 spec cases and boundaries pass |
| 2 · Complete one round | Briefing, challenge, feedback, retry, Next for L1R1 | One correct and one wrong path work in the browser |
| 3 · Levels 1–2 curriculum | Content validation, L1–L2 data, hints, ruler, level and session summaries | Each shipped round matches its reviewed case |
| 4 · The BGP Boss | `rule-bgp.js`, BGP tests, L3 data, path table and elimination trace | L3 spec cases, boundaries, and unsupported cases pass |
| 5 · Make it usable | Keyboard/focus, reduced motion, narrow layout, error states | Manual checks recorded |
| 6 · Package | README with run/test commands and verification table | Another attendee can run and explain the game |

**Cut line (Constitution VII):** if time runs short, slice 4 is cut first. The game then ships
Levels 1–2 with a summary after Level 2, and the spec, tasks, and README are updated to say so.
Correctness and accessibility are never cut in favour of the BGP level.

## Complexity Tracking

| Item | Why needed | Simpler alternative rejected because |
| --- | --- | --- |
| Two grading rules (host-configuration and BGP best-path) under one mechanic | Clarification replaced Level 3 with BGP best-path selection; its evidence and rule share nothing with the IPv4 rule | One generic quiz schema with an authored answer key would let the key override the rule (violates Constitution VI) and discard the domain structure |

## Post-Design Constitution Check

Re-checked after writing [data-model.md](data-model.md), [contracts/](contracts/), and
[quickstart.md](quickstart.md): all gates still PASS.

- I: every content-error code in [contracts/content.md](contracts/content.md) maps to an
  unsupported case in the spec.
- III: the state transitions in [data-model.md](data-model.md) give attempts, completion, and
  assistance separate fields, and every transition has a guard.
- VI: `authorExpects` is a cross-check only.

No new violations.
