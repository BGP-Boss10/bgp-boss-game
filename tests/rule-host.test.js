// Spec Reference Cases for Levels 1–2 and the /25 boundaries (SC-001).
import { test, assertEqual } from './runner.js';
import { evaluate } from '../engine/evaluate.js';
import {
  HOST_LEVEL, L1R1, L1R2, L2R1, L2R2, BOUNDARY_126, BOUNDARY_129, hostRound,
} from './fixtures.js';

function check(id, round, answer, status, expected, reasonCode, evidence = {}) {
  test(id, () => {
    const r = evaluate(HOST_LEVEL, round(), answer);
    assertEqual(r.status, status, 'status');
    assertEqual(r.expected, expected, 'expected');
    assertEqual(r.reasonCode, reasonCode, 'reasonCode');
    for (const [key, value] of Object.entries(evidence)) assertEqual(r.evidence[key], value, `evidence.${key}`);
  });
}

check('L1R1-correct', L1R1, 'no-lease', 'correct', 'no-lease', 'correct', { apipa: true, prefix: 16 });
check('L1R1-mistake-config-valid', L1R1, 'config-valid', 'incorrect', 'no-lease', 'config-valid/no-lease');
check('L1R1-mistake-gateway', L1R1, 'gateway-off-subnet', 'incorrect', 'no-lease', 'gateway-off-subnet/no-lease');

check('L1R2-correct', L1R2, 'config-valid', 'correct', 'config-valid', 'correct',
  { hostNetwork: '10.20.30.0', gatewayNetwork: '10.20.30.0', prefix: 24, apipa: false });
check('L1R2-mistake-no-lease', L1R2, 'no-lease', 'incorrect', 'config-valid', 'no-lease/config-valid');

check('L2R1-correct', L2R1, 'gateway-off-subnet', 'correct', 'gateway-off-subnet', 'correct',
  { hostNetwork: '192.168.1.128', gatewayNetwork: '192.168.1.0', prefix: 25, hostRange: '192.168.1.128–192.168.1.255' });
check('L2R1-mistake-config-valid', L2R1, 'config-valid', 'incorrect', 'gateway-off-subnet', 'config-valid/gateway-off-subnet',
  { hostNetwork: '192.168.1.128', gatewayNetwork: '192.168.1.0', prefix: 25 });

check('L2R2-correct', L2R2, 'config-valid', 'correct', 'config-valid', 'correct',
  { hostNetwork: '172.16.4.0', gatewayNetwork: '172.16.4.0', prefix: 22, hostRange: '172.16.4.0–172.16.7.255' });
check('L2R2-mistake-gateway', L2R2, 'gateway-off-subnet', 'incorrect', 'config-valid', 'gateway-off-subnet/config-valid');

check('boundary-126-valid', BOUNDARY_126, 'config-valid', 'correct', 'config-valid', 'correct',
  { hostNetwork: '192.168.1.0', gatewayNetwork: '192.168.1.0' });
check('boundary-129-off-subnet', BOUNDARY_129, 'gateway-off-subnet', 'correct', 'gateway-off-subnet', 'correct',
  { hostNetwork: '192.168.1.128', gatewayNetwork: '192.168.1.0' });

check('input-no-selection', L1R1, null, 'invalid-input', null, 'no-selection');
check('input-empty', L1R1, '', 'invalid-input', null, 'no-selection');
check('input-unknown-choice', L1R1, 'no-relay', 'invalid-input', null, 'unknown-choice');

test('unsupported-non-contiguous-mask', () => {
  const round = L2R1();
  round.host.mask = '255.255.0.255';
  const r = evaluate(HOST_LEVEL, round, 'config-valid');
  assertEqual(r.status, 'content-error');
  assertEqual(r.reasonCode, 'mask-non-contiguous');
});

test('unsupported-host-is-network', () => {
  const round = L2R1();
  round.host.ip = '192.168.1.128';
  assertEqual(evaluate(HOST_LEVEL, round, 'config-valid').reasonCode, 'host-is-network');
});

test('unsupported-non-apipa-without-gateway', () => {
  const round = L1R2();
  round.host.gateway = null;
  assertEqual(evaluate(HOST_LEVEL, round, 'config-valid').reasonCode, 'gateway-missing');
});

// SC-008 / Constitution VI: a trial round needs content only, no rule change.
test('SC-008-trial-round-graded-without-rule-change', () => {
  const trial = hostRound('L2R3', '10.9.8.20', '255.255.255.240', '10.9.8.1', 'gateway-off-subnet', []);
  const r = evaluate(HOST_LEVEL, trial, 'gateway-off-subnet');
  assertEqual(r.status, 'correct');
  assertEqual(r.evidence.hostNetwork, '10.9.8.16');
  assertEqual(r.evidence.gatewayNetwork, '10.9.8.0');
  assertEqual(r.evidence.prefix, 28);
});
