// Views: loading, content error, briefing, round, level summary, session summary.
// Rendering only — all decisions come from engine/state.js and engine/evaluate.js.
import { h } from './dom.js';
import { buildRuler } from './ruler.js';
import { buildPathTable, buildTrace } from './paths.js';
import { buildBattle, moveName, rankTier } from './battle.js';
import { buildMap } from './map.js';
import { heroSvg, icon } from './art.js';
import { explain } from '../engine/feedback.js';
import { choiceIdsFor } from '../engine/evaluate.js';
import { decideBgp } from '../engine/rule-bgp.js';
import { parseIp, maskToPrefix } from '../engine/ipv4.js';
import {
  currentLevel, currentRound, currentRecord, currentRank, levelStats, nextHintLevel, HELP_LEVELS,
} from '../engine/state.js';

const HELP_LABEL = {
  none: 'None',
  method: 'Method hint',
  'worked-step': 'Worked step',
  solution: 'Worked solution',
};

const STATUS = {
  correct: { cls: 'status-resolved', text: 'Resolved ✓' },
  incorrect: { cls: 'status-open', text: 'Still open ✗' },
  'invalid-input': { cls: 'status-info', text: 'Not submitted' },
  'content-error': { cls: 'status-warn', text: "Can't be graded ⚠" },
};

const heading = (text) => h('h2', { id: 'view-heading', tabindex: '-1' }, text);

function sourceList(doc, ids) {
  const byId = new Map(doc.sources.map((src) => [src.id, src]));
  return h('ul', { class: 'source-list' }, ids.map((id) => {
    const src = byId.get(id);
    return h('li', {},
      h('a', { href: src.url, rel: 'noopener noreferrer', target: '_blank' }, src.title),
      ` — ${src.section}. `,
      h('span', { class: 'muted' }, src.claim));
  }));
}

// ---------------------------------------------------------------- simple views

export function loadingView() {
  return h('section', { class: 'panel' }, heading('Loading tickets…'), h('p', {}, 'Fetching the ticket queue.'));
}

export function contentErrorView(errors, message) {
  return h('section', { class: 'panel panel-error' },
    heading("This game's content has errors"),
    h('p', {}, message ?? "The game can't start because data/levels.json failed validation. "
      + 'No ticket was graded and nothing was counted. This is an authoring problem, not a player mistake.'),
    errors.length ? h('ul', { class: 'error-list' }, errors.map((e) => h('li', {},
      h('code', {}, e.code), ' at ', h('code', {}, e.path), e.roundId ? ` (round ${e.roundId})` : ''))) : null,
    h('button', { type: 'button', class: 'btn btn-primary', id: 'retry-button', dataset: { action: 'retry-load' } },
      'Retry loading'));
}

function briefingView(s) {
  const level = currentLevel(s);
  const n = s.levelIndex + 1;
  return h('section', { class: 'panel briefing' },
    h('p', { class: 'eyebrow' }, `Level ${n} of ${s.doc.levels.length} · Quest briefing`),
    heading(`Level ${n}: ${level.title}`),
    buildMap(s),
    h('p', { class: 'role-line' }, 'You are playing as ', h('strong', {}, level.rank), '.'),
    h('p', {}, level.briefing.text),
    h('h3', {}, 'Worked example'),
    h('p', { class: 'worked-example' }, level.briefing.workedExample),
    h('h3', {}, 'What this level simplifies'),
    h('p', {}, level.briefing.simplifications),
    h('h3', {}, 'Sources'),
    sourceList(s.doc, level.briefing.sourceIds),
    h('div', { class: 'actions' },
      h('button', { type: 'button', class: 'btn btn-primary', id: 'start-button', dataset: { action: 'start' } },
        `Begin Level ${n}`)));
}

// ---------------------------------------------------------------- round view

function ipconfigCard(round) {
  const prefix = maskToPrefix(parseIp(round.host.mask));
  return h('section', { class: 'evidence', 'aria-labelledby': 'evidence-heading' },
    h('h3', { id: 'evidence-heading' }, 'ipconfig'),
    h('div', { class: 'table-region', role: 'region', 'aria-label': 'ipconfig output for the affected host', tabindex: '0' },
      h('dl', { class: 'ipconfig' },
        h('dt', {}, 'IPv4 Address'), h('dd', {}, round.host.ip),
        h('dt', {}, 'Subnet Mask'), h('dd', {}, `${round.host.mask} (/${prefix})`),
        h('dt', {}, 'Default Gateway'), h('dd', {}, round.host.gateway ?? '(none)'))));
}

function choiceLabel(s, level, round, id) {
  if (level.rule === 'host-config') return s.doc.diagnoses.find((d) => d.id === id).label;
  return round.paths.find((p) => p.id === id).label;
}

