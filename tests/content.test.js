// Every validation code in contracts/content.md fails on a mutated copy with that code and path.
import { test, assertEqual, assertDeepEqual, loadJson } from './runner.js';
import { validateContent } from '../engine/content.js';
import { validDoc, FULL_TIE, MED_CROSS_AS } from './fixtures.js';

function expectOnly(id, mutate, code, path) {
  test(`content-${id}`, () => {
    const doc = validDoc();
    mutate(doc);
    const { ok, errors } = validateContent(doc);
    assertEqual(ok, false, 'ok');
    assertDeepEqual(errors.map((e) => [e.code, e.path]), [[code, path]], 'errors');
  });
}

test('content-valid-fixture', () => {
  const result = validateContent(validDoc());
  assertDeepEqual(result.errors, []);
  assertEqual(result.ok, true);
});

// Document and level structure
expectOnly('schema-version', (d) => { d.schemaVersion = 2; }, 'schema-version', 'schemaVersion');
expectOnly('missing-field', (d) => { delete d.levels[0].title; }, 'missing-field', 'levels[0].title');
expectOnly('wrong-type-phase', (d) => { d.levels[0].phase = 'beginner'; }, 'wrong-type', 'levels[0].phase');
expectOnly('round-count', (d) => { d.levels[0].rounds.pop(); }, 'round-count', 'levels[0].rounds');
expectOnly('level-count', (d) => { d.levels.pop(); }, 'level-count', 'levels');
expectOnly('duplicate-id-round', (d) => { d.levels[1].rounds[0].id = 'L1R1'; }, 'duplicate-id', 'levels[1].rounds[0].id');
expectOnly('unknown-source', (d) => { d.levels[0].rounds[0].sourceIds = ['nope']; }, 'unknown-source', 'levels[0].rounds[0].sourceIds[0]');
expectOnly('bad-url', (d) => { d.sources[0].url = 'http://example.org/'; }, 'bad-url', 'sources[0].url');
expectOnly('unknown-rule', (d) => { d.levels[0].rule = 'quiz'; }, 'unknown-rule', 'levels[0].rule');

// Host evidence
expectOnly('wrong-evidence-host', (d) => { d.levels[0].rounds[0].paths = []; }, 'wrong-evidence', 'levels[0].rounds[0].paths');
expectOnly('ip-malformed', (d) => { d.levels[0].rounds[1].host.ip = '10.20.30.044'; }, 'ip-malformed', 'levels[0].rounds[1].host.ip');
expectOnly('mask-non-contiguous', (d) => { d.levels[1].rounds[0].host.mask = '255.255.0.255'; }, 'mask-non-contiguous', 'levels[1].rounds[0].host.mask');
expectOnly('mask-out-of-range', (d) => { d.levels[0].rounds[1].host.mask = '255.255.255.254'; }, 'mask-out-of-range', 'levels[0].rounds[1].host.mask');
expectOnly('host-is-network', (d) => { d.levels[1].rounds[0].host.ip = '192.168.1.128'; }, 'host-is-network', 'levels[1].rounds[0].host.ip');
expectOnly('host-is-broadcast', (d) => { d.levels[1].rounds[0].host.ip = '192.168.1.255'; }, 'host-is-broadcast', 'levels[1].rounds[0].host.ip');
expectOnly('gateway-invalid-equals-host', (d) => { d.levels[0].rounds[1].host.gateway = '10.20.30.44'; }, 'gateway-invalid', 'levels[0].rounds[1].host.gateway');
expectOnly('gateway-invalid-network', (d) => { d.levels[0].rounds[1].host.gateway = '10.20.30.0'; }, 'gateway-invalid', 'levels[0].rounds[1].host.gateway');
expectOnly('apipa-shape', (d) => { d.levels[0].rounds[0].host.gateway = '169.254.0.1'; }, 'apipa-shape', 'levels[0].rounds[0].host');
expectOnly('gateway-missing', (d) => { d.levels[0].rounds[1].host.gateway = null; }, 'gateway-missing', 'levels[0].rounds[1].host.gateway');

