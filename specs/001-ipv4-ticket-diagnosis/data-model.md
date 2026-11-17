# Data Model: Network-Quest First Playable

Authored content lives in `data/levels.json` (schema and validation codes in
[contracts/content.md](contracts/content.md)). Session state lives in memory
(`engine/state.js`). This file is the canonical source for field constraints.

## Authored content

### Document

| Field | Type | Constraints |
| --- | --- | --- |
| `schemaVersion` | integer | Must equal `1` |
| `diagnoses` | array of Diagnosis | Exactly 3, in display order: `no-lease`, `gateway-off-subnet`, `config-valid`; IDs unique |
| `sources` | array of Source | ≥ 1; IDs unique |
| `levels` | array of Level | Exactly 3, in play order; IDs unique |

### Diagnosis (Levels 1–2 choice)

| Field | Type | Constraints |
| --- | --- | --- |
| `id` | enum | `no-lease` \| `gateway-off-subnet` \| `config-valid` |
| `label` | string | Non-empty; exact spec wording (FR-003) |

### Source

| Field | Type | Constraints |
| --- | --- | --- |
| `id` | string | Non-empty, unique (e.g. `rfc3927-2.1`) |
| `title` | string | Non-empty |
| `url` | string | Starts with `https://` |
| `section` | string | Non-empty |
| `claim` | string | Non-empty; the specific claim it supports |

### Level

| Field | Type | Constraints |
| --- | --- | --- |
| `id` | string | `L1` \| `L2` \| `L3`, unique |
| `title` | string | Non-empty |
| `rule` | enum | `host-config` (L1, L2) \| `bgp-best-path` (L3) |
| `rank` | string | Rank played: `Service Desk (T1)`, `NOC Engineer (T2)`, `Network Engineer (T3)` |
| `promotesTo` | string | Rank awarded: `NOC Engineer (T2)`, `Network Engineer (T3)`, `Senior Network Engineer (T4)` |
| `phase` | enum | `foundation` \| `application` \| `transfer` |
| `outcome` | enum | `LO1` \| `LO2` \| `LO3` |
| `briefing` | object | `{ text, workedExample, simplifications, sourceIds[] }`; all strings non-empty; ≥ 1 known source ID |
| `rounds` | array of Round | Exactly 2 |

### Round (common fields)

| Field | Type | Constraints |
| --- | --- | --- |
| `id` | string | `L<n>R<m>`, unique across the document |
| `monster` | string | Non-empty display name |
| `ticket` | string | Non-empty user complaint |
| `hints` | object | `{ method, workedStep }`, both non-empty strings |
| `solution` | string | Non-empty worked solution |
| `feedback` | object | Keyed by `correct` and by every reason code the evaluator can produce for this round (see [contracts/evaluation.md](contracts/evaluation.md)); values non-empty |
| `sourceIds` | array of string | ≥ 1; each a known Source ID |
| `authorExpects` | string | A valid choice ID for this round; cross-check only. Must equal the evaluator's `expected`, otherwise content error `author-disagrees` |

### Round evidence — `host-config` levels

| Field | Type | Constraints |
| --- | --- | --- |
| `host.ip` | string | Dotted quad: 4 decimal octets 0–255, no leading zeros |
| `host.mask` | string | Dotted quad, contiguous, prefix /8–/30. The prefix is derived, never authored |
| `host.gateway` | string \| null | Dotted quad or `null` |

Cross-field rules:

- `host.ip` must not be its own subnet's network or broadcast address.
- If `host.gateway` is not null, it must not equal `host.ip` or the network or broadcast
  address of the host's subnet.
- If `host.ip` is in 169.254.0.0/16: `host.mask` must be `255.255.0.0` and `host.gateway` must
  be `null`.
- If `host.ip` is not in 169.254.0.0/16: `host.gateway` must not be `null`.
- `paths` and `prefix` must be absent.

### Round evidence — `bgp-best-path` level

| Field | Type | Constraints |
| --- | --- | --- |
| `prefix` | string | `a.b.c.d/n` with a valid dotted quad, `n` 8–30, and the address equal to its own network address |
| `paths` | array of Path | 2 or 3 entries; path IDs unique |

### Path

| Field | Type | Constraints |
| --- | --- | --- |
| `id` | enum | `A` \| `B` \| `C` |
| `label` | string | Non-empty (e.g. `Path A via ISP-A`) |
| `nextHop` | string | Dotted quad |
| `weight` | integer | 0–65535 |
| `localPref` | integer | 0–4294967295 |
| `asPath` | array of integer | ≥ 1 entry; each 1–4294967295. Length is derived. First entry is the neighbouring AS |
| `origin` | enum | `igp` \| `egp` \| `incomplete` |
| `med` | integer | 0–4294967295 |

Cross-field rules (the evaluator's BGP rule must produce a single winner):

- The paths must not tie on every modelled attribute (`bgp-full-tie`).
- If the decision reaches MED, all surviving paths must share `asPath[0]`
  (`bgp-med-cross-as`).
- `host` must be absent.

## Session state (in memory)

### Session

| Field | Type | Notes |
| --- | --- | --- |
| `view` | enum | `loading` \| `content-error` \| `briefing` \| `round` \| `level-summary` \| `session-summary` |
| `levelIndex` | integer | 0–2 |
| `roundIndex` | integer | 0–1 |
| `selection` | string \| null | Currently selected choice ID; not submitted until Submit |
| `lastResult` | Evaluation result \| null | Shown in the explanation region |
| `records` | map of Round ID → Round record | One per round |
| `confirmingRestart` | boolean | True while the Restart dialog is open |

**Derived (never stored):**

- Current rank: the `promotesTo` of the last completed level, or `Service Desk (T1)` if none.
- Level complete: both of its rounds are resolved.

### Round record

| Field | Type | Notes |
| --- | --- | --- |
| `attempts` | integer ≥ 0 | Valid submissions made while the round was unresolved |
| `assistance` | enum | Highest help level reached while unresolved: `none` < `method` < `worked-step` < `solution` |
| `resolved` | boolean | Set once; never unset except by Restart |

## State transitions

```text
loading ──ok──▶ briefing(L1)
loading ──content errors──▶ content-error ──Retry──▶ loading

briefing(Ln) ──Start──▶ round(Ln, R1)

round, unresolved:
  select(choice)          → selection = choice                (no counters change)
  submit, invalid-input   → lastResult = guidance             (attempts unchanged)
  submit, incorrect       → attempts += 1; lastResult = result (round stays open)
  submit, correct         → attempts += 1; resolved = true; Next enabled
  help(level)             → assistance = max(assistance, level)

round, resolved:
  submit (any)            → no change (Submit is also disabled in the UI)
  help(level)             → shown, not recorded

round(Ln, R1) resolved ──Next──▶ round(Ln, R2)
round(Ln, R2) resolved ──Next──▶ level-summary(Ln)   (shows promotion to Ln.promotesTo)
level-summary(L1|L2)   ──Next──▶ briefing(Ln+1)
level-summary(L3)      ──Next──▶ session-summary

any view ──Restart──▶ confirmingRestart = true
  Confirm → fresh session at briefing(L1) (all records cleared)
  Cancel  → confirmingRestart = false; nothing else changes
```

Reload creates a fresh session (FR-017).

## Evaluation result

Defined in [contracts/evaluation.md](contracts/evaluation.md):

- `status`: `correct` | `incorrect` | `invalid-input` | `content-error`
- `expected`: the expected choice ID, or `null`
- `reasonCode`: a stable code
- `evidence`: rule-specific values
