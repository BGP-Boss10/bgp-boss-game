// Session transitions — data-model.md "State transitions"; spec FR-009 to FR-018.
import { test, assertEqual, assertDeepEqual } from './runner.js';
import {
  createSession, start, select, submit, help, next, nextHintLevel, currentRound, currentRank,
  requestRestart, cancelRestart, confirmRestart, levelStats,
} from '../engine/state.js';
import { validDoc } from './fixtures.js';

const ANSWERS = { L1R1: 'no-lease', L1R2: 'config-valid', L2R1: 'gateway-off-subnet', L2R2: 'config-valid', L3R1: 'B', L3R2: 'B' };

function solveCurrent(s) {
  select(s, ANSWERS[currentRound(s).id]);
  submit(s);
}

function record(s) {
  return s.records[currentRound(s).id];
}

// ---- US1 ----

test('state-fresh-session-starts-at-briefing', () => {
  const s = createSession(validDoc());
  assertEqual(s.view, 'briefing');
  assertEqual(s.levelIndex, 0);
  submit(s);
  assertEqual(s.records.L1R1.attempts, 0, 'no answering before the briefing');
});

test('state-select-changes-no-counters', () => {
  const s = start(createSession(validDoc()));
  select(s, 'config-valid');
  assertEqual(s.selection, 'config-valid');
  assertDeepEqual(record(s), { attempts: 0, assistance: 'none', resolved: false });
});

test('state-invalid-input-not-an-attempt', () => {
  const s = start(createSession(validDoc()));
  submit(s);
  assertEqual(s.lastResult.status, 'invalid-input');
  assertEqual(s.lastResult.reasonCode, 'no-selection');
  assertEqual(record(s).attempts, 0);
  assertEqual(record(s).resolved, false);
});

test('state-incorrect-counts-and-stays-open', () => {
  const s = start(createSession(validDoc()));
  select(s, 'config-valid');
  submit(s);
  assertEqual(s.lastResult.status, 'incorrect');
  assertEqual(record(s).attempts, 1);
  assertEqual(record(s).resolved, false);
  next(s);
  assertEqual(s.view, 'round', 'Next does nothing while unresolved');
  assertEqual(currentRound(s).id, 'L1R1');
});

test('state-correct-resolves-once', () => {
  const s = start(createSession(validDoc()));
  select(s, 'config-valid');
  submit(s);
  select(s, 'no-lease');
  submit(s);
  assertEqual(s.lastResult.status, 'correct');
  assertDeepEqual(record(s), { attempts: 2, assistance: 'none', resolved: true });
  submit(s);
  submit(s);
  select(s, 'config-valid');
  submit(s);
  assertDeepEqual(record(s), { attempts: 2, assistance: 'none', resolved: true }, 'repeated submit changes nothing');
  assertEqual(s.lastResult.status, 'correct', 'last result unchanged');
});

test('state-next-moves-to-round-2', () => {
  const s = start(createSession(validDoc()));
  solveCurrent(s);
  next(s);
  assertEqual(s.view, 'round');
  assertEqual(currentRound(s).id, 'L1R2');
  assertEqual(s.selection, null);
  assertEqual(s.lastResult, null);
});

// ---- US2 ----

test('state-help-recorded-as-highest-level', () => {
  const s = start(createSession(validDoc()));
  assertEqual(nextHintLevel(s), 'method');
  help(s, 'method');
  assertEqual(record(s).assistance, 'method');
  assertEqual(nextHintLevel(s), 'worked-step');
  help(s, 'worked-step');
  assertEqual(nextHintLevel(s), null);
  help(s, 'solution');
  assertEqual(record(s).assistance, 'solution');
  help(s, 'method');
  assertEqual(record(s).assistance, 'solution', 'never decreases');
  assertEqual(record(s).resolved, false, 'help never completes a round');
  assertEqual(record(s).attempts, 0, 'help is not an attempt');
});

test('state-help-after-resolution-not-recorded', () => {
  const s = start(createSession(validDoc()));
  solveCurrent(s);
  help(s, 'solution');
  assertEqual(record(s).assistance, 'none');
  assertEqual(s.helpShown.L1R1, 'solution', 'still shown');
});

test('state-level-summary-and-promotion', () => {
  const s = start(createSession(validDoc()));
  assertEqual(currentRank(s), 'Service Desk (T1)');
  solveCurrent(s);
  next(s);
  solveCurrent(s);
  assertEqual(currentRank(s), 'NOC Engineer (T2)');
  next(s);
  assertEqual(s.view, 'level-summary');
  const stats = levelStats(s, 0);
  assertEqual(stats.completed, 2);
  assertEqual(stats.attempts, 2);
  assertEqual(stats.roundsWithHelp, 0);
  next(s);
  assertEqual(s.view, 'briefing');
  assertEqual(s.levelIndex, 1);
});

test('state-session-summary-after-last-level', () => {
  const s = createSession(validDoc());
  for (let level = 0; level < 3; level += 1) {
    start(s);
    solveCurrent(s);
    next(s);
    solveCurrent(s);
    next(s);
    assertEqual(s.view, 'level-summary');
    next(s);
  }
  assertEqual(s.view, 'session-summary');
  assertEqual(currentRank(s), 'Senior Network Engineer (T4)');
});

test('state-restart-cancel-changes-nothing', () => {
  const s = start(createSession(validDoc()));
  select(s, 'config-valid');
  submit(s);
  help(s, 'method');
  const before = JSON.stringify({ ...s, doc: null, confirmingRestart: null });
  requestRestart(s);
  assertEqual(s.confirmingRestart, true);
  cancelRestart(s);
  assertEqual(s.confirmingRestart, false);
  assertEqual(JSON.stringify({ ...s, doc: null, confirmingRestart: null }), before);
});

test('state-restart-confirm-fresh-session', () => {
  const s = start(createSession(validDoc()));
  solveCurrent(s);
  next(s);
  help(s, 'method');
  requestRestart(s);
  confirmRestart(s);
  assertEqual(s.view, 'briefing');
  assertEqual(s.levelIndex, 0);
  assertEqual(s.roundIndex, 0);
  assertEqual(s.confirmingRestart, false);
  assertDeepEqual(s.records.L1R1, { attempts: 0, assistance: 'none', resolved: false });
  assertDeepEqual(s.records.L1R2, { attempts: 0, assistance: 'none', resolved: false });
  assertDeepEqual(s.helpShown, {});
});
