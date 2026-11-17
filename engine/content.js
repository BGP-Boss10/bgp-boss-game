// validateContent(doc) — contracts/content.md; field constraints from data-model.md.
// The whole document is validated before play. Errors never resolve in the author's favour.
import { parseIp, isContiguousMask, maskToPrefix, network, broadcast, isApipa } from './ipv4.js';
import { HOST_CHOICE_IDS, decideHost, hostReasonCode } from './rule-host.js';
import { decideBgp, bgpReasonCode } from './rule-bgp.js';

export const RELEASE_LEVEL_COUNT = 3; // data-model.md Document.levels
export const ROUNDS_PER_LEVEL = 2; // data-model.md Level.rounds
const RULE_IDS = ['host-config', 'bgp-best-path'];
const PHASES = ['foundation', 'application', 'transfer'];
const OUTCOMES = ['LO1', 'LO2', 'LO3'];
const PATH_IDS = ['A', 'B', 'C'];
const ORIGINS = ['igp', 'egp', 'incomplete'];
const UINT32_MAX = 4294967295;

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const isText = (v) => typeof v === 'string' && v.trim().length > 0;
const isInt = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;

class Collector {
  constructor() {
    this.errors = [];
  }

  add(code, path, roundId) {
    const error = { code, path };
    if (roundId) error.roundId = roundId;
    this.errors.push(error);
  }

  /** Required non-empty string; returns true when valid. */
  text(obj, key, path, roundId) {
    if (!(key in obj) || obj[key] === undefined) {
      this.add('missing-field', `${path}.${key}`, roundId);
      return false;
    }
    if (!isText(obj[key])) {
      this.add('wrong-type', `${path}.${key}`, roundId);
      return false;
    }
    return true;
  }

  field(obj, key, path, roundId, check) {
    if (!(key in obj) || obj[key] === undefined) {
      this.add('missing-field', `${path}.${key}`, roundId);
      return false;
    }
    if (!check(obj[key])) {
      this.add('wrong-type', `${path}.${key}`, roundId);
      return false;
    }
    return true;
  }
}

// ---------------------------------------------------------------- evidence checks

/** Host evidence (data-model.md Round.host.ip / Round.host.mask / Round.host.gateway). Returns [code, field] or null. */
function hostEvidenceProblem(round) {
  if ('paths' in round || 'prefix' in round) return ['wrong-evidence', 'paths'];
  if (!isObject(round.host)) return ['wrong-evidence', 'host'];
  const { host } = round;
  if (!('ip' in host)) return ['missing-field', 'host.ip'];
  if (!('mask' in host)) return ['missing-field', 'host.mask'];
  if (!('gateway' in host)) return ['missing-field', 'host.gateway'];
  const ip = parseIp(host.ip);
  if (ip === null) return ['ip-malformed', 'host.ip'];
  const mask = parseIp(host.mask);
  if (mask === null) return ['ip-malformed', 'host.mask'];
  if (!isContiguousMask(mask)) return ['mask-non-contiguous', 'host.mask'];
  const prefix = maskToPrefix(mask);
  if (prefix < 8 || prefix > 30) return ['mask-out-of-range', 'host.mask'];
  if (host.gateway !== null && parseIp(host.gateway) === null) return ['ip-malformed', 'host.gateway'];
  if (ip === network(ip, mask)) return ['host-is-network', 'host.ip'];
  if (ip === broadcast(ip, mask)) return ['host-is-broadcast', 'host.ip'];
  if (isApipa(ip)) {
    if (mask !== parseIp('255.255.0.0') || host.gateway !== null) return ['apipa-shape', 'host'];
    return null;
  }
  if (host.gateway === null) return ['gateway-missing', 'host.gateway'];
  const gateway = parseIp(host.gateway);
  if (gateway === ip || gateway === network(ip, mask) || gateway === broadcast(ip, mask)) {
    return ['gateway-invalid', 'host.gateway'];
  }
  return null;
}

