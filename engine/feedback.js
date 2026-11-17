// explain(round, result) — contracts/evaluation.md "Feedback composition".
// Fixed wording comes from content; numbers come from the evaluator's evidence,
// so the explanation always agrees with the rule (Constitution VI).

export const GUIDANCE = {
  'no-selection': 'Choose one option, then Submit.',
  'unknown-choice': "That isn't one of the options for this ticket. Choose one option, then Submit.",
};

function flatten(evidence) {
  const vars = {};
  if (!evidence) return vars;
  for (const [key, value] of Object.entries(evidence)) {
    if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
      vars[key] = value === null ? 'none' : String(value);
    }
  }
  return vars;
}

export function fill(template, evidence) {
  const vars = flatten(evidence);
  return template.replace(/\{([A-Za-z]+)\}/g, (whole, key) => (key in vars ? vars[key] : whole));
}

export function explain(round, result) {
  if (!result) return '';
  if (result.status === 'invalid-input') {
    return GUIDANCE[result.reasonCode] ?? GUIDANCE['no-selection'];
  }
  if (result.status === 'content-error') {
    const id = round && round.id ? round.id : 'unknown round';
    return `This ticket can't be graded because its content has an error (${id}: ${result.reasonCode}). `
      + "That's an authoring problem, not your mistake, and nothing was counted.";
  }
  const key = result.status === 'correct' ? 'correct' : result.reasonCode;
  const template = round && round.feedback ? round.feedback[key] : undefined;
  if (typeof template !== 'string') {
    return `No explanation is written for ${key}. Please report this ticket (${round ? round.id : '?'}).`;
  }
  return fill(template, result.evidence);
}
