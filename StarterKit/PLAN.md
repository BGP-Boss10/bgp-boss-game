# Network-Quest · Implementation plan

## Build target

Implement the clarified specification for Network Quest within the workshop build block. First deliver one complete round with correct grading, explanatory feedback, retry, and advance. Then add content and polish through the same implementation.

**Hardest behavior to get right:** the ordered diagnosis rule in `spec.md` → *The technical model*, in particular:
- the most-specific split between `no-relay` and `no-lease`, which depends on the server's VLAN as well as the relay setting;
- 32-bit IPv4 AND arithmetic in JavaScript, where bitwise operators return *signed* integers. Every result must be normalised with `>>> 0`, or values such as 192.x.x.x compare incorrectly.

The state rule that a repeated Submit after success changes nothing (AC6) is a close second.

**First evidence we'll check:** spec case **L1R1**. Host 169.254.33.7, mask 255.255.0.0, no gateway. Submitting `no-lease` returns `correct`; submitting `config-valid` returns `incorrect` with reason code `config-valid/no-lease`. Straight after that, case **L2R1**: host 192.168.1.130/25, gateway 192.168.1.1 returns expected `gateway-off-subnet`, with host network 192.168.1.128 and gateway network 192.168.1.0.

## Stack and serving

- Semantic HTML, CSS, and native JavaScript modules. No framework, bundler, backend, or runtime model.
- DOM controls plus SVG only where a diagram helps teach the concept. No rendering dependency by default. If choosing Three.js or another library, record its version, loading strategy, reason, and accessible alternative here before implementation.
- `data/levels.json` for authored content; load it over HTTP using a relative URL.
- In-memory session state. Reload starts a fresh session, as specified. No persistence in v1.
- Static hosting, including a repository subpath such as GitHub Pages. Use relative asset paths and case-correct filenames.

Preview from the repository root after implementation creates `index.html`:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open **http://127.0.0.1:8000**. On Windows use `py` in place of `python3`. Native modules and JSON fetching need a web server; opening the HTML with `file://` is not the supported run path. [MDN reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules).

## Proposed files and responsibilities

```text
index.html                   Semantic page shell and module entry point
style.css                    Layout, focus, feedback states, reduced motion
main.js                      Load → validate → start; render loading/errors
engine/
  rules.js                   Pure domain evaluation; no DOM or progress changes
  content.js                 Validate authored level data and source references
  state.js                   Session transitions, attempts, completion, restart
  feedback.js                Explain structured evaluation results
ui/
  render.js                  Briefing, challenge, feedback, and summary views
  controls.js                Input events and keyboard/focus behavior
data/
  levels.json                Briefings, challenges, hints, source records
tests/
  index.html                 Browser test runner with visible pass/fail summary
  rules.test.js              Independent expected results from the specification
  state.test.js              Attempts, assistance, duplicate submit, progression
  content.test.js            Invalid/missing/ambiguous authored data
README.md                    Actual run instructions, behavior, and evidence
```

Use `data/` and `tests/` at the root alongside `engine/` and `ui/`. Keep modules small enough to understand; combine view files if separate files add no value.

## Data contract

Define one document containing `schemaVersion`, `sources`, and `levels`. Each level has a unique ID, title, learning outcome, briefing, source IDs, and ordered rounds. Each round has a unique ID, domain-specific challenge, stable choice IDs where applicable, and ordered hints.

**Domain fields:**
- **Document level**
  - `schemaVersion`: integer, must equal `1`.
  - `diagnoses`: an ordered array of exactly four `{ id, label }` entries, with `id` one of `no-lease`, `no-relay`, `gateway-off-subnet`, `config-valid`. Labels are the exact wording in the spec.
  - `sources[]`: `{ id, title, url, section, claim }`. All are non-empty strings, and `url` must start with `https://`.
