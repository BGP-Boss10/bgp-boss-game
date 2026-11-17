# Contract: `data/levels.json` and `validateContent(doc)`

Module: `engine/content.js`. Field constraints are defined in [../data-model.md](../data-model.md).
This contract fixes the document shape and the error codes.

```text
validateContent(doc) → { ok: true } | { ok: false, errors: [ { code, path, roundId? } ] }
```

- The whole document is validated before the first briefing.
- Any error shows the content-error screen, listing each error's round ID (if any), field path,
  and code. Nothing is graded and no progress is recorded.

## Shape (abridged)

```json
{
  "schemaVersion": 1,
  "diagnoses": [
    { "id": "no-lease", "label": "No DHCP lease: the host self-assigned a 169.254.x.x address" },
    { "id": "gateway-off-subnet", "label": "Default gateway is outside the host's subnet" },
    { "id": "config-valid", "label": "Host IP settings are valid; escalate to the next check" }
  ],
  "sources": [ { "id": "rfc3927-2.1", "title": "...", "url": "https://...", "section": "§2.1", "claim": "..." } ],
  "levels": [
    {
      "id": "L1", "title": "...", "rule": "host-config",
      "rank": "Service Desk (T1)", "promotesTo": "NOC Engineer (T2)",
      "phase": "foundation", "outcome": "LO1",
      "briefing": { "text": "...", "workedExample": "...", "simplifications": "...", "sourceIds": ["rfc3927-2.1"] },
      "rounds": [
        {
          "id": "L1R1", "monster": "...", "ticket": "...",
          "host": { "ip": "169.254.33.7", "mask": "255.255.0.0", "gateway": null },
          "hints": { "method": "...", "workedStep": "..." },
          "solution": "...",
          "feedback": { "correct": "...", "config-valid/no-lease": "...", "gateway-off-subnet/no-lease": "..." },
          "sourceIds": ["rfc3927-2.1"],
          "authorExpects": "no-lease"
        }
      ]
    },
    {
      "id": "L3", "rule": "bgp-best-path",
      "rounds": [
        {
          "id": "L3R1",
          "prefix": "203.0.113.0/24",
          "paths": [
            { "id": "A", "label": "Path A via ISP-A", "nextHop": "198.51.100.1", "weight": 0, "localPref": 100, "asPath": [64501, 64510], "origin": "igp", "med": 0 },
            { "id": "B", "label": "Path B via ISP-B", "nextHop": "198.51.100.5", "weight": 0, "localPref": 200, "asPath": [64502, 64520, 64510], "origin": "igp", "med": 0 }
          ],
          "feedback": { "correct": "...", "A/lost-local-pref": "..." },
          "authorExpects": "B"
        }
      ]
    }
  ]
}
```

## Validation codes

| Code | Condition |
| --- | --- |
| `schema-version` | `schemaVersion` missing or ≠ 1 |
| `missing-field` / `wrong-type` | A required field is missing or has the wrong type |
| `level-count` / `round-count` | Not exactly 3 levels / not exactly 2 rounds in a level |
| `duplicate-id` | Duplicate level, round, diagnosis, source, or path ID |
| `unknown-source` | `sourceIds` references a missing source |
| `bad-url` | Source URL does not start with `https://` |
| `unknown-rule` | `rule` not `host-config` or `bgp-best-path` |
| `wrong-evidence` | A host round has `paths`/`prefix`, or a BGP round has `host` |
| `ip-malformed` | Dotted quad invalid (octet out of range, leading zero, wrong count) |
| `mask-non-contiguous` | Mask is not contiguous (e.g. 255.255.0.255) |
| `mask-out-of-range` | Prefix outside /8–/30 |
| `host-is-network` / `host-is-broadcast` | Host equals its subnet's network or broadcast address |
| `gateway-invalid` | Gateway equals the host, or its subnet's network or broadcast address |
| `apipa-shape` | 169.254 host whose mask isn't 255.255.0.0, or that has a gateway |
| `gateway-missing` | Non-169.254 host with `gateway: null` |
| `prefix-malformed` | BGP `prefix` invalid or not a network address |
| `path-count` | Fewer than 2 or more than 3 paths |
| `path-attribute` | A path attribute is missing, out of range, or has an unknown `origin` |
| `bgp-full-tie` | Paths tie on every modelled attribute |
| `bgp-med-cross-as` | The decision reaches MED with survivors from different neighbouring ASes |
| `hints-shape` / `solution-empty` | Hints not `{method, workedStep}` with non-empty strings, or empty solution |
| `feedback-missing` | No wording for `correct` or for a reason code the evaluator can produce in this round (checked by evaluating every choice) |
| `author-disagrees` | `authorExpects` ≠ the evaluator's `expected`. Never resolved in the author's favour |
| `unknown-art` / `unknown-scene` | (Feature 002) `Round.art` or `Level.scene` is not a known art/scene ID; see `specs/002-adventure-presentation/data-model.md` |

## Test obligations

`tests/content.test.js` builds a minimal valid document and, for each code above, a mutated copy
that must fail with exactly that code and the right path. It also asserts that the shipped
`data/levels.json` validates with zero errors.
