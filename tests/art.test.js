// Feature 002: every art/scene ID in content has original SVG art, hidden from assistive tech.
import { test, assertEqual, assertTrue, assertThrows } from './runner.js';
import { ART_IDS, SCENE_IDS } from '../engine/content.js';
import { heroSvg, monsterSvg, sceneSvg } from '../ui/art.js';

function isDecorativeSvg(el) {
  return el instanceof SVGElement && el.tagName.toLowerCase() === 'svg'
    && el.getAttribute('aria-hidden') === 'true' && el.getAttribute('focusable') === 'false';
}

for (const id of ART_IDS) {
  test(`art-monster-${id}`, () => {
    const el = monsterSvg(id);
    assertTrue(isDecorativeSvg(el), 'decorative svg');
    assertTrue(el.childElementCount > 3, 'has drawing');
    assertEqual(el.dataset.art, id);
  });
}

for (const id of SCENE_IDS) {
  test(`art-scene-${id}`, () => {
    const el = sceneSvg(id);
    assertTrue(isDecorativeSvg(el), 'decorative svg');
    assertTrue(el.childElementCount > 3, 'has drawing');
  });
}

test('art-unknown-ids-throw', () => {
  assertThrows(() => monsterSvg('dragon'));
  assertThrows(() => sceneSvg('swamp'));
});

test('art-hero-gear-tiers-are-cumulative', () => {
  const has = (el, cls) => el.querySelector(`.${cls}`) !== null;
  const t1 = heroSvg(1);
  const t2 = heroSvg(2);
  const t3 = heroSvg(3);
  const t4 = heroSvg(4);
  assertTrue(isDecorativeSvg(t1), 'decorative svg');
  assertEqual([has(t1, 'gear-headset'), has(t1, 'gear-cape'), has(t1, 'gear-crown')].join(), 'false,false,false', 'T1');
  assertEqual([has(t2, 'gear-headset'), has(t2, 'gear-cape'), has(t2, 'gear-crown')].join(), 'true,false,false', 'T2');
  assertEqual([has(t3, 'gear-headset'), has(t3, 'gear-cape'), has(t3, 'gear-crown')].join(), 'true,true,false', 'T3');
  assertEqual([has(t4, 'gear-headset'), has(t4, 'gear-cape'), has(t4, 'gear-crown')].join(), 'true,true,true', 'T4');
  assertEqual(t3.dataset.tier, '3');
});
