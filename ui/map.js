// The map of Networklandia (feature 002, AP-007). The SVG is decorative; the ordered list
// beside it states every location's status in text.
import { h } from './dom.js';
import { heroSvg } from './art.js';
import { rankTier } from './battle.js';
import { isLevelComplete } from '../engine/state.js';

const NS = 'http://www.w3.org/2000/svg';

export const LOCATION_NAMES = {
  'help-desk-gate': 'Help Desk Gate',
  'walled-towns': 'Walled Towns',
  'bgp-citadel': 'BGP Citadel',
};

const NODE_ART = {
  'help-desk-gate': `
    <rect x="-26" y="-30" width="52" height="40" fill="#c9bca6" stroke="#2a2620" stroke-width="3"/>
    <path d="M-12 10 V-8 Q0 -20 12 -8 V10 Z" fill="#4a3f33"/>
    <path d="M-30 -30 h10 v-8 h8 v8 h8 v-8 h8 v8 h8 v-8 h8 v8 h10" fill="none" stroke="#2a2620" stroke-width="3"/>`,
  'walled-towns': `
    <rect x="-34" y="-18" width="68" height="28" fill="#b98e62" stroke="#2a2620" stroke-width="3"/>
    <rect x="-40" y="-34" width="18" height="44" fill="#c9a66b" stroke="#2a2620" stroke-width="3"/>
    <rect x="22" y="-34" width="18" height="44" fill="#c9a66b" stroke="#2a2620" stroke-width="3"/>
    <path d="M-31 -34 V-48 l14 5 l-14 5" fill="#2e7d6b" stroke="#2a2620" stroke-width="2"/>`,
  'bgp-citadel': `
    <rect x="-24" y="-30" width="48" height="40" fill="#3d3260" stroke="#120e26" stroke-width="3"/>
    <rect x="-36" y="-44" width="16" height="54" fill="#3d3260" stroke="#120e26" stroke-width="3"/>
    <rect x="20" y="-44" width="16" height="54" fill="#3d3260" stroke="#120e26" stroke-width="3"/>
    <path d="M-36 -44 l8 -14 l8 14 Z M20 -44 l8 -14 l8 14 Z" fill="#8b1e3f" stroke="#120e26" stroke-width="2"/>
    <rect x="-5" y="-22" width="10" height="12" fill="#f3c16b"/>`,
};

function statusOf(s, i, allCleared) {
  if (allCleared || isLevelComplete(s, i)) return 'cleared';
  if (i === s.levelIndex) return 'current';
  return 'locked';
}

const STATUS_TEXT = { cleared: 'Cleared', current: 'You are here', locked: 'Locked' };

export function buildMap(s, { allCleared = false } = {}) {
  const levels = s.doc.levels;
  const n = levels.length;
  const points = levels.map((_, i) => ({
    x: n === 1 ? 320 : 100 + (i * 440) / (n - 1),
    y: i % 2 === 0 ? 150 : 98,
  }));
  const statuses = levels.map((_, i) => statusOf(s, i, allCleared));

  let road = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < n; i += 1) {
    const mid = (points[i - 1].x + points[i].x) / 2;
    road += ` Q ${mid} ${points[i - 1].y - 50} ${points[i].x} ${points[i].y}`;
  }

  const nodes = levels.map((level, i) => {
    const { x, y } = points[i];
    const st = statuses[i];
    const name = LOCATION_NAMES[level.scene] ?? level.title;
    const marker = st === 'cleared'
      ? `<g transform="translate(30 -46)"><path d="M0 0 V26" stroke="#2a2620" stroke-width="3"/><path d="M0 0 l18 6 l-18 6 Z" fill="#1d6b34" stroke="#2a2620" stroke-width="2"/></g>`
      : st === 'locked'
        ? `<g transform="translate(24 -40)"><rect x="-9" y="0" width="18" height="14" rx="2" fill="#5f574b"/><path d="M-5 0 V-5 Q0 -11 5 -5 V0" fill="none" stroke="#5f574b" stroke-width="3"/></g>`
        : '<circle r="44" fill="none" stroke="#c2410c" stroke-width="4" stroke-dasharray="8 6" class="map-pulse"/>';
    return `<g class="map-node map-${st}" transform="translate(${x} ${y})">
      <ellipse cx="0" cy="14" rx="46" ry="10" fill="rgba(0,0,0,0.12)"/>
      <g class="map-node-art">${NODE_ART[level.scene] ?? ''}</g>
      ${marker}
      <text y="44" text-anchor="middle" class="map-label">${name}</text>
    </g>`;
  }).join('');

  const svgEl = document.createElementNS(NS, 'svg');
  svgEl.setAttribute('viewBox', '0 0 640 220');
  svgEl.setAttribute('aria-hidden', 'true');
  svgEl.setAttribute('focusable', 'false');
  svgEl.setAttribute('class', 'art map-svg');
  svgEl.innerHTML = `
    <rect x="4" y="4" width="632" height="212" rx="18" fill="#efe2c2" stroke="#a88c5a" stroke-width="4"/>
    <path d="M30 196 Q120 180 200 200 M440 30 Q520 20 610 40" fill="none" stroke="#cdb98c" stroke-width="3"/>
    <path d="${road}" fill="none" stroke="#a5523b" stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round"/>
    ${nodes}`;

  // Hero token stands at the current location (or the last one when everything is cleared).
  const at = allCleared ? n - 1 : Math.min(s.levelIndex, n - 1);
  const token = heroSvg(rankTier(s), { portrait: true });
  token.setAttribute('x', String(points[at].x - 96));
  token.setAttribute('y', String(points[at].y - 38));
  token.setAttribute('width', '44');
  token.setAttribute('height', '54');
  token.classList.add('map-token');
  svgEl.append(token);

  return h('figure', { class: 'world-map' },
    h('figcaption', { class: 'map-caption' }, 'Map of Networklandia'),
    svgEl,
    h('ol', { class: 'map-list' }, levels.map((level, i) => h('li', { class: `map-item map-item-${statuses[i]}` },
      h('strong', {}, LOCATION_NAMES[level.scene] ?? level.title),
      ` (Level ${i + 1}): ${STATUS_TEXT[statuses[i]]}`))));
}
