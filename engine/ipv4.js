// IPv4 helpers. Every bitwise result is normalised with `>>> 0` because JavaScript
// bitwise operators return signed 32-bit integers (research R2).

const OCTET = /^(0|[1-9][0-9]{0,2})$/;

/** Parse a dotted quad to an unsigned 32-bit integer, or return null if malformed. */
export function parseIp(text) {
  if (typeof text !== 'string') return null;
  const parts = text.split('.');
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!OCTET.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = ((value << 8) | octet) >>> 0;
  }
  return value >>> 0;
}

export function formatIp(value) {
  const v = value >>> 0;
  return [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255, v & 255].join('.');
}

/** True when the mask's one-bits are all leading (e.g. 255.255.255.128). */
export function isContiguousMask(mask) {
  const inverse = ~mask >>> 0;
  return ((inverse + 1) & inverse) === 0;
}

/** Number of leading one-bits. Only meaningful for contiguous masks. */
export function maskToPrefix(mask) {
  let count = 0;
  let rest = mask >>> 0;
  while (count < 32 && (rest & 0x80000000) !== 0) {
    count += 1;
    rest = (rest << 1) >>> 0;
  }
  return count;
}

export function prefixToMask(prefix) {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

export function network(address, mask) {
  return (address & mask) >>> 0;
}

export function broadcast(address, mask) {
  return (network(address, mask) | (~mask >>> 0)) >>> 0;
}

/** 169.254.0.0/16: self-assigned (link-local) IPv4 addresses, RFC 3927. */
export function isApipa(address) {
  return ((address & 0xffff0000) >>> 0) === 0xa9fe0000;
}