// Hints, feedback, author cross-check
expectOnly('hints-shape', (d) => { d.levels[0].rounds[0].hints = { method: 'm' }; }, 'hints-shape', 'levels[0].rounds[0].hints');
expectOnly('solution-empty', (d) => { d.levels[0].rounds[0].solution = ''; }, 'solution-empty', 'levels[0].rounds[0].solution');
expectOnly('feedback-missing', (d) => { delete d.levels[0].rounds[0].feedback['config-valid/no-lease']; },
  'feedback-missing', 'levels[0].rounds[0].feedback.config-valid/no-lease');
expectOnly('feedback-missing-bgp', (d) => { delete d.levels[2].rounds[1].feedback['C/lost-as-path']; },
  'feedback-missing', 'levels[2].rounds[1].feedback.C/lost-as-path');
expectOnly('author-disagrees', (d) => { d.levels[0].rounds[0].authorExpects = 'config-valid'; }, 'author-disagrees', 'levels[0].rounds[0].authorExpects');
expectOnly('author-disagrees-bgp', (d) => { d.levels[2].rounds[0].authorExpects = 'A'; }, 'author-disagrees', 'levels[2].rounds[0].authorExpects');

// BGP evidence
expectOnly('prefix-malformed', (d) => { d.levels[2].rounds[0].prefix = '203.0.113.5/24'; }, 'prefix-malformed', 'levels[2].rounds[0].prefix');
expectOnly('path-count', (d) => { d.levels[2].rounds[0].paths.pop(); }, 'path-count', 'levels[2].rounds[0].paths');
expectOnly('path-attribute-weight', (d) => { d.levels[2].rounds[0].paths[0].weight = 70000; }, 'path-attribute', 'levels[2].rounds[0].paths[0].weight');
expectOnly('path-attribute-origin', (d) => { d.levels[2].rounds[0].paths[1].origin = 'bgp'; }, 'path-attribute', 'levels[2].rounds[0].paths[1].origin');
expectOnly('path-attribute-aspath', (d) => { d.levels[2].rounds[0].paths[0].asPath = []; }, 'path-attribute', 'levels[2].rounds[0].paths[0].asPath');
expectOnly('duplicate-id-path', (d) => { d.levels[2].rounds[1].paths[2].id = 'A'; }, 'duplicate-id', 'levels[2].rounds[1].paths[2].id');
expectOnly('wrong-evidence-bgp', (d) => { d.levels[2].rounds[0].host = { ip: '10.0.0.1', mask: '255.0.0.0', gateway: '10.0.0.2' }; },
  'wrong-evidence', 'levels[2].rounds[0].host');
expectOnly('bgp-full-tie', (d) => { d.levels[2].rounds[0].paths = FULL_TIE().paths; }, 'bgp-full-tie', 'levels[2].rounds[0].paths');
expectOnly('bgp-med-cross-as', (d) => { d.levels[2].rounds[0].paths = MED_CROSS_AS().paths; }, 'bgp-med-cross-as', 'levels[2].rounds[0].paths');

// Feature 002 presentation fields (specs/002-adventure-presentation/data-model.md)
expectOnly('unknown-art', (d) => { d.levels[0].rounds[0].art = 'dragon'; }, 'unknown-art', 'levels[0].rounds[0].art');
expectOnly('missing-art', (d) => { delete d.levels[0].rounds[0].art; }, 'missing-field', 'levels[0].rounds[0].art');
expectOnly('boss-wrong-type', (d) => { d.levels[0].rounds[1].boss = 'yes'; }, 'wrong-type', 'levels[0].rounds[1].boss');
expectOnly('unknown-scene', (d) => { d.levels[1].scene = 'swamp'; }, 'unknown-scene', 'levels[1].scene');
expectOnly('missing-scene', (d) => { delete d.levels[1].scene; }, 'missing-field', 'levels[1].scene');
expectOnly('diagnosis-move-missing', (d) => { delete d.diagnoses[0].move; }, 'missing-field', 'diagnoses[0].move');

// The shipped content must validate cleanly.
test('content-shipped-levels-json-valid', async () => {
  const doc = await loadJson('../data/levels.json', import.meta.url);
  const result = validateContent(doc);
  assertDeepEqual(result.errors, [], 'shipped data/levels.json errors');
  assertEqual(result.ok, true);
});