- **Level**
  - `id` (e.g. `L1`), `title`, `rank` (the rank title played at this level, e.g. "Service Desk (T1)"), and `promotesTo` (the rank awarded on completion; L3 awards "Senior Network Engineer (T4)").
  - `phase`: one of `foundation`, `application`, `transfer`.
  - `outcome`: one of `LO1`, `LO2`, `LO3`.
  - `briefing`: `{ text, workedExample, sourceIds[] }`.
  - `rounds[]`: exactly two.
- **Round**
  - `id` (e.g. `L2R1`), `monster` (display name), and `ticket` (the user's complaint, as a string).
  - `host`:
    - `ip`: dotted-quad string, four decimal octets each 0–255, with no leading zeros.
    - `mask`: dotted-quad string; it must be contiguous and between /8 and /30. The prefix is derived from it and never authored separately.
    - `gateway`: dotted-quad string or `null`.
  - `topology` (optional; required only for relay reasoning):
    - `clientVlan`: integer 1–4094.
    - `dhcpServer`: `{ ip, vlan: 1–4094, status: "healthy" }`.
    - `svis[]`: `{ vlan, helper: dotted-quad | null }`. It must include one entry for `clientVlan`, and may include others for context.
    - `notes[]`: display-only strings, e.g. "VLAN 20 users are fine".
  - `hints`: exactly two strings, a `method` hint then a `workedStep` hint.
  - `solution`: string (the worked solution).
  - `feedback`: an object keyed by reason code (see the evaluation contract) holding the fixed wording for each wrong choice and for `correct`.
  - `sourceIds[]`.
  - `authorExpects`: a diagnosis ID, used only as a cross-check.

**Choice representation:** a single diagnosis ID string from the document-level `diagnoses` list (`"no-lease" | "no-relay" | "gateway-off-subnet" | "config-valid"`). Every round offers all four, in the same document order, as one native radio group. The answer is the selected ID, or `null` if nothing is selected.

**Validation rules:** reject the whole file, naming the level/round ID and field path, when any of the following is true.

*Document and level structure*
- `schemaVersion` is missing or not equal to `1`.
- A required field is missing or has the wrong type.
- There are not exactly 3 levels with 2 rounds each.
- A level or round ID is duplicated, a diagnosis ID is duplicated, or a source ID is duplicated or unknown.

*Addresses and masks*
- An IP string is malformed, including an octet outside 0–255 or a leading zero.
- A mask is non-contiguous (e.g. `255.255.0.255`) or outside /8–/30.
- The host IP equals its own network or broadcast address (e.g. `192.168.1.128` in a /25).
- The gateway equals the host IP, or the gateway equals the network or broadcast address of the host's subnet.

*APIPA (169.254.0.0/16) rounds*
- The host is not in 169.254.0.0/16 and `gateway` is `null`.
- The host is in 169.254.0.0/16 and its mask is not `255.255.0.0`, or its `gateway` is not `null`.

*Topology*
- `topology` is present on a non-169.254 host. This is unsupported in v1.
- `topology` is missing `clientVlan`, `dhcpServer.vlan`, or an `svis` entry for `clientVlan`.
- `topology` contains an unknown key (for example a second helper or Option 82), so it can't be graded silently.

*Hints, feedback, and the author cross-check*
- `hints` doesn't have exactly two entries, `solution` is empty, or a `feedback` text is missing for any reason code the evaluator can produce in that round.
- `authorExpects` disagrees with `evaluate()`'s expected diagnosis. This is reported as a content error and never resolved in favour of the author (C6).

The loader must validate the whole content file before starting. Show a useful content error with the level/round ID; do not count it as a learner attempt. Briefings and hints reference source records with a title, URL, section, and supported claim. Fixed wording and per-level content live in data; numeric reasoning may be assembled from evaluator results.

Do not invent a universal quiz schema that discards the domain's real structure. Adapt the [worked example's plan](https://github.com/automateyournetwork/NAF_AC6/blob/main/WORKSHOP/LAB/Examples/PrefixQuest/PLAN.md) only if it fits your game.

## Domain evaluation contract

```text
evaluate(challenge, answer) → {
  status: "correct" | "incorrect" | "invalid-input" | "content-error",
  expected: domain-specific canonical result, or null,
  reasonCode: stable identifier for the rule/misconception,
  evidence: structured values used to explain the decision
}
```

- This is a pure function: same inputs, same result; no DOM, timer, network, random choice, or score changes.
- Compute the result from the ordered diagnosis rule below. The UI must not choose the correct answer by position, label, or animation destination.

  **Ordered diagnosis rule:**
  1. Parse each dotted quad to an unsigned 32-bit integer: `((a<<24)|(b<<16)|(c<<8)|d) >>> 0`.
  2. Compute `network(x) = (x & mask) >>> 0`.
  3. **APIPA check:** `apipa = (ip & 0xFFFF0000) >>> 0 === 0xA9FE0000` (169.254.0.0/16).
     - If `apipa` is true and `topology` shows that `dhcpServer.vlan !== clientVlan`, with the client VLAN's SVI `helper === null` → `no-relay`.
     - Otherwise, if `apipa` is true → `no-lease`.
  4. **Gateway check:** if `network(ip) !== network(gateway)` → `gateway-off-subnet`.
  5. Otherwise → `config-valid`.
- Distinguish a learner's incorrect decision from invalid input and broken authored content.
  - **`invalid-input`:** `answer` is `null`, empty, or not one of the four diagnosis IDs. Reason code `no-selection` or `unknown-choice`.
  - **`content-error`:** the challenge fails `content.js` validation. The reason code is the validation code, e.g. `mask-non-contiguous`.
  - **`incorrect`:** a valid diagnosis that differs from `expected`. The reason code is `<chosen>/<expected>`, e.g. `config-valid/gateway-off-subnet`. The one exception is choosing `no-lease` when `no-relay` is expected, which gets the reason code `no-lease-incomplete` (true but incomplete).
- Define accepted equivalent answers and reject unsupported ambiguity explicitly.
  - **Accepted answers:** exactly one diagnosis is accepted per round, namely the most specific one (the clarified spec decision). There are no equivalents.
  - **Rejected ambiguity:** any topology that the rule cannot classify is rejected as content, not graded.
- **Evidence:** `{ ip, mask, prefix, hostNetwork, hostBroadcast, gateway, gatewayNetwork, apipa, clientVlan, serverVlan, clientHelper }`. These values are given as dotted strings for display; fields that don't apply are `null`.
- Expected answers in tests come from independently reviewed cases. Don't calculate them by calling the same evaluator being tested.
  - `tests/rules.test.js` hard-codes every row of the spec's *Cases* table, with expected diagnosis, network addresses, and reason codes typed in by hand.

**Feedback example:** in L2R1 (host 192.168.1.130, mask 255.255.255.128, gateway 192.168.1.1) the player chooses `config-valid`. The result is `status: "incorrect"`, `expected: "gateway-off-subnet"`, `reasonCode: "config-valid/gateway-off-subnet"`, `evidence.hostNetwork: "192.168.1.128"`, `evidence.gatewayNetwork: "192.168.1.0"`, `prefix: 25`. The explanation shown is: *"Not quite. Matching the first three octets proves the same subnet only when the mask is /24, and this mask is /25. Next step: AND the last octet of the host (130) and of the gateway (1) with 128, then compare the results."* The text before the values comes from `feedback["config-valid/gateway-off-subnet"]` in data; `feedback.js` fills in `/25`, `130`, `1`, and `128` from `evidence`.

## Session transitions

```text
loading → briefing → awaiting-answer
                     ├─ invalid input → guidance → awaiting-answer
                     ├─ incorrect → feedback → retry same round
                     └─ correct → feedback → Next → next round/briefing/summary
loading/content failure → error screen → retry loading
confirmed Restart → fresh first briefing
```

The state module owns attempts, assistance, completed round IDs, current round, and current view. Selection and hints do not submit an answer. Count valid submissions only while a round is unsolved. Disable Submit after success; guard in state logic as well. Advance only through explicit Next. Restart requires confirmation; cancellation changes nothing.

**Network Quest specifics:**
- **Assistance** is recorded per round as the highest level reached: `none`, `method`, `worked-step`, or `solution`. Viewing help never changes completion.
- **Completing a level** is the step where Next after the second round goes to a level summary. That summary shows completed rounds, valid attempts, and assistance for each round, plus the promotion (`promotesTo`). Next then opens the following level's briefing, or after L3 the session summary.
- **Rank:** the current rank shown on screen is derived from completed levels; it is never stored separately.

## Interaction and visual direction

Translate the spec's visual metaphor (each ticket is a monster in Networklandia; a subnet is a walled town on an address ruler; the default gateway is the town gate; the DHCP server is a quartermaster; a relay is a messenger crossing the castle wall) into a compact challenge area, labeled controls, and a persistent explanation area. Use a clear type hierarchy and one consistent visual language. Motion should reveal a consequence, such as the host and gateway markers dropping onto the SVG address ruler after a Level 2 submission. An off-subnet gateway lands visibly outside the town walls, while the matching text appears at once ("Gateway 192.168.1.1 is outside 192.168.1.128–192.168.1.255").

**Layout:**
- **Challenge area:** the ticket card (monster name and ticket text), then a labeled `<dl>` "ipconfig" card.
- **Level 3 topology panel:** a small SVG with a `<table>` text equivalent beside it showing client VLAN, DHCP server VLAN and status, and the helper setting for each SVI.
- **Controls:** a `<fieldset>` radio group of the four diagnoses, then Submit, Hint, Show solution, and Next, plus Restart in the header.
- **Explanation area:** a persistent `aria-live="polite"` region below the controls (beside them on wide screens).

Monster "defeat" is shown with text and an icon change ("Resolved ✓", "Still open ✗") and is never conveyed by color or animation alone.

Use native controls where possible, move focus deliberately after screen changes, and announce feedback through a live region. Respect `prefers-reduced-motion`. Display textual values alongside diagrams. A learner must not need animation, color vision, pointer precision, or hover to reason about the answer.

## Implementation order

| Slice | Deliverable | Evidence before the next slice |
| --- | --- | --- |
| 1 · Prove the rule | Pure evaluator plus the spec's correct/wrong/boundary cases | Expected results pass independently of the UI |
| 2 · Complete one round | Briefing, challenge, feedback, retry, Next | One correct and one wrong path work in the browser |
| 3 · Add the curriculum | All scoped levels, validation, hints, session summary | Each shipped round agrees with its reviewed cases |
| 4 · Make it usable | Keyboard/focus, reduced motion, narrow layout, clear error states | Manual checks are recorded |
| 5 · Package the result | README, screenshot if available, optional hosting | Another attendee can run and explain the game |

Generate `tasks.md` from these slices and the actual acceptance criteria. Do not create a large task tree for hypothetical stretch features.

## Verification and reporting

Implement a dependency-free browser test runner at `tests/index.html` that imports the pure modules, runs all assertions, and shows totals plus failed case IDs. It must report zero discovered tests as failure. Open **http://127.0.0.1:8000/tests/** after starting the same server.

| Check | What must be established |
| --- | --- |
| Domain cases | Correct, plausible wrong, and boundary outcomes for the supported model |
| Input/content failures | Invalid submissions do not consume attempts; malformed content cannot be graded |
| State transitions | Retry, hints, duplicate submission, level completion, final summary, restart/cancel |
| Source review | Each briefing and explanation agrees with the cited technical rule |
| Browser playthrough | Fresh start to summary, keyboard-only core actions, readable feedback |
| Layout/motion | Typical laptop, narrow viewport, reduced motion |
| Hosting, if used | Assets and data load under the published repository path |

For each required acceptance criterion, record **pass / fail / not run**, the date, environment, and evidence in the README or a linked verification note. The test runner checks code behavior; a human still reviews the teaching content and actual interaction.

## Scope controls

No persistence, multiplayer, runtime AI, procedural scenario generator, editor, or audio in v1. If time runs short, propose the smallest coherent reduction to the specification and update the tasks. Do not hide skipped checks or silently weaken correctness.