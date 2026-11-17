# Implementation Plan: Adventure Presentation

**Branch**: `002-adventure-presentation` (work is on `main`) | **Date**: 2026-11-17 |
**Spec**: [spec.md](spec.md)

**Input**: [spec.md](spec.md); builds on [../001-ipv4-ticket-diagnosis/plan.md](../001-ipv4-ticket-diagnosis/plan.md)

## Summary

This feature replaces the round, briefing, and summary screens with an adventure presentation
built from original inline SVG and CSS:
- a battle stage per ticket (hero, monster, health bar, scene, hit/blocked effects);
- a move menu (the same radio group, styled as battle moves);
- a world map;
- rank-based hero gear.

The engine (`ipv4.js`, the two rules, `evaluate.js`, `state.js`) does not change. The only
engine change is that `content.js` validates four new presentation fields. The UI receives a
`fresh` flag so effects play only for a new result.

## Technical Context

**Language/Version**: HTML5, CSS3, JavaScript (ES2020 native modules), as in feature 001

**Primary Dependencies**: None. All art is inline SVG built with `ui/dom.js`

**Storage**: `data/levels.json` gains `Diagnosis.move`, `Round.art`, `Round.boss`, and
`Level.scene`

**Testing**: The existing browser runner (`tests/index.html`) adds `art.test.js` and new
content codes; `tests/playthrough.html` adds battle, map, and gear checks

**Target Platform / Project Type / Constraints**: Unchanged from feature 001 (static web game,
offline after load, relative paths, no `file://`)

**Performance Goals**: Effects of 600 ms or less; feedback text renders in the same frame as
the result (never after an animation)

**Scale/Scope**: 6 monster sprites, 3 scenes, 1 hero with 4 gear tiers, 1 map

## Constitution Check (v1.1.0)

| Principle | Plan evidence | Status |
| --- | --- | --- |
| I. Technical truth | The battle outcome is derived only from `session.lastResult.status`; no networking content changes | PASS |
| II. Teaching through decisions | Moves show the exact feature 001 labels; the battle log keeps feature 001 feedback | PASS |
| III. Honest progress | No player health or lives; monster health is a presentation of `resolved`; counters unchanged | PASS |
| IV. Access | SVG is `aria-hidden`; a visible caption states each outcome; reduced motion disables every effect; same radio group and native buttons | PASS |
| V. Self-contained | Inline SVG/CSS only; no downloads, fonts, or audio | PASS |
| VI. Content/logic separate | Art IDs, boss flags, scenes, and move names live in data and are validated; rules untouched | PASS |
| VII. Done is demonstrated | New playthrough checks and screenshots; README updated with results | PASS |

## Project Structure

```text
specs/002-adventure-presentation/   spec.md, plan.md, data-model.md, quickstart.md, tasks.md, checklists/
engine/content.js        + ART_IDS, SCENE_IDS; validate Diagnosis.move, Round.art, Round.boss, Level.scene
ui/art.js                NEW  hero (4 gear tiers), 6 monsters, 3 scene backdrops, effect glyphs
ui/battle.js             NEW  battle stage, health bar, caption, outcome classes
ui/map.js                NEW  world map SVG + text list
ui/render.js             round → battle layout and move menu; briefing + summaries gain map/hero
ui/controls.js           paint passes `fresh`; header portrait
index.html               header portrait slot; "Battle log" heading
style.css                stage, sprites, menu, map, effects (motion only under no-preference)
data/levels.json         move names, art IDs, boss flags, scenes
tests/fixtures.js        presentation fields in validDoc()
tests/content.test.js    unknown-art, unknown-scene, move missing, boss wrong type
tests/art.test.js        NEW  every ART_ID/SCENE_ID renders; hero gear per rank; aria-hidden
tests/playthrough.html   battle/map/gear checks
README.md                presentation, controls, verification results
```

## Complexity Tracking

No constitution violations. The presentation adds UI modules only.
