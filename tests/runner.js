// Minimal dependency-free test harness (research R6).
// Zero registered tests is reported as a failure, never as success.

const registered = [];

export function test(id, fn) {
  registered.push({ id, fn });
}

function show(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function assertEqual(actual, expected, message = '') {
  if (!Object.is(actual, expected)) {
    throw new Error(`${message} expected ${show(expected)} but got ${show(actual)}`.trim());
  }
}

export function assertDeepEqual(actual, expected, message = '') {
  if (stable(actual) !== stable(expected)) {
    throw new Error(`${message} expected ${stable(expected)} but got ${stable(actual)}`.trim());
  }
}

export function assertTrue(value, message = '') {
  if (value !== true) throw new Error(`${message} expected true but got ${show(value)}`.trim());
}

export function assertThrows(fn, message = '') {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) throw new Error(`${message} expected an exception`.trim());
}

export async function loadJson(relativeUrl, base) {
  const response = await fetch(new URL(relativeUrl, base));
  if (!response.ok) throw new Error(`Could not load ${relativeUrl}: HTTP ${response.status}`);
  return response.json();
}

export async function run() {
  const results = [];
  for (const { id, fn } of registered) {
    try {
      await fn();
      results.push({ id, ok: true });
    } catch (error) {
      results.push({ id, ok: false, message: error && error.message ? error.message : String(error) });
    }
  }
  if (registered.length === 0) {
    results.push({ id: 'NO-TESTS', ok: false, message: 'No tests were registered; an empty suite is a failure.' });
  }
  return { total: registered.length, failed: results.filter((r) => !r.ok) };
}
