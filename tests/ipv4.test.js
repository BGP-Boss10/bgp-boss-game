// Hand-typed expectations; never computed by the code under test.
import { test, assertEqual } from './runner.js';
import {
  parseIp, formatIp, isContiguousMask, maskToPrefix, prefixToMask, network, broadcast, isApipa,
} from '../engine/ipv4.js';

test('ipv4-parse-unsigned', () => {
  assertEqual(parseIp('192.168.1.130'), 3232235906);
  assertEqual(parseIp('255.255.255.255'), 4294967295);
  assertEqual(parseIp('0.0.0.0'), 0);
});

test('ipv4-parse-rejects-malformed', () => {
  assertEqual(parseIp('192.168.01.1'), null, 'leading zero');
  assertEqual(parseIp('256.1.1.1'), null, 'octet > 255');
  assertEqual(parseIp('1.2.3'), null, 'three octets');
  assertEqual(parseIp('1.2.3.4.5'), null, 'five octets');
  assertEqual(parseIp('1.2.3.x'), null, 'letters');
  assertEqual(parseIp(''), null, 'empty');
  assertEqual(parseIp(null), null, 'null');
});

test('ipv4-format-roundtrip', () => {
  assertEqual(formatIp(3232235906), '192.168.1.130');
  assertEqual(formatIp(parseIp('172.16.4.0')), '172.16.4.0');
});

test('ipv4-mask-contiguity-and-prefix', () => {
  assertEqual(isContiguousMask(parseIp('255.255.255.128')), true);
  assertEqual(maskToPrefix(parseIp('255.255.255.128')), 25);
  assertEqual(maskToPrefix(parseIp('255.255.252.0')), 22);
  assertEqual(maskToPrefix(parseIp('255.255.0.0')), 16);
  assertEqual(isContiguousMask(parseIp('255.255.0.255')), false);
  assertEqual(isContiguousMask(parseIp('255.0.255.0')), false);
  assertEqual(prefixToMask(25), parseIp('255.255.255.128'));
});

test('ipv4-network-broadcast-slash25', () => {
  const mask = parseIp('255.255.255.128');
  assertEqual(formatIp(network(parseIp('192.168.1.130'), mask)), '192.168.1.128');
  assertEqual(formatIp(broadcast(parseIp('192.168.1.130'), mask)), '192.168.1.255');
  assertEqual(formatIp(network(parseIp('192.168.1.1'), mask)), '192.168.1.0');
});

test('ipv4-network-slash22', () => {
  const mask = parseIp('255.255.252.0');
  assertEqual(formatIp(network(parseIp('172.16.4.200'), mask)), '172.16.4.0');
  assertEqual(formatIp(network(parseIp('172.16.5.1'), mask)), '172.16.4.0');
  assertEqual(formatIp(broadcast(parseIp('172.16.4.200'), mask)), '172.16.7.255');
});

test('ipv4-apipa', () => {
  assertEqual(isApipa(parseIp('169.254.33.7')), true);
  assertEqual(isApipa(parseIp('169.254.0.1')), true);
  assertEqual(isApipa(parseIp('10.20.30.44')), false);
  assertEqual(isApipa(parseIp('169.253.255.255')), false);
});