/** BGP evidence (data-model.md Round.prefix, Round.paths, Path.*). Returns [code, field] or null. */
function bgpEvidenceProblem(round) {
  if ('host' in round) return ['wrong-evidence', 'host'];
  if (!('prefix' in round)) return ['missing-field', 'prefix'];
  if (!('paths' in round)) return ['missing-field', 'paths'];
  const match = typeof round.prefix === 'string' ? /^([^/]+)\/([0-9]{1,2})$/.exec(round.prefix) : null;
  if (!match) return ['prefix-malformed', 'prefix'];
  const address = parseIp(match[1]);
  const length = Number(match[2]);
  if (address === null || length < 8 || length > 30) return ['prefix-malformed', 'prefix'];
  const prefixMask = (0xffffffff << (32 - length)) >>> 0;
  if (network(address, prefixMask) !== address) return ['prefix-malformed', 'prefix'];
  if (!Array.isArray(round.paths)) return ['wrong-type', 'paths'];
  if (round.paths.length < 2 || round.paths.length > 3) return ['path-count', 'paths'];
  const seen = new Set();
  for (let i = 0; i < round.paths.length; i += 1) {
    const p = round.paths[i];
    const at = `paths[${i}]`;
    if (!isObject(p)) return ['wrong-type', at];
    if (!PATH_IDS.includes(p.id)) return ['path-attribute', `${at}.id`];
    if (seen.has(p.id)) return ['duplicate-id', `${at}.id`];
    seen.add(p.id);
    if (!isText(p.label)) return ['missing-field', `${at}.label`];
    if (parseIp(p.nextHop) === null) return ['ip-malformed', `${at}.nextHop`];
    if (!isInt(p.weight, 0, 65535)) return ['path-attribute', `${at}.weight`];
    if (!isInt(p.localPref, 0, UINT32_MAX)) return ['path-attribute', `${at}.localPref`];
    if (!Array.isArray(p.asPath) || p.asPath.length < 1 || !p.asPath.every((a) => isInt(a, 1, UINT32_MAX))) {
      return ['path-attribute', `${at}.asPath`];
    }
    if (!ORIGINS.includes(p.origin)) return ['path-attribute', `${at}.origin`];
    if (!isInt(p.med, 0, UINT32_MAX)) return ['path-attribute', `${at}.med`];
  }
  const decision = decideBgp(round);
  if (decision.error) return [decision.error, 'paths'];
  return null;
}

/**
 * Per-round evidence check used by evaluate(). Returns an error code or null.
 * Counts, hints and feedback are checked by validateContent() for the whole document.
 */
export function checkRoundEvidence(level, round) {
  if (!isObject(level) || !RULE_IDS.includes(level.rule)) return 'unknown-rule';
  if (!isObject(round)) return 'wrong-type';
  const problem = level.rule === 'host-config' ? hostEvidenceProblem(round) : bgpEvidenceProblem(round);
  return problem ? problem[0] : null;
}

// ---------------------------------------------------------------- whole document

function decide(level, round) {
  return level.rule === 'host-config' ? decideHost(round) : decideBgp(round);
}

function choiceIds(level, round) {
  return level.rule === 'host-config' ? HOST_CHOICE_IDS : round.paths.map((p) => p.id);
}

function reasonCode(level, chosen, decision) {
  return level.rule === 'host-config' ? hostReasonCode(chosen, decision) : bgpReasonCode(chosen, decision);
}

function validateRound(c, level, round, path, ctx) {
  if (!isObject(round)) {
    c.add('wrong-type', path);
    return;
  }
  const rid = typeof round.id === 'string' ? round.id : undefined;
  // data-model.md Round.id, Round.monster, Round.ticket
  if (c.text(round, 'id', path, rid)) {
    if (ctx.roundIds.has(round.id)) c.add('duplicate-id', `${path}.id`, rid);
    ctx.roundIds.add(round.id);
  }
  c.text(round, 'monster', path, rid);
  c.text(round, 'ticket', path, rid);

  // data-model.md Round.hints, Round.solution
  if (!isObject(round.hints) || !isText(round.hints.method) || !isText(round.hints.workedStep)) {
    c.add('hints-shape', `${path}.hints`, rid);
  }
  if (!isText(round.solution)) c.add('solution-empty', `${path}.solution`, rid);

  // data-model.md Round.sourceIds
  if (c.field(round, 'sourceIds', path, rid, (v) => Array.isArray(v) && v.length >= 1)) {
    round.sourceIds.forEach((id, i) => {
      if (!ctx.sourceIds.has(id)) c.add('unknown-source', `${path}.sourceIds[${i}]`, rid);
    });
  }
  const hasFeedback = c.field(round, 'feedback', path, rid, isObject);
  const hasAuthor = c.text(round, 'authorExpects', path, rid);

  // Evidence for this level's rule.
  if (!RULE_IDS.includes(level.rule)) return;
  const problem = level.rule === 'host-config' ? hostEvidenceProblem(round) : bgpEvidenceProblem(round);
  if (problem) {
    c.add(problem[0], `${path}.${problem[1]}`, rid);
    return;
  }

  // data-model.md Round.authorExpects (cross-check only) and Round.feedback (every reason code).
  const decision = decide(level, round);
  if (hasAuthor && round.authorExpects !== decision.expected) {
    c.add('author-disagrees', `${path}.authorExpects`, rid);
  }
  if (hasFeedback) {
    const needed = ['correct'];
    for (const id of choiceIds(level, round)) {
      if (id !== decision.expected) needed.push(reasonCode(level, id, decision));
    }
    for (const key of needed) {
      if (!isText(round.feedback[key])) c.add('feedback-missing', `${path}.feedback.${key}`, rid);
    }
  }
}

