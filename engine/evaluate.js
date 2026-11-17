// evaluate(level, round, answer) — contracts/evaluation.md.
// Pure: no DOM, timers, network, randomness, or state changes.
import { checkRoundEvidence } from './content.js';
import { hostChoiceIds, decideHost, hostReasonCode } from './rule-host.js';
import { bgpChoiceIds, decideBgp, bgpReasonCode } from './rule-bgp.js';

/** Rule registry keyed by Level.rule (data-model.md). */
export const RULES = {
  'host-config': { choiceIds: hostChoiceIds, decide: decideHost, reasonCode: hostReasonCode },
  'bgp-best-path': { choiceIds: bgpChoiceIds, decide: decideBgp, reasonCode: bgpReasonCode },
};

function contentError(code) {
  return { status: 'content-error', expected: null, reasonCode: code, evidence: null };
}

export function evaluate(level, round, answer) {
  // 1. Content validation for this round.
  const problem = checkRoundEvidence(level, round);
  if (problem) return contentError(problem);
  const rule = RULES[level.rule];

  // 2. Input check.
  if (answer === null || answer === undefined || answer === '') {
    return { status: 'invalid-input', expected: null, reasonCode: 'no-selection', evidence: null };
  }
  if (!rule.choiceIds(round).includes(answer)) {
    return { status: 'invalid-input', expected: null, reasonCode: 'unknown-choice', evidence: null };
  }

  // 3. Rule.
  const decision = rule.decide(round);
  if (decision.error) return contentError(decision.error);
  if (answer === decision.expected) {
    return { status: 'correct', expected: decision.expected, reasonCode: 'correct', evidence: decision.evidence };
  }
  return {
    status: 'incorrect',
    expected: decision.expected,
    reasonCode: rule.reasonCode(answer, decision),
    evidence: decision.evidence,
  };
}

/** Choice IDs offered in this round (diagnoses for host-config, path IDs for bgp-best-path). */
export function choiceIdsFor(level, round) {
  const rule = RULES[level.rule];
  return rule ? rule.choiceIds(round) : [];
}
