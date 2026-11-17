// Level 3 BGP best-path rule (spec FR-006, contracts/evaluation.md, research R3).
// Pure. Eliminates paths one attribute at a time; the first step that leaves a single
// path decides. Cases the model cannot settle are reported as content errors.

const ORIGIN_RANK = { igp: 0, egp: 1, incomplete: 2 };
const ORIGIN_LABEL = { igp: 'IGP', egp: 'EGP', incomplete: 'incomplete' };

export const BGP_STEPS = [
  { step: 'weight', label: 'weight', better: 'higher', value: (p) => p.weight, show: (p) => String(p.weight) },
  { step: 'local-pref', label: 'local preference', better: 'higher', value: (p) => p.localPref, show: (p) => String(p.localPref) },
  { step: 'as-path', label: 'AS-path length', better: 'lower', value: (p) => p.asPath.length, show: (p) => String(p.asPath.length) },
  { step: 'origin', label: 'origin', better: 'lower', value: (p) => ORIGIN_RANK[p.origin], show: (p) => ORIGIN_LABEL[p.origin] },
  { step: 'med', label: 'MED', better: 'lower', value: (p) => p.med, show: (p) => String(p.med) },
];

export function stepLabel(step) {
  const found = BGP_STEPS.find((s) => s.step === step);
  return found ? found.label : step;
}

export function originLabel(origin) {
  return ORIGIN_LABEL[origin] ?? origin;
}

export function bgpChoiceIds(round) {
  return round.paths.map((p) => p.id);
}

/**
 * Returns { expected, evidence } or { error } where error is
 * 'bgp-med-cross-as' or 'bgp-full-tie'.
 */
export function decideBgp(round) {
  let survivors = round.paths.slice();
  const steps = [];
  const eliminatedAt = {};
  const neighbourAs = {};
  for (const p of round.paths) neighbourAs[p.id] = p.asPath[0];

  for (const s of BGP_STEPS) {
    if (s.step === 'med') {
      const ases = new Set(survivors.map((p) => p.asPath[0]));
      if (ases.size > 1) return { error: 'bgp-med-cross-as' };
    }
    const values = {};
    const shown = {};
    for (const p of survivors) {
      values[p.id] = s.value(p);
      shown[p.id] = s.show(p);
    }
    const all = survivors.map((p) => values[p.id]);
    const best = s.better === 'higher' ? Math.max(...all) : Math.min(...all);
    const kept = survivors.filter((p) => values[p.id] === best);
    for (const p of survivors) {
      if (!kept.includes(p)) eliminatedAt[p.id] = s.step;
    }
    survivors = kept;
    steps.push({ step: s.step, label: s.label, values, shown, survivors: kept.map((p) => p.id) });
    if (survivors.length === 1) {
      return {
        expected: survivors[0].id,
        evidence: {
          steps,
          decidingStep: s.step,
          decidingLabel: s.label,
          winner: survivors[0].id,
          eliminatedAt,
          neighbourAs,
        },
      };
    }
  }
  return { error: 'bgp-full-tie' };
}

export function bgpReasonCode(chosen, decision) {
  return `${chosen}/lost-${decision.evidence.eliminatedAt[chosen]}`;
}
