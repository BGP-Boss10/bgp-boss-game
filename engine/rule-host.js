// Levels 1–2 host-configuration rule (spec FR-005, contracts/evaluation.md).
// Pure: same inputs, same result. Assumes the round's evidence already passed validation.
import { parseIp, formatIp, maskToPrefix, network, broadcast, isApipa } from './ipv4.js';

export const HOST_CHOICE_IDS = ['no-lease', 'gateway-off-subnet', 'config-valid'];

export function hostChoiceIds() {
  return HOST_CHOICE_IDS;
}

/** Ordered rule: APIPA → gateway outside the host's subnet → valid. */
export function decideHost(round) {
  const ip = parseIp(round.host.ip);
  const mask = parseIp(round.host.mask);
  const gateway = round.host.gateway === null ? null : parseIp(round.host.gateway);
  const apipa = isApipa(ip);
  const hostNetwork = network(ip, mask);
  const hostBroadcast = broadcast(ip, mask);
  const gatewayNetwork = gateway === null ? null : network(gateway, mask);

  let expected;
  if (apipa) expected = 'no-lease';
  else if (gatewayNetwork !== hostNetwork) expected = 'gateway-off-subnet';
  else expected = 'config-valid';

  return {
    expected,
    evidence: {
      ip: round.host.ip,
      mask: round.host.mask,
      prefix: maskToPrefix(mask),
      hostNetwork: formatIp(hostNetwork),
      hostBroadcast: formatIp(hostBroadcast),
      hostRange: `${formatIp(hostNetwork)}–${formatIp(hostBroadcast)}`,
      gateway: round.host.gateway,
      gatewayNetwork: gatewayNetwork === null ? null : formatIp(gatewayNetwork),
      gatewayInside: gateway === null ? null : gatewayNetwork === hostNetwork,
      apipa,
    },
  };
}

export function hostReasonCode(chosen, decision) {
  return `${chosen}/${decision.expected}`;
}