function choicesFieldset(s, level, round, resolved) {
  const legend = level.rule === 'host-config'
    ? 'Choose your move: which diagnosis does the evidence prove?'
    : 'Choose your move: which path will the router select?';
  return h('fieldset', { class: 'choices moves' },
    h('legend', {}, legend),
    choiceIdsFor(level, round).map((id) => {
      const inputId = `choice-${id}`;
      const iconName = level.rule === 'host-config' ? id : 'path';
      return h('div', { class: 'choice move' },
        h('input', {
          type: 'radio', name: 'choice', id: inputId, value: id,
          checked: s.selection === id, disabled: resolved,
        }),
        h('label', { for: inputId },
          h('span', { class: 'move-icon' }, icon(iconName)),
          h('span', { class: 'move-text' },
            h('strong', { class: 'move-name' }, moveName(s, level, id)),
            h('span', { class: 'move-label' }, choiceLabel(s, level, round, id)))));
    }));
}

const withIcon = (name, text) => [h('span', { class: 'btn-icon' }, icon(name)), text];

function helpPanel(s, round) {
  const shown = s.helpShown[round.id] ?? 'none';
  const rank = HELP_LEVELS.indexOf(shown);
  if (rank < 1) return null;
  return h('section', { class: 'help-panel', 'aria-labelledby': 'help-heading' },
    h('h3', { id: 'help-heading' }, 'Help'),
    h('dl', {},
      h('dt', {}, 'Method'), h('dd', {}, round.hints.method),
      rank >= 2 ? [h('dt', {}, 'Worked step'), h('dd', {}, round.hints.workedStep)] : null,
      rank >= 3 ? [h('dt', {}, 'Worked solution'), h('dd', {}, round.solution)] : null));
}

function roundView(s, opts) {
  const level = currentLevel(s);
  const round = currentRound(s);
  const record = currentRecord(s);
  const resolved = record.resolved;
  const hintLevel = nextHintLevel(s);
  const solutionShown = (s.helpShown[round.id] ?? 'none') === 'solution';
  const ticketStatus = resolved ? STATUS.correct : { cls: 'status-open', text: 'Open' };

  let reveal = null;
  if (resolved && level.rule === 'host-config' && round.host.gateway !== null) reveal = buildRuler(round.host);
  if (resolved && level.rule === 'bgp-best-path') reveal = buildTrace(decideBgp(round).evidence, round);

  return h('section', { class: 'panel round' },
    h('p', { class: 'eyebrow' }, `Level ${s.levelIndex + 1}: ${level.title}`),
    heading(`Battle ${s.roundIndex + 1}: ${round.monster}`),
    h('ul', { class: 'status-bar', 'aria-label': 'Progress' },
      h('li', {}, 'Rank: ', h('strong', {}, currentRank(s))),
      h('li', {}, `Round ${s.roundIndex + 1} of ${level.rounds.length}`),
      h('li', {}, `Attempts: ${record.attempts}`),
      h('li', {}, `Help used: ${HELP_LABEL[record.assistance]}`)),
    buildBattle(s, opts),
    h('article', { class: `ticket-card ${resolved ? 'is-defeated' : ''}` },
      h('p', { class: 'ticket-from' }, `Ticket carried by ${round.monster}`),
      h('blockquote', { class: 'ticket-text' }, h('p', {}, round.ticket)),
      h('p', { class: `ticket-status ${ticketStatus.cls}` }, ticketStatus.text)),
    level.rule === 'host-config' ? ipconfigCard(round) : buildPathTable(round),
    h('form', { id: 'answer-form', class: 'answer-form battle-menu', novalidate: true },
      choicesFieldset(s, level, round, resolved),
      h('div', { class: 'actions battle-actions' },
        h('button', { type: 'submit', class: 'btn btn-primary btn-attack', id: 'submit-button', disabled: resolved },
          withIcon('attack', 'Use move')),
        h('button', {
          type: 'button', class: 'btn btn-item', id: 'hint-button', dataset: { action: 'hint' }, disabled: hintLevel === null,
        }, withIcon('scout', hintLevel === 'worked-step' ? "Scout's next hint" : "Scout's hint")),
        h('button', {
          type: 'button', class: 'btn btn-item', id: 'solution-button', dataset: { action: 'solution' }, disabled: solutionShown,
        }, withIcon('scroll', "Sage's scroll")),
        h('button', {
          type: 'button', class: 'btn btn-next', id: 'next-button', dataset: { action: 'next' }, disabled: !resolved,
        }, withIcon('next', s.roundIndex < level.rounds.length - 1 ? 'Next battle' : 'Finish level')))),
    helpPanel(s, round),
    reveal);
}

// ---------------------------------------------------------------- summaries

