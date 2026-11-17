// Hand-typed fixtures from the spec's Reference Cases table. Expected answers and
// reason codes here are typed by hand, not computed by the code under test.

export const HOST_LEVEL = { rule: 'host-config' };
export const BGP_LEVEL = { rule: 'bgp-best-path' };

const SOURCE = { id: 's1', title: 'Test source', url: 'https://example.org/', section: '§1', claim: 'A claim.' };

export function hostRound(id, ip, mask, gateway, expected, wrongCodes) {
  const feedback = { correct: 'Correct.' };
  for (const code of wrongCodes) feedback[code] = `Wrong: ${code}`;
  return {
    id,
    monster: `Monster ${id}`,
    ticket: `Ticket ${id}`,
    art: 'imp',
    host: { ip, mask, gateway },
    hints: { method: 'Method hint.', workedStep: 'Worked step.' },
    solution: 'Worked solution.',
    feedback,
    sourceIds: ['s1'],
    authorExpects: expected,
  };
}

export function path(id, attrs) {
  return {
    id,
    label: `Path ${id}`,
    nextHop: attrs.nextHop ?? '198.51.100.1',
    weight: attrs.weight ?? 0,
    localPref: attrs.localPref ?? 100,
    asPath: attrs.asPath,
    origin: attrs.origin ?? 'igp',
    med: attrs.med ?? 0,
  };
}

export function bgpRound(id, paths, expected, wrongCodes) {
  const feedback = { correct: 'Correct.' };
  for (const code of wrongCodes) feedback[code] = `Wrong: ${code}`;
  return {
    id,
    monster: `Monster ${id}`,
    ticket: `Ticket ${id}`,
    art: 'wraith',
    prefix: '203.0.113.0/24',
    paths,
    hints: { method: 'Method hint.', workedStep: 'Worked step.' },
    solution: 'Worked solution.',
    feedback,
    sourceIds: ['s1'],
    authorExpects: expected,
  };
}

// --- Spec reference rounds -------------------------------------------------

export const L1R1 = () => hostRound('L1R1', '169.254.33.7', '255.255.0.0', null, 'no-lease',
  ['config-valid/no-lease', 'gateway-off-subnet/no-lease']);
export const L1R2 = () => hostRound('L1R2', '10.20.30.44', '255.255.255.0', '10.20.30.1', 'config-valid',
  ['no-lease/config-valid', 'gateway-off-subnet/config-valid']);
export const L2R1 = () => hostRound('L2R1', '192.168.1.130', '255.255.255.128', '192.168.1.1', 'gateway-off-subnet',
  ['no-lease/gateway-off-subnet', 'config-valid/gateway-off-subnet']);
export const L2R2 = () => hostRound('L2R2', '172.16.4.200', '255.255.252.0', '172.16.5.1', 'config-valid',
  ['no-lease/config-valid', 'gateway-off-subnet/config-valid']);
export const BOUNDARY_126 = () => hostRound('B126', '192.168.1.126', '255.255.255.128', '192.168.1.1', 'config-valid',
  ['no-lease/config-valid', 'gateway-off-subnet/config-valid']);
export const BOUNDARY_129 = () => hostRound('B129', '192.168.1.129', '255.255.255.128', '192.168.1.1', 'gateway-off-subnet',
  ['no-lease/gateway-off-subnet', 'config-valid/gateway-off-subnet']);

export const L3R1 = () => bgpRound('L3R1', [
  path('A', { nextHop: '198.51.100.1', localPref: 100, asPath: [64501, 64510] }),
  path('B', { nextHop: '198.51.100.5', localPref: 200, asPath: [64502, 64520, 64510] }),
], 'B', ['A/lost-local-pref']);

export const L3R2 = () => bgpRound('L3R2', [
  path('A', { nextHop: '198.51.100.1', asPath: [64501, 64510], origin: 'incomplete', med: 10 }),
  path('B', { nextHop: '198.51.100.9', asPath: [64501, 64510], origin: 'igp', med: 50 }),
  path('C', { nextHop: '198.51.100.5', asPath: [64502, 64530, 64510], origin: 'igp', med: 0 }),
], 'B', ['A/lost-origin', 'C/lost-as-path']);

export const WEIGHT_BOUNDARY = () => bgpRound('BW', [
  path('A', { weight: 0, localPref: 300, asPath: [64501] }),
  path('B', { weight: 200, localPref: 100, asPath: [64502, 64520, 64510] }),
], 'B', ['A/lost-weight']);

export const MED_BOUNDARY = () => bgpRound('BM', [
  path('A', { asPath: [64501, 64600], med: 50 }),
  path('B', { asPath: [64501, 64700], med: 10 }),
], 'B', ['A/lost-med']);

export const FULL_TIE = () => bgpRound('BT', [
  path('A', { nextHop: '198.51.100.1', asPath: [64501, 64510] }),
  path('B', { nextHop: '198.51.100.9', asPath: [64501, 64510] }),
], 'A', []);

export const MED_CROSS_AS = () => bgpRound('BX', [
  path('A', { asPath: [64501, 64510], med: 10 }),
  path('B', { asPath: [64502, 64510], med: 5 }),
], 'B', ['A/lost-med']);

// --- A minimal valid document ----------------------------------------------

function level(id, rule, rank, promotesTo, phase, outcome, rounds, scene) {
  rounds[rounds.length - 1].boss = true;
  return {
    id,
    title: `Level ${id}`,
    rule,
    scene,
    rank,
    promotesTo,
    phase,
    outcome,
    briefing: { text: 'Briefing.', workedExample: 'Example.', simplifications: 'Simplified.', sourceIds: ['s1'] },
    rounds,
  };
}

export function validDoc() {
  return {
    schemaVersion: 1,
    diagnoses: [
      { id: 'no-lease', move: 'Lease Lance', label: 'No DHCP lease: the host self-assigned a 169.254.x.x address' },
      { id: 'gateway-off-subnet', move: 'Outer-Gate Strike', label: "Default gateway is outside the host's subnet" },
      { id: 'config-valid', move: 'All-Clear Ward', label: 'Host IP settings are valid; escalate to the next check' },
    ],
    sources: [{ ...SOURCE }],
    levels: [
      level('L1', 'host-config', 'Service Desk (T1)', 'NOC Engineer (T2)', 'foundation', 'LO1', [L1R1(), L1R2()], 'help-desk-gate'),
      level('L2', 'host-config', 'NOC Engineer (T2)', 'Network Engineer (T3)', 'application', 'LO2', [L2R1(), L2R2()], 'walled-towns'),
      level('L3', 'bgp-best-path', 'Network Engineer (T3)', 'Senior Network Engineer (T4)', 'transfer', 'LO3', [L3R1(), L3R2()], 'bgp-citadel'),
    ],
  };
}