function validateLevel(c, level, path, ctx) {
  if (!isObject(level)) {
    c.add('wrong-type', path);
    return;
  }
  // data-model.md Level.id, Level.title, Level.rule, Level.rank, Level.promotesTo, Level.phase, Level.outcome
  if (c.text(level, 'id', path)) {
    if (ctx.levelIds.has(level.id)) c.add('duplicate-id', `${path}.id`);
    ctx.levelIds.add(level.id);
  }
  c.text(level, 'title', path);
  if (!('rule' in level)) c.add('missing-field', `${path}.rule`);
  else if (!RULE_IDS.includes(level.rule)) c.add('unknown-rule', `${path}.rule`);
  c.text(level, 'rank', path);
  c.text(level, 'promotesTo', path);
  c.field(level, 'phase', path, undefined, (v) => PHASES.includes(v));
  c.field(level, 'outcome', path, undefined, (v) => OUTCOMES.includes(v));

  // data-model.md Level.briefing
  if (c.field(level, 'briefing', path, undefined, isObject)) {
    const b = level.briefing;
    const bp = `${path}.briefing`;
    c.text(b, 'text', bp);
    c.text(b, 'workedExample', bp);
    c.text(b, 'simplifications', bp);
    if (c.field(b, 'sourceIds', bp, undefined, (v) => Array.isArray(v) && v.length >= 1)) {
      b.sourceIds.forEach((id, i) => {
        if (!ctx.sourceIds.has(id)) c.add('unknown-source', `${bp}.sourceIds[${i}]`);
      });
    }
  }

  // data-model.md Level.rounds
  if (c.field(level, 'rounds', path, undefined, Array.isArray)) {
    if (level.rounds.length !== ctx.roundsPerLevel) c.add('round-count', `${path}.rounds`);
    level.rounds.forEach((round, i) => validateRound(c, level, round, `${path}.rounds[${i}]`, ctx));
  }
}

/**
 * Validate the whole content document.
 * options.levelCount / options.roundsPerLevel exist so tests can check a trial round
 * (spec SC-008) without changing any grading rule; the shipped game uses the defaults.
 */
export function validateContent(doc, options = {}) {
  const levelCount = options.levelCount ?? RELEASE_LEVEL_COUNT;
  const roundsPerLevel = options.roundsPerLevel ?? ROUNDS_PER_LEVEL;
  const c = new Collector();
  if (!isObject(doc)) {
    c.add('wrong-type', '$');
    return { ok: false, errors: c.errors };
  }
  // data-model.md Document.schemaVersion
  if (doc.schemaVersion !== 1) c.add('schema-version', 'schemaVersion');

  // data-model.md Document.diagnoses, Diagnosis.id, Diagnosis.label
  if (c.field(doc, 'diagnoses', '$', undefined, Array.isArray)) {
    const seen = new Set();
    doc.diagnoses.forEach((d, i) => {
      const p = `diagnoses[${i}]`;
      if (!isObject(d)) {
        c.add('wrong-type', p);
        return;
      }
      if (c.field(d, 'id', p, undefined, (v) => HOST_CHOICE_IDS.includes(v))) {
        if (seen.has(d.id)) c.add('duplicate-id', `${p}.id`);
        seen.add(d.id);
      }
      c.text(d, 'label', p);
    });
    const order = doc.diagnoses.map((d) => d && d.id).join(',');
    if (doc.diagnoses.length !== 3 || (seen.size === 3 && order !== HOST_CHOICE_IDS.join(','))) {
      c.add('wrong-type', 'diagnoses');
    }
  }

  // data-model.md Document.sources, Source.id, Source.title, Source.url, Source.section, Source.claim
  const sourceIds = new Set();
  if (c.field(doc, 'sources', '$', undefined, (v) => Array.isArray(v) && v.length >= 1)) {
    doc.sources.forEach((s, i) => {
      const p = `sources[${i}]`;
      if (!isObject(s)) {
        c.add('wrong-type', p);
        return;
      }
      if (c.text(s, 'id', p)) {
        if (sourceIds.has(s.id)) c.add('duplicate-id', `${p}.id`);
        sourceIds.add(s.id);
      }
      c.text(s, 'title', p);
      if (c.text(s, 'url', p) && !s.url.startsWith('https://')) c.add('bad-url', `${p}.url`);
      c.text(s, 'section', p);
      c.text(s, 'claim', p);
    });
  }

  // data-model.md Document.levels
  if (c.field(doc, 'levels', '$', undefined, Array.isArray)) {
    if (doc.levels.length !== levelCount) c.add('level-count', 'levels');
    const ctx = { sourceIds, levelIds: new Set(), roundIds: new Set(), roundsPerLevel };
    doc.levels.forEach((level, i) => validateLevel(c, level, `levels[${i}]`, ctx));
  }

  // Normalise "$.field" paths to "field".
  for (const e of c.errors) e.path = e.path.replace(/^\$\./, '');
  return { ok: c.errors.length === 0, errors: c.errors };
}