const GEAR_LINES = {
  1: 'NetworkSerf wears the Service Desk tunic.',
  2: 'New gear: the NOC headset.',
  3: "New gear: the Network Engineer's cape.",
  4: 'New gear: the Senior Network Engineer crown.',
};
const gearLine = (tier) => GEAR_LINES[tier] ?? '';

function levelSummaryView(s) {
  const stats = levelStats(s, s.levelIndex);
  const last = s.levelIndex === s.doc.levels.length - 1;
  return h('section', { class: 'panel summary' },
    h('p', { class: 'eyebrow' }, `Level ${s.levelIndex + 1} complete`),
    heading(`${stats.title}: cleared`),
    h('div', { class: 'victory' },
      h('div', { class: `victory-hero hero-tier-${rankTier(s)}` }, heroSvg(rankTier(s))),
      h('div', { class: 'victory-text' },
        h('p', { class: 'promotion' }, 'Promoted to ', h('strong', {}, stats.promotesTo), '!'),
        h('p', { class: 'muted' }, gearLine(rankTier(s))))),
    h('div', { class: 'table-region', role: 'region', 'aria-label': 'Tickets in this level', tabindex: '0' },
      h('table', { class: 'summary-table' },
        h('caption', {}, 'Your tickets in this level'),
        h('thead', {}, h('tr', {}, ['Ticket', 'Resolved', 'Valid attempts', 'Help used']
          .map((t) => h('th', { scope: 'col' }, t)))),
        h('tbody', {}, stats.rounds.map((r) => h('tr', {},
          h('th', { scope: 'row' }, r.monster),
          h('td', {}, r.resolved ? 'Yes ✓' : 'No'),
          h('td', {}, String(r.attempts)),
          h('td', {}, HELP_LABEL[r.assistance])))))),
    h('div', { class: 'actions' },
      h('button', { type: 'button', class: 'btn btn-primary', id: 'continue-button', dataset: { action: 'next' } },
        last ? 'See session summary' : `Continue to Level ${s.levelIndex + 2}`)));
}

function sessionSummaryView(s) {
  const all = s.doc.levels.map((_, i) => levelStats(s, i));
  return h('section', { class: 'panel summary' },
    h('p', { class: 'eyebrow' }, 'Session complete'),
    heading('Session summary'),
    h('div', { class: 'victory' },
      h('div', { class: `victory-hero hero-tier-${rankTier(s)}` }, heroSvg(rankTier(s))),
      h('div', { class: 'victory-text' },
        h('p', { class: 'promotion' }, 'Quest complete! NetworkSerf is now ', h('strong', {}, currentRank(s)), '.'),
        h('p', { class: 'muted' }, gearLine(rankTier(s))))),
    buildMap(s, { allCleared: true }),
    h('div', { class: 'table-region', role: 'region', 'aria-label': 'Results by level', tabindex: '0' },
      h('table', { class: 'summary-table' },
        h('caption', {}, 'Results by level'),
        h('thead', {}, h('tr', {}, ['Level', 'Tickets resolved', 'Valid attempts', 'Tickets where help was used']
          .map((t) => h('th', { scope: 'col' }, t)))),
        h('tbody', {}, all.map((st) => h('tr', {},
          h('th', { scope: 'row' }, `${st.id}: ${st.title}`),
          h('td', {}, `${st.completed} of ${st.total}`),
          h('td', {}, String(st.attempts)),
          h('td', {}, `${st.roundsWithHelp} of ${st.total}`)))))),
    h('p', { class: 'muted' }, 'These figures are kept separate on purpose. Resolving every ticket shows you finished the game; '
      + 'it does not by itself prove independent mastery, which is why attempts and help are listed too.'),
    h('div', { class: 'actions' },
      h('button', { type: 'button', class: 'btn btn-primary', id: 'play-again-button', dataset: { action: 'restart' } },
        'Play again')));
}

// ---------------------------------------------------------------- explanation region

export function explanationContent(s) {
  const result = s && s.view === 'round' ? s.lastResult : null;
  if (!result) return [];
  const status = STATUS[result.status];
  return [
    h('p', { class: `explanation-status ${status.cls}` }, status.text),
    h('p', { class: 'explanation-text' }, explain(currentRound(s), result)),
  ];
}

// ---------------------------------------------------------------- dispatcher

export function viewKey(s) {
  if (!s) return 'none';
  return `${s.view}:${s.levelIndex}:${s.view === 'round' ? s.roundIndex : '-'}`;
}

export function buildView(s, opts = {}) {
  switch (s.view) {
    case 'briefing': return briefingView(s);
    case 'round': return roundView(s, opts);
    case 'level-summary': return levelSummaryView(s);
    case 'session-summary': return sessionSummaryView(s);
    default: return loadingView();
  }
}
