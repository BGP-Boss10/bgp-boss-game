// Battle stage (feature 002, AP-001/AP-004/AP-005). It shows the evaluator's result and
// never decides it (AP-014). The art is decorative; the caption states the outcome in text.
import { h } from './dom.js';
import { heroSvg, monsterSvg, sceneSvg, hitSparkSvg, shieldSvg } from './art.js';
import { currentLevel, currentRound, currentRecord, currentRank } from '../engine/state.js';

/** Hero gear tier (1–4) from the current rank: data-model.md "Hero gear". */
export function rankTier(s) {
  const levels = s.doc.levels;
  const ranks = [...levels.map((l) => l.rank), levels[levels.length - 1].promotesTo];
  const index = ranks.indexOf(currentRank(s));
  return index < 0 ? 1 : index + 1;
}

/** Battle view state: data-model.md "Battle view state". */
export function battleOutcome(s) {
  if (currentRecord(s).resolved) return 'defeated';
  const result = s.lastResult;
  if (!result) return 'ready';
  if (result.status === 'incorrect') return 'blocked';
  if (result.status === 'invalid-input') return 'need-move';
  if (result.status === 'content-error') return 'error';
  return 'ready';
}

/** Move name for a choice ID: content Diagnosis.move, or "Follow Path X". */
export function moveName(s, level, id) {
  if (level.rule === 'host-config') {
    const diagnosis = s.doc.diagnoses.find((d) => d.id === id);
    return diagnosis ? diagnosis.move : id;
  }
  return `Follow Path ${id}`;
}

function caption(s, outcome, lastMove) {
  const round = currentRound(s);
  const who = `${round.monster}${round.boss ? ' (boss)' : ''}`;
  switch (outcome) {
    case 'defeated':
      return `${who} is defeated! Monster health: 0. Ticket resolved.`;
    case 'blocked':
      return `${lastMove ? `Your ${lastMove}` : 'Your move'} was blocked! ${round.monster} still has full health. `
        + 'Read the battle log, then try another move.';
    case 'need-move':
      return `Choose a move first, then use it. ${round.monster} is waiting. Monster health: full.`;
    case 'error':
      return "This battle can't be graded because its content has an error.";
    default:
      return `NetworkSerf faces ${who}. Monster health: full. Choose a move, then use it.`;
  }
}

export function buildBattle(s, { fresh = false, lastMove = null } = {}) {
  const level = currentLevel(s);
  const round = currentRound(s);
  const outcome = battleOutcome(s);
  const hp = outcome === 'defeated' ? 0 : 100;
  const lastMoveName = lastMove ? moveName(s, level, lastMove) : null;

  let fx = null;
  if (outcome === 'defeated') {
    fx = [fresh ? hitSparkSvg() : null, h('span', { class: 'fx-text fx-hit' }, 'Defeated!')];
  } else if (outcome === 'blocked') {
    fx = [shieldSvg(), h('span', { class: 'fx-text fx-block' }, 'Blocked!')];
  }

  const stageClass = ['stage', `scene-${level.scene}`, `outcome-${outcome}`];
  if (fresh) stageClass.push('fresh');
  if (round.boss) stageClass.push('is-boss');

  return h('section', { class: 'battle', 'aria-label': 'Battle' },
    h('div', { class: stageClass.join(' '), dataset: { outcome } },
      h('div', { class: 'stage-scene' }, sceneSvg(level.scene)),
      h('div', { class: 'hud', 'aria-hidden': 'true' },
        h('div', { class: 'plate plate-hero' },
          h('strong', {}, 'NetworkSerf'),
          h('span', { class: 'plate-sub' }, currentRank(s))),
        h('div', { class: 'plate plate-monster' },
          h('div', { class: 'plate-title' },
            round.boss ? h('span', { class: 'boss-tag' }, 'Boss') : null,
            h('strong', {}, round.monster)),
          h('div', { class: 'hp' },
            h('span', { class: 'hp-label' }, `HP ${hp}`),
            h('div', { class: 'hp-track' }, h('div', { class: 'hp-fill', style: `width: ${hp}%` }))))),
      h('div', { class: 'combatant hero-slot' }, heroSvg(rankTier(s))),
      h('div', { class: 'combatant monster-slot' }, monsterSvg(round.art)),
      h('div', { class: 'fx', 'aria-hidden': 'true' }, fx)),
    h('p', { class: `battle-caption outcome-${outcome}`, id: 'battle-caption' }, caption(s, outcome, lastMoveName)));
}
