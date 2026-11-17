# Research: Network-Quest First Playable

All Technical Context items were known from the starter plan and the clarified spec; no
NEEDS CLARIFICATION remained. These are the decisions that shape the design.

## R1 · Runtime stack

- **Decision:** Semantic HTML, CSS, and native ES modules; no framework, bundler, or library.
  `data/levels.json` is fetched by relative URL. Served by `python -m http.server` (or `py` on
  Windows) for development, and by any static host for release.
- **Rationale:** Constitution V and the Scope section require static files. Native modules let
  the test runner import the same pure engine files the game uses. Six rounds don't need a
  framework.
- **Alternatives considered:** A framework (React or Svelte) adds a build step and setup time
  inside a 60-minute block. A single inline script can't be imported by the test runner.

## R2 · IPv4 arithmetic

- **Decision:** Parse each dotted quad to an unsigned 32-bit integer with
  `((a<<24)|(b<<16)|(c<<8)|d) >>> 0`. Compute `network = (ip & mask) >>> 0` and
  `broadcast = (network | (~mask >>> 0)) >>> 0`. A mask is contiguous when
  `((~mask >>> 0) + 1) & (~mask >>> 0)` equals 0, and its prefix is the count of leading ones.
  APIPA is `(ip & 0xFFFF0000) >>> 0 === 0xA9FE0000`.
- **Rationale:** JavaScript bitwise operators produce signed 32-bit results, so 192.x.x.x is
  negative without `>>> 0`. Numbers stay below 2^53, so the results are exact.
- **Alternatives considered:** Comparing octets as strings is wrong for any mask that isn't a
  multiple of 8 (the exact misconception Level 2 teaches). BigInt is unnecessary.

## R3 · BGP best-path model (Level 3)

- **Decision:** Eliminate paths step by step, keeping only the best-valued survivors:
  1. Highest weight (Cisco-specific, local to the router; 0–65535).
  2. Highest LOCAL_PREF.
  3. Shortest AS_PATH (count of AS numbers; AS_SET not modelled).
  4. Lowest ORIGIN, in the order IGP (0) < EGP (1) < INCOMPLETE (2).
  5. Lowest MED, **only if** all survivors share the same neighbouring AS (the first AS in the
     path). If they don't, the content is unsupported.

  The first step that leaves exactly one path decides. If several survivors remain after MED,
  the content is unsupported.
- **Rationale:** RFC 4271 §9.1.1 ranks routes by degree of preference (LOCAL_PREF for routes
  learned inside the AS), and §9.1.2.2 breaks ties by AS_PATH length, then ORIGIN, then MED
  among routes from the same neighbouring AS. Cisco IOS compares weight before local
  preference. The later tie-breakers (eBGP over iBGP, IGP metric, path age, router ID, peer
  address) need evidence the game doesn't show, so rounds that would reach them are rejected as
  content, not guessed (Constitution I).
- **Verification still required:** check the cited RFC 4271 sections and the Cisco "BGP Best
  Path Selection Algorithm" document against their text before release (spec Assumptions,
  "Source check").
- **Alternatives considered:** Modelling the full Cisco algorithm needs evidence (IGP cost, age,
  router ID) that would clutter the table for beginners. Allowing `always-compare-med` adds a
  configuration flag that the spec excludes.

## R4 · Choice representation per rule

- **Decision:** Levels 1–2 use three stable diagnosis IDs (`no-lease`, `gateway-off-subnet`,
  `config-valid`) from a document-level list. Level 3 uses the round's path IDs (`A`, `B`,
  `C`). Each round renders its choices as one native radio group.
- **Rationale:** Each round has exactly one expected answer (clarified). Stable IDs keep
  feedback keys and tests independent of label wording and screen position.
- **Alternatives considered:** Keeping `no-relay` as a distractor was rejected; no Level 1–2
  evidence can prove it (spec Assumptions).

## R5 · Reason codes and feedback

- **Decision:** For host rounds, an incorrect result has reason code `<chosen>/<expected>`
  (e.g. `config-valid/gateway-off-subnet`). For BGP rounds it is `<chosenPathId>/lost-<step>`
  (e.g. `A/lost-local-pref`). Each round's `feedback` object holds fixed wording keyed by every
  reason code the evaluator can produce for that round, plus `correct`. At load time, the
  content validator runs the evaluator for every choice to confirm that each reason code has
  wording.
- **Rationale:** This keeps wording editable in data while guaranteeing that feedback agrees
  with the evaluator (Constitution VI). Numbers in the text (prefixes, ANDed octets, attribute
  values) are filled in from the evaluator's `evidence`.
- **Alternatives considered:** Generating all text in code makes the wording hard to review.
  Pure hand-authored text risks disagreeing with the rule.

## R6 · Test runner

- **Decision:** `tests/index.html` loads `tests/runner.js` and every `*.test.js` module, runs
  them, and shows totals and failed case IDs. Zero tests is reported as failure. Expected
  values are typed in by hand from the spec's Reference Cases table and never computed by the
  code under test.
- **Rationale:** No dependencies, uses the same server as the game, and satisfies
  Constitution VII.
- **Alternatives considered:** Node test runners need a Node install and a different module
  loading path.

## R7 · Accessibility patterns

- **Decision:**
  - A `<fieldset>`/`<legend>` radio group for choices; native `<button>`s throughout.
  - A persistent `aria-live="polite"` explanation region.
  - After a screen change, focus moves to the new view's heading (with `tabindex="-1"`).
  - Restart confirmation uses a native `<dialog>` with `showModal()`, which gives focus
    trapping and Escape-to-cancel for free.
  - `@media (prefers-reduced-motion: reduce)` removes ruler and trace animations.
  - The SVG ruler gets `role="img"` with an `aria-label`, plus visible text beside it.
  - The Level 3 evidence is a real `<table>` with `<th scope>`.
  - Status always pairs text with an icon ("Resolved ✓" / "Still open ✗").
- **Rationale:** Native elements satisfy Constitution IV with the least code.
- **Alternatives considered:** Custom ARIA widgets add more code with more ways to break.

## R8 · Hosting

- **Decision:** All URLs are relative (`./data/levels.json`, `./engine/...`) and filenames are
  lowercase, so the game works under a GitHub Pages repository subpath.
- **Rationale:** Matches the starter plan's static-hosting requirement.
