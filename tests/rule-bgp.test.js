// Spec Reference Cases for Level 3, the weight/MED boundaries and unsupported BGP content.
import { test, assertEqual, assertDeepEqual } from './runner.js';
import { evaluate } from '../engine/evaluate.js';
import {
  BGP_LEVEL, L3R1, L3R2, WEIGHT_BOUNDARY, MED_BOUNDARY, FULL_TIE, MED_CROSS_AS, bgpRound, path,
} from './fixtures.js';

test('L3R1-correct', () => {
  const r = evaluate(BGP_LEVEL, L3R1(), 'B');
  assertEqual(r.status, 'correct');
  assertEqual(r.expected, 'B');
  assertEqual(r.evidence.decidingStep, 'local-pref');
  assertDeepEqual(r.evidence.eliminatedAt, { A: 'local-pref' });
});

test('L3R1-mistake-A', () => {
  const r = evaluate(BGP_LEVEL, L3R1(), 'A');
  assertEqual(r.status, 'incorrect');
  assertEqual(r.reasonCode, 'A/lost-local-pref');
});

test('L3R2-correct', () => {
  const r = evaluate(BGP_LEVEL, L3R2(), 'B');
  assertEqual(r.status, 'correct');
  assertEqual(r.expected, 'B');
  assertEqual(r.evidence.decidingStep, 'origin');
  assertDeepEqual(r.evidence.eliminatedAt, { C: 'as-path', A: 'origin' });
  assertDeepEqual(r.evidence.steps.map((s) => s.step), ['weight', 'local-pref', 'as-path', 'origin']);
  assertDeepEqual(r.evidence.steps.map((s) => s.survivors), [['A', 'B', 'C'], ['A', 'B', 'C'], ['A', 'B'], ['B']]);
  assertDeepEqual(r.evidence.steps[2].values, { A: 2, B: 2, C: 3 });
  assertDeepEqual(r.evidence.steps[3].values, { A: 2, B: 0 });
});

test('L3R2-mistake-C', () => {
  const r = evaluate(BGP_LEVEL, L3R2(), 'C');
  assertEqual(r.status, 'incorrect');
  assertEqual(r.expected, 'B');
  assertEqual(r.reasonCode, 'C/lost-as-path');
});

test('L3R2-mistake-A', () => {
  const r = evaluate(BGP_LEVEL, L3R2(), 'A');
  assertEqual(r.status, 'incorrect');
  assertEqual(r.reasonCode, 'A/lost-origin');
});

test('boundary-weight-beats-local-pref', () => {
  const r = evaluate(BGP_LEVEL, WEIGHT_BOUNDARY(), 'B');
  assertEqual(r.status, 'correct');
  assertEqual(r.evidence.decidingStep, 'weight');
  assertEqual(evaluate(BGP_LEVEL, WEIGHT_BOUNDARY(), 'A').reasonCode, 'A/lost-weight');
});

test('boundary-med-same-neighbour-as', () => {
  const r = evaluate(BGP_LEVEL, MED_BOUNDARY(), 'B');
  assertEqual(r.status, 'correct');
  assertEqual(r.evidence.decidingStep, 'med');
  assertEqual(evaluate(BGP_LEVEL, MED_BOUNDARY(), 'A').reasonCode, 'A/lost-med');
});

test('unsupported-full-tie', () => {
  const r = evaluate(BGP_LEVEL, FULL_TIE(), 'A');
  assertEqual(r.status, 'content-error');
  assertEqual(r.reasonCode, 'bgp-full-tie');
  assertEqual(r.expected, null);
});

test('unsupported-med-cross-as', () => {
  const r = evaluate(BGP_LEVEL, MED_CROSS_AS(), 'B');
  assertEqual(r.status, 'content-error');
  assertEqual(r.reasonCode, 'bgp-med-cross-as');
});

test('bgp-input-checks', () => {
  assertEqual(evaluate(BGP_LEVEL, L3R1(), null).reasonCode, 'no-selection');
  assertEqual(evaluate(BGP_LEVEL, L3R1(), 'C').reasonCode, 'unknown-choice');
  assertEqual(evaluate(BGP_LEVEL, L3R1(), 'no-lease').reasonCode, 'unknown-choice');
});

test('origin-order-igp-egp-incomplete', () => {
  const round = bgpRound('BO', [
    path('A', { asPath: [64501], origin: 'egp' }),
    path('B', { asPath: [64502], origin: 'incomplete' }),
  ], 'A', ['B/lost-origin']);
  const r = evaluate(BGP_LEVEL, round, 'A');
  assertEqual(r.status, 'correct');
  assertEqual(r.evidence.decidingStep, 'origin');
});

// SC-008: a trial BGP round needs content only.
test('SC-008-trial-bgp-round', () => {
  const round = bgpRound('L3R3', [
    path('A', { localPref: 150, asPath: [64501, 64510] }),
    path('B', { localPref: 150, asPath: [64502] }),
  ], 'B', ['A/lost-as-path']);
  const r = evaluate(BGP_LEVEL, round, 'B');
  assertEqual(r.status, 'correct');
  assertEqual(r.evidence.decidingStep, 'as-path');
});
