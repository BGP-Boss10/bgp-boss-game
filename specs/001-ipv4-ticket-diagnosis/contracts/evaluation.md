# Contract: `evaluate(level, round, answer)`

Module: `engine/evaluate.js`. It dispatches on `level.rule` to `engine/rule-host.js` or
`engine/rule-bgp.js`.

```text
evaluate(level, round, answer) → {
  status:     "correct" | "incorrect" | "invalid-input" | "content-error",
  expected:   choice ID | null,
  reasonCode: string,
  evidence:   object | null
}
```

## Guarantees

- **Pure:** the same inputs always give the same result. No DOM, timers, network, randomness,
  or state changes.
- The UI never picks the correct answer by position, label, or animation target. Only
  `expected` decides.
- Checks run in this order:
  1. **Content validation for this round.** On failure: `content-error` with the validation
     code ([content.md](content.md)), `expected: null`.
  2. **Input check.** If `answer` is `null`/empty → `invalid-input`, `no-selection`. If it is
     not one of this round's choice IDs → `invalid-input`, `unknown-choice`.
  3. **Rule.** Compute `expected`. If `answer === expected` → `correct`, reason code `correct`.
     Otherwise → `incorrect` with a rule-specific reason code.

## Host-configuration rule (`host-config`, Levels 1–2)

**Ordered rule** (all arithmetic unsigned 32-bit, see research R2):

1. If the host is in 169.254.0.0/16 → `no-lease`.
2. Else if `network(ip) !== network(gateway)` → `gateway-off-subnet`.
3. Else → `config-valid`.

**Incorrect reason code:** `<chosen>/<expected>`, e.g. `config-valid/gateway-off-subnet`.

**Evidence** (dotted strings for display; `null` where not applicable):

```text
{ ip, mask, prefix, hostNetwork, hostBroadcast, gateway, gatewayNetwork, apipa }
```

**Example (L2R1):** host `192.168.1.130`, mask `255.255.255.128`, gateway `192.168.1.1`, answer
`config-valid` returns:

```text
{ status: "incorrect", expected: "gateway-off-subnet",
  reasonCode: "config-valid/gateway-off-subnet",
  evidence: { prefix: 25, hostNetwork: "192.168.1.128", hostBroadcast: "192.168.1.255",
              gatewayNetwork: "192.168.1.0", apipa: false, ... } }
```

## BGP best-path rule (`bgp-best-path`, Level 3)

**Elimination steps**, in order. Each step keeps only the survivors with the best value:

| Step ID | Attribute | Better |
| --- | --- | --- |
| `weight` | `weight` | higher |
| `local-pref` | `localPref` | higher |
| `as-path` | `asPath.length` | lower |
| `origin` | `origin` (igp=0, egp=1, incomplete=2) | lower |
| `med` | `med`, only if all survivors share `asPath[0]` | lower |

- The first step that leaves exactly one survivor gives `expected`.
- If the `med` step is reached and the survivors have different `asPath[0]` → `content-error`,
  `bgp-med-cross-as`.
- If more than one survivor remains after `med` → `content-error`, `bgp-full-tie`.

**Incorrect reason code:** `<chosenPathId>/lost-<step>`, where `<step>` is the step at which the
chosen path was eliminated (e.g. `C/lost-as-path`, `A/lost-origin`).

**Evidence:**

```text
{
  steps: [ { step, values: { A: v, B: v, ... }, survivors: [ids] }, ... ],  // up to the deciding step
  decidingStep,                // step ID
  eliminatedAt: { pathId: step, ... },
  neighbourAs: { pathId: asPath[0], ... }
}
```

**Example (L3R2):** answer `C` returns:

```text
{ status: "incorrect", expected: "B", reasonCode: "C/lost-as-path",
  evidence: { decidingStep: "origin",
              eliminatedAt: { C: "as-path", A: "origin" },
              steps: [ { step: "weight",     values: {A:0,B:0,C:0},       survivors: ["A","B","C"] },
                       { step: "local-pref", values: {A:100,B:100,C:100}, survivors: ["A","B","C"] },
                       { step: "as-path",    values: {A:2,B:2,C:3},       survivors: ["A","B"] },
                       { step: "origin",     values: {A:2,B:0},           survivors: ["B"] } ] } }
```

## Feedback composition (`engine/feedback.js`)

```text
explain(round, result) → string
```

- The wording comes from `round.feedback[result.reasonCode]` (or `feedback.correct`).
- Placeholders such as `{prefix}`, `{hostNetwork}`, and `{decidingStep}` are filled from
  `result.evidence`.
- For `invalid-input`, fixed guidance is used ("Choose one option, then Submit.").
- For `content-error`, a fixed message names the round ID and code. It never blames the
  learner.

## Test obligations

- `tests/rule-host.test.js` and `tests/rule-bgp.test.js` hard-code every row of the spec's
  Reference Cases table: expected choice, reason code, and the key evidence values (network
  addresses, deciding step, eliminated-at steps). Expected values are typed by hand, never
  computed by the evaluator under test.
