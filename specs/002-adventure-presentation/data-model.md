# Data Model Delta: Adventure Presentation

This extends [../001-ipv4-ticket-diagnosis/data-model.md](../001-ipv4-ticket-diagnosis/data-model.md);
everything not listed here is unchanged.

## Authored content additions

| Field | Type | Constraints | Error code |
| --- | --- | --- | --- |
| `Diagnosis.move` | string | Required, non-empty; short move name shown in the battle menu | `missing-field` / `wrong-type` |
| `Round.art` | enum | Required; one of `imp`, `sprite`, `goblin`, `troll`, `wraith`, `mimic` (`engine/content.js` `ART_IDS`) | `missing-field` / `unknown-art` |
| `Round.boss` | boolean | Optional; `true` marks the level's boss battle | `wrong-type` |
| `Level.scene` | enum | Required; one of `help-desk-gate`, `walled-towns`, `bgp-citadel` (`SCENE_IDS`) | `missing-field` / `unknown-scene` |

Every `ART_IDS` and `SCENE_IDS` entry MUST have matching art in `ui/art.js` (checked by
`tests/art.test.js`).

## Battle view state (UI only, derived and never stored)

| Value | When |
| --- | --- |
| `ready` | Round unresolved, and no graded result yet (or the last result was cleared) |
| `need-move` | Last result `invalid-input` |
| `blocked` | Last result `incorrect` (round still unresolved) |
| `defeated` | Round record `resolved` |
| `fresh` | `true` only on the paint that first shows a new `lastResult`; effects play only then |

Monster health shown = `0` if `defeated`, otherwise full. No player health exists.

## Hero gear (derived from the current rank)

| Rank | Gear tier |
| --- | --- |
| Service Desk (T1) | 1: tunic |
| NOC Engineer (T2) | 2: + headset |
| Network Engineer (T3) | 3: + cape |
| Senior Network Engineer (T4) | 4: + crown |

The tier is the 1-based position of the rank in the sequence formed by the levels' `rank`
values plus the last level's `promotesTo`.
