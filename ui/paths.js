// Level 3 evidence: the candidate path table and, once resolved, the elimination trace
// (spec FR-002, FR-027). Both are real HTML (table / ordered list), so they are their own
// text equivalents.
import { h } from './dom.js';
import { originLabel } from '../engine/rule-bgp.js';

// The next hop has its own column, so drop a trailing "(198.51.100.1)" from the row header.
const shortLabel = (label) => label.replace(/\s*\(\d{1,3}(?:\.\d{1,3}){3}\)\s*$/, '');

export function buildPathTable(round) {
  const caption = `Candidate paths to ${round.prefix}`;
  return h('section', { class: 'evidence', 'aria-labelledby': 'evidence-heading' },
    h('h3', { id: 'evidence-heading' }, 'BGP table'),
    h('p', { class: 'evidence-prefix' }, 'Destination prefix: ', h('strong', {}, round.prefix)),
    h('p', { class: 'scroll-hint', 'aria-hidden': 'true' }, 'Scroll the table sideways to see every column →'),
    h('div', {
      class: 'table-region', role: 'region', 'aria-label': caption, tabindex: '0',
    },
    h('table', { class: 'path-table' },
      h('caption', { class: 'visually-hidden' }, caption),
      h('thead', {}, h('tr', {},
        ['Path', 'Next hop', 'Weight', 'Local pref', 'AS path (length)', 'Origin', 'MED']
          .map((label) => h('th', { scope: 'col' }, label)))),
      h('tbody', {}, round.paths.map((p) => h('tr', {},
        h('th', { scope: 'row' }, shortLabel(p.label)),
        h('td', {}, p.nextHop),
        h('td', {}, String(p.weight)),
        h('td', {}, String(p.localPref)),
        h('td', { class: 'nowrap' }, `${p.asPath.join(' ')} (${p.asPath.length})`),
        h('td', {}, originLabel(p.origin)),
        h('td', {}, String(p.med))))))));
}

function stepSentence(step, before) {
  const values = before.map((id) => `${id} ${step.shown[id]}`).join(', ');
  const dropped = before.filter((id) => !step.survivors.includes(id));
  let outcome;
  if (dropped.length === 0) outcome = 'a tie, so every path stays in.';
  else if (step.survivors.length === 1) {
    outcome = `${dropped.join(' and ')} ${dropped.length === 1 ? 'drops' : 'drop'} out, so Path ${step.survivors[0]} wins.`;
  } else outcome = `${dropped.join(' and ')} ${dropped.length === 1 ? 'drops' : 'drop'} out.`;
  const label = step.label.charAt(0).toUpperCase() + step.label.slice(1);
  return `${label}: ${values}: ${outcome}`;
}

export function buildTrace(evidence, round) {
  let before = round.paths.map((p) => p.id);
  const items = evidence.steps.map((step) => {
    const sentence = stepSentence(step, before);
    const out = before.filter((id) => !step.survivors.includes(id));
    before = step.survivors;
    return h('li', { class: `trace-step${out.length ? ' has-drop' : ''}` }, sentence);
  });
  return h('section', { class: 'trace', 'aria-labelledby': 'trace-heading' },
    h('h3', { id: 'trace-heading' }, 'How the router decided'),
    h('ol', { class: 'trace-list' }, items),
    h('p', { class: 'trace-note' }, 'Attributes after the deciding step are never compared.'));
}
