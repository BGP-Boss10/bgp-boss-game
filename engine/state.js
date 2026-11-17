// Session state and transitions — data-model.md "Session state" and "State transitions".
// Functions mutate and return the session. No DOM access.
import { evaluate } from './evaluate.js';

export const HELP_LEVELS = ['none', 'method', 'worked-step', 'solution'];
const helpRank = (level) => HELP_LEVELS.indexOf(level);

function freshRecords(doc) {
  const records = {};
  for (const level of doc.levels) {
    for (const round of level.rounds) {
      // data-model.md Round record.attempts / .assistance / .resolved
      records[round.id] = { attempts: 0, assistance: 'none', resolved: false };
    }
  }
  return records;
}

function freshFields(doc) {
  return {
    view: 'briefing',
    levelIndex: 0,
    roundIndex: 0,
    selection: null,
    lastResult: null,
    records: freshRecords(doc),
    confirmingRestart: false,
    helpShown: {}, // UI-only: highest help level displayed per round (resolved rounds included)
  };
}

export function createSession(doc) {
  return { doc, ...freshFields(doc) };
}

export function currentLevel(s) {
  return s.doc.levels[s.levelIndex];
}

export function currentRound(s) {
  return currentLevel(s).rounds[s.roundIndex];
}

export function currentRecord(s) {
  return s.records[currentRound(s).id];
}

export function isLevelComplete(s, levelIndex) {
  return s.doc.levels[levelIndex].rounds.every((r) => s.records[r.id].resolved);
}

/** Rank is derived from completed levels, never stored. */
export function currentRank(s) {
  let rank = s.doc.levels[0].rank;
  for (let i = 0; i < s.doc.levels.length; i += 1) {
    if (!isLevelComplete(s, i)) break;
    rank = s.doc.levels[i].promotesTo;
  }
  return rank;
}

export function start(s) {
  if (s.view !== 'briefing') return s;
  s.view = 'round';
  s.roundIndex = 0;
  s.selection = null;
  s.lastResult = null;
  return s;
}

export function select(s, choiceId) {
  if (s.view !== 'round') return s;
  s.selection = choiceId;
  return s;
}

export function submit(s) {
  if (s.view !== 'round') return s;
  const record = currentRecord(s);
  if (record.resolved) return s; // repeated Submit after success changes nothing
  const result = evaluate(currentLevel(s), currentRound(s), s.selection);
  s.lastResult = result;
  if (result.status === 'incorrect') {
    record.attempts += 1;
  } else if (result.status === 'correct') {
    record.attempts += 1;
    record.resolved = true;
  }
  return s;
}

/** Show help up to `level`; recorded as assistance only while the round is unresolved. */
export function help(s, level) {
  if (s.view !== 'round' || helpRank(level) < 1) return s;
  const id = currentRound(s).id;
  const shown = s.helpShown[id] ?? 'none';
  if (helpRank(level) > helpRank(shown)) s.helpShown[id] = level;
  const record = s.records[id];
  if (!record.resolved && helpRank(level) > helpRank(record.assistance)) record.assistance = level;
  return s;
}

/** The next hint level to reveal with the Hint button ('method' then 'worked-step'), or null. */
export function nextHintLevel(s) {
  const shown = s.helpShown[currentRound(s).id] ?? 'none';
  if (helpRank(shown) < helpRank('method')) return 'method';
  if (helpRank(shown) < helpRank('worked-step')) return 'worked-step';
  return null;
}

export function next(s) {
  if (s.view === 'round') {
    if (!currentRecord(s).resolved) return s;
    if (s.roundIndex < currentLevel(s).rounds.length - 1) {
      s.roundIndex += 1;
      s.selection = null;
      s.lastResult = null;
    } else {
      s.view = 'level-summary';
      s.selection = null;
      s.lastResult = null;
    }
    return s;
  }
  if (s.view === 'level-summary') {
    if (s.levelIndex < s.doc.levels.length - 1) {
      s.levelIndex += 1;
      s.roundIndex = 0;
      s.view = 'briefing';
    } else {
      s.view = 'session-summary';
    }
  }
  return s;
}

export function requestRestart(s) {
  s.confirmingRestart = true;
  return s;
}

export function cancelRestart(s) {
  s.confirmingRestart = false;
  return s;
}

export function confirmRestart(s) {
  Object.assign(s, freshFields(s.doc));
  return s;
}

/** Per-level summary figures, kept as separate counts (spec FR-015). */
export function levelStats(s, levelIndex) {
  const level = s.doc.levels[levelIndex];
  const rounds = level.rounds.map((r) => ({ id: r.id, monster: r.monster, ...s.records[r.id] }));
  return {
    id: level.id,
    title: level.title,
    promotesTo: level.promotesTo,
    rounds,
    completed: rounds.filter((r) => r.resolved).length,
    total: rounds.length,
    attempts: rounds.reduce((sum, r) => sum + r.attempts, 0),
    roundsWithHelp: rounds.filter((r) => r.assistance !== 'none').length,
  };
}
