// Level 2 address ruler (spec FR-027): the host's subnet drawn as a walled town on an
// address line, with host and gateway markers. The visible sentence below the drawing is
// the text equivalent; the SVG itself is decorative for assistive technology.
import { h, s } from './dom.js';
import { parseIp, formatIp, network, broadcast, maskToPrefix } from '../engine/ipv4.js';

export function rulerSentence(host) {
  const ip = parseIp(host.ip);
  const mask = parseIp(host.mask);
  const gateway = parseIp(host.gateway);
  const range = `${formatIp(network(ip, mask))}–${formatIp(broadcast(ip, mask))}`;
  const inside = network(gateway, mask) === network(ip, mask);
  return `Host ${host.ip} is inside ${range}. Gateway ${host.gateway} is ${inside ? 'inside' : 'outside'} ${range}`
    + (inside ? '.' : `; under this mask it belongs to ${formatIp(network(gateway, mask))}/${maskToPrefix(mask)}.`);
}

export function buildRuler(host) {
  const ip = parseIp(host.ip);
  const mask = parseIp(host.mask);
  const gateway = parseIp(host.gateway);
  const net = network(ip, mask);
  const bcast = broadcast(ip, mask);
  const size = bcast - net + 1;
  const gwNet = network(gateway, mask);
  const gwBcast = broadcast(gateway, mask);
  const lo = Math.max(0, Math.min(net - size, gwNet));
  const hi = Math.min(0xffffffff, Math.max(bcast + size, gwBcast));
  const left = 24;
  const width = 552;
  const x = (addr) => left + ((addr - lo) / (hi - lo)) * width;
  const inside = gwNet === net;

  const wallX = x(net);
  const wallW = Math.max(6, x(bcast) - wallX);
  const hostX = x(ip);
  const gwX = x(gateway);

  const svg = s('svg', {
    class: 'ruler-svg', viewBox: '0 0 600 160', 'aria-hidden': 'true', focusable: 'false',
  },
  s('line', { x1: left, y1: 110, x2: left + width, y2: 110, class: 'ruler-axis' }),
  s('rect', { x: wallX, y: 58, width: wallW, height: 52, class: 'ruler-town' }),
  s('text', { x: wallX + wallW / 2, y: 50, 'text-anchor': 'middle', class: 'ruler-label' },
    `Host's town ${formatIp(net)}/${maskToPrefix(mask)}`),
  s('g', { class: 'ruler-marker ruler-host' },
    s('circle', { cx: hostX, cy: 96, r: 7 }),
    s('text', { x: hostX, y: 82, 'text-anchor': 'middle', class: 'ruler-label' }, 'Host')),
  s('g', { class: `ruler-marker ruler-gateway ${inside ? 'is-inside' : 'is-outside'}` },
    s('rect', { x: gwX - 7, y: 89, width: 14, height: 14 }),
    s('text', { x: gwX, y: 130, 'text-anchor': gwX < 60 ? 'start' : 'middle', class: 'ruler-label' }, 'Gateway')),
  s('text', { x: left, y: 156, class: 'ruler-tick' }, formatIp(lo)),
  s('text', { x: left + width, y: 156, 'text-anchor': 'end', class: 'ruler-tick' }, formatIp(hi)));

  return h('figure', { class: 'ruler' },
    h('figcaption', { class: 'ruler-caption' }, 'Address ruler'),
    svg,
    h('p', { class: 'ruler-text' }, rulerSentence(host)));
}
