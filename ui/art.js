// Original inline-SVG art for Network-Quest (feature 002). Every drawing is decorative:
// aria-hidden, never focusable, and every outcome it shows is also stated in text.
// The markup below is static and authored here (no user content), so it is safe to inject.

const NS = 'http://www.w3.org/2000/svg';
const INK = '#2a2620';

function svg(viewBox, inner, cls, extra = {}) {
  const el = document.createElementNS(NS, 'svg');
  el.setAttribute('viewBox', viewBox);
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('focusable', 'false');
  el.setAttribute('class', cls);
  for (const [k, v] of Object.entries(extra)) el.setAttribute(k, v);
  el.innerHTML = inner;
  return el;
}

// ------------------------------------------------------------------ hero

const SKIN = '#f2c6a0';

/** NetworkSerf. Tier 1 tunic; 2 adds a headset; 3 adds a cape; 4 adds a crown. */
export function heroSvg(tier = 1, { portrait = false } = {}) {
  const t = Math.max(1, Math.min(4, tier));
  const cape = t >= 3 ? `
    <g class="gear-cape">
      <path d="M74 98 Q56 150 58 204 L142 204 Q140 150 126 98 Z" fill="#8b1e3f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M78 104 Q66 150 68 198" fill="none" stroke="#b8325a" stroke-width="4" stroke-linecap="round"/>
    </g>` : '';
  const headset = t >= 2 ? `
    <g class="gear-headset">
      <path d="M69 66 Q68 28 100 28 Q132 28 131 66" fill="none" stroke="#2f3640" stroke-width="6" stroke-linecap="round"/>
      <rect x="123" y="56" width="13" height="20" rx="5" fill="#2f3640"/>
      <path d="M130 75 Q128 94 113 94" fill="none" stroke="#2f3640" stroke-width="3" stroke-linecap="round"/>
      <circle cx="111" cy="94" r="4" fill="#e04f3f"/>
    </g>` : '';
  const crown = t >= 4 ? `
    <g class="gear-crown">
      <path d="M74 44 L80 16 L92 32 L100 10 L108 32 L120 16 L126 44 Z" fill="#e6b450" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="100" cy="30" r="4" fill="#3fb6a8"/><circle cx="84" cy="34" r="3" fill="#e04f3f"/><circle cx="116" cy="34" r="3" fill="#e04f3f"/>
    </g>` : '';
  const inner = `
    <ellipse cx="100" cy="210" rx="52" ry="8" fill="rgba(0,0,0,0.25)"/>
    ${cape}
    <g class="hero-legs">
      <rect x="80" y="160" width="16" height="40" rx="4" fill="#3b3f5c" stroke="${INK}" stroke-width="3"/>
      <rect x="104" y="160" width="16" height="40" rx="4" fill="#3b3f5c" stroke="${INK}" stroke-width="3"/>
      <rect x="74" y="194" width="26" height="12" rx="5" fill="#5a3a22" stroke="${INK}" stroke-width="3"/>
      <rect x="102" y="194" width="26" height="12" rx="5" fill="#5a3a22" stroke="${INK}" stroke-width="3"/>
    </g>
    <path d="M78 104 L64 138" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>
    <path d="M78 104 L64 138" stroke="#2e7d6b" stroke-width="11" stroke-linecap="round"/>
    <circle cx="63" cy="141" r="7" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>
    <path d="M72 100 Q100 88 128 100 L134 168 Q100 177 66 168 Z" fill="#2e7d6b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M90 96 L100 112 L110 96" fill="none" stroke="#e6b450" stroke-width="3"/>
    <rect x="68" y="140" width="64" height="9" fill="#6b4a2b" stroke="${INK}" stroke-width="2"/>
    <rect x="94" y="138" width="12" height="13" rx="2" fill="#e6b450" stroke="${INK}" stroke-width="2"/>
    <g class="hero-sword">
      <polygon points="150,122 182,58 192,63 160,127" fill="#dfe7ef" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <rect x="180" y="44" width="16" height="20" rx="3" transform="rotate(27 188 54)" fill="#bfe3f7" stroke="${INK}" stroke-width="3"/>
      <path d="M184 47 l2 6 M188 45 l2 6 M192 43 l2 6" stroke="#e6b450" stroke-width="2" transform="rotate(27 188 54)"/>
      <rect x="141" y="117" width="26" height="8" rx="3" transform="rotate(27 154 121)" fill="#6b4a2b" stroke="${INK}" stroke-width="2"/>
      <path d="M150 126 Q140 150 120 160" fill="none" stroke="#1f6fb2" stroke-width="4" stroke-linecap="round"/>
    </g>
    <path d="M122 104 L146 128" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>
    <path d="M122 104 L146 128" stroke="#2e7d6b" stroke-width="11" stroke-linecap="round"/>
    <circle cx="148" cy="129" r="8" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>
    <circle cx="100" cy="68" r="30" fill="${SKIN}" stroke="${INK}" stroke-width="3"/>
    <path d="M70 64 Q70 34 100 35 Q130 34 131 62 Q120 48 102 50 Q84 49 70 64 Z" fill="#5a3a22" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="94" cy="70" r="3.6" fill="${INK}"/><circle cx="112" cy="70" r="3.6" fill="${INK}"/>
    <circle cx="88" cy="80" r="4" fill="#f09a8a" opacity="0.6"/><circle cx="118" cy="80" r="4" fill="#f09a8a" opacity="0.6"/>
    <path d="M96 82 Q104 89 112 82" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    ${headset}
    ${crown}`;
  const el = svg(portrait ? '62 6 76 92' : '40 0 160 220', inner, `art hero hero-tier-${t}`);
  el.dataset.tier = String(t);
  return el;
}

// ------------------------------------------------------------------ monsters

const eye = (cx, cy, r = 9, look = 'left') => {
  const dx = look === 'left' ? -3 : look === 'down' ? -1 : 0;
  const dy = look === 'down' ? 3 : 0;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff" stroke="${INK}" stroke-width="3"/>`
    + `<circle cx="${cx + dx}" cy="${cy + dy}" r="${r * 0.45}" fill="${INK}"/>`;
};

const MONSTERS = {
  // L1R1 — a lonely creature whose network plug dangles, unplugged from any DHCP server.
  imp: `
    <ellipse cx="100" cy="186" rx="56" ry="9" fill="rgba(0,0,0,0.25)"/>
    <path d="M100 66 Q104 40 126 30 Q146 22 150 40" fill="none" stroke="#3b3f5c" stroke-width="5" stroke-linecap="round"/>
    <rect x="140" y="38" width="18" height="16" rx="3" transform="rotate(20 149 46)" fill="#bfe3f7" stroke="${INK}" stroke-width="3"/>
    <path d="M160 30 l8 -6 M163 40 l10 0" stroke="#e6b450" stroke-width="3" stroke-linecap="round"/>
    <path d="M62 84 L52 52 L80 74 Z" fill="#5e4386" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M138 84 L148 52 L120 74 Z" fill="#5e4386" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="72" cy="176" rx="18" ry="10" fill="#5e4386" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="128" cy="176" rx="18" ry="10" fill="#5e4386" stroke="${INK}" stroke-width="3"/>
    <circle cx="100" cy="122" r="56" fill="#7d5ba6" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="100" cy="146" rx="32" ry="24" fill="#a68bc9"/>
    <rect x="72" y="138" width="56" height="18" rx="5" fill="#fffaf0" stroke="${INK}" stroke-width="2"/>
    <text x="100" y="152" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="13" font-weight="700" fill="${INK}">169.254</text>
    ${eye(82, 108, 11, 'down')}${eye(118, 108, 11, 'down')}
    <path d="M76 92 L92 98 M124 92 L108 98" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <path d="M88 130 Q100 122 112 130" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <path d="M60 118 Q44 128 46 146" fill="none" stroke="#5e4386" stroke-width="10" stroke-linecap="round"/>
    <path d="M140 118 Q156 128 154 146" fill="none" stroke="#5e4386" stroke-width="10" stroke-linecap="round"/>`,

  // L1R2 (boss) — a glowing sprite suspicious of unfamiliar private addresses.
  sprite: `
    <ellipse cx="100" cy="188" rx="44" ry="8" fill="rgba(0,0,0,0.2)"/>
    <ellipse cx="62" cy="86" rx="34" ry="52" transform="rotate(-25 62 86)" fill="#9be7e0" opacity="0.75" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="138" cy="86" rx="34" ry="52" transform="rotate(25 138 86)" fill="#9be7e0" opacity="0.75" stroke="${INK}" stroke-width="2"/>
    <circle cx="100" cy="110" r="70" fill="#3fb6a8" opacity="0.15"/>
    <path d="M100 96 Q140 120 120 176 L80 176 Q60 120 100 96 Z" fill="#3fb6a8" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="100" cy="76" r="30" fill="#7fdcd2" stroke="${INK}" stroke-width="3"/>
    <path d="M72 64 L58 40 L82 56 Z M128 64 L142 40 L118 56 Z" fill="#7fdcd2" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M80 72 Q88 66 96 72 M104 72 Q112 66 120 72" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="88" cy="74" r="3" fill="${INK}"/><circle cx="112" cy="74" r="3" fill="${INK}"/>
    <path d="M90 90 Q100 86 112 92" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <path d="M78 128 L48 112" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <rect x="10" y="86" width="54" height="30" rx="5" fill="#fffaf0" stroke="${INK}" stroke-width="3"/>
    <text x="37" y="107" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="15" font-weight="700" fill="${INK}">10.?</text>
    <path d="M160 40 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" fill="#fff6c2" stroke="${INK}" stroke-width="1.5"/>
    <path d="M40 160 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" fill="#fff6c2" stroke="${INK}" stroke-width="1.5"/>`,

  // L2R1 — a goblin peeking over half a wall: the /25 split.
  goblin: `
    <ellipse cx="100" cy="190" rx="70" ry="8" fill="rgba(0,0,0,0.25)"/>
    <path d="M58 70 L22 52 L52 92 Z M142 70 L178 52 L148 92 Z" fill="#5d9a45" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="100" cy="86" r="44" fill="#6aa84f" stroke="${INK}" stroke-width="3"/>
    <path d="M70 128 Q100 112 130 128 L136 150 L64 150 Z" fill="#6aa84f" stroke="${INK}" stroke-width="3"/>
    ${eye(84, 78, 10)}${eye(116, 78, 10)}
    <path d="M72 64 L94 70 M128 64 L106 70" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <path d="M78 100 Q100 118 122 100 Z" fill="#7a1f1f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M86 101 l4 7 l4 -7 M104 101 l4 7 l4 -7" fill="#fff" stroke="${INK}" stroke-width="1.5"/>
    <g class="half-wall">
      <rect x="20" y="132" width="160" height="56" fill="#a5523b" stroke="${INK}" stroke-width="3"/>
      <path d="M20 150 H180 M20 168 H180 M60 132 V150 M110 132 V150 M150 132 V150 M40 150 V168 M85 150 V168 M130 150 V168 M170 150 V168 M60 168 V188 M110 168 V188 M150 168 V188" stroke="#6e3022" stroke-width="2.5"/>
      <rect x="74" y="152" width="52" height="22" rx="4" fill="#fffaf0" stroke="${INK}" stroke-width="2"/>
      <text x="100" y="169" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="15" font-weight="700" fill="${INK}">/25</text>
    </g>`,

  // L2R2 (boss) — a troll who thinks a different third octet means a different subnet.
  troll: `
    <ellipse cx="100" cy="190" rx="66" ry="9" fill="rgba(0,0,0,0.28)"/>
    <rect x="70" y="150" width="24" height="36" rx="6" fill="#64707c" stroke="${INK}" stroke-width="3"/>
    <rect x="106" y="150" width="24" height="36" rx="6" fill="#64707c" stroke="${INK}" stroke-width="3"/>
    <path d="M52 104 Q100 70 148 104 L156 160 Q100 176 44 160 Z" fill="#7f8c99" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="100" cy="72" r="38" fill="#8d9aa7" stroke="${INK}" stroke-width="3"/>
    <circle cx="88" cy="66" r="5" fill="${INK}"/><circle cx="112" cy="66" r="5" fill="${INK}"/>
    <path d="M76 54 L96 60 M124 54 L104 60" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M80 90 Q100 98 120 90" fill="none" stroke="${INK}" stroke-width="3"/>
    <path d="M84 92 L80 78 L90 90 Z M116 92 L120 78 L110 90 Z" fill="#fffaf0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M56 114 L28 140" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
    <path d="M56 114 L28 140" stroke="#7f8c99" stroke-width="14" stroke-linecap="round"/>
    <g class="club">
      <path d="M22 150 L6 40 Q8 22 28 24 Q46 28 40 46 L34 150 Z" fill="#8b5a2b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <text x="24" y="70" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="14" font-weight="700" fill="#fffaf0" transform="rotate(-6 24 70)">/22</text>
    </g>
    <circle cx="28" cy="142" r="11" fill="#8d9aa7" stroke="${INK}" stroke-width="3"/>
    <path d="M144 114 Q170 130 162 156" fill="none" stroke="${INK}" stroke-width="20" stroke-linecap="round"/>
    <path d="M144 114 Q170 130 162 156" fill="none" stroke="#7f8c99" stroke-width="14" stroke-linecap="round"/>`,

  // L3R1 — a wraith that trails shortcut arrows: "the shortest AS path always wins".
  wraith: `
    <ellipse cx="100" cy="190" rx="48" ry="7" fill="rgba(0,0,0,0.2)"/>
    <path d="M150 120 Q176 116 190 100 M150 140 Q178 140 196 128" fill="none" stroke="#b9b0e8" stroke-width="4" stroke-linecap="round" stroke-dasharray="6 6"/>
    <path d="M10 70 H52 M40 58 L54 70 L40 82" fill="none" stroke="#e6b450" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14 104 H46 M36 94 L48 104 L36 114" fill="none" stroke="#e6b450" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M100 30 Q150 30 154 92 L156 160 Q146 150 136 168 Q124 152 112 172 Q100 154 88 172 Q76 152 64 168 Q54 150 44 160 L46 92 Q50 30 100 30 Z" fill="#d9d4f2" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="82" cy="84" rx="11" ry="15" fill="#3b2f5e"/><ellipse cx="118" cy="84" rx="11" ry="15" fill="#3b2f5e"/>
    <circle cx="79" cy="80" r="3.5" fill="#bfe3f7"/><circle cx="115" cy="80" r="3.5" fill="#bfe3f7"/>
    <ellipse cx="100" cy="118" rx="12" ry="9" fill="#3b2f5e"/>
    <path d="M46 110 Q26 116 22 134 M154 110 Q174 116 178 134" fill="none" stroke="#d9d4f2" stroke-width="10" stroke-linecap="round"/>`,

  // L3R2 (BGP Boss) — a treasure-chest mimic flaunting its tempting low MED.
  mimic: `
    <ellipse cx="100" cy="190" rx="78" ry="9" fill="rgba(0,0,0,0.3)"/>
    <path d="M30 70 Q100 20 170 70 L170 92 L30 92 Z" fill="#8b5a2b" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M30 76 Q100 30 170 76" fill="none" stroke="#e6b450" stroke-width="6"/>
    ${eye(76, 62, 12)}${eye(124, 62, 12)}
    <path d="M60 46 L88 54 M140 46 L112 54" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M34 92 L166 92 L160 118 L40 118 Z" fill="#7a1f1f" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M70 108 Q100 128 130 108 Q118 122 100 122 Q82 122 70 108 Z" fill="#e04f3f" stroke="${INK}" stroke-width="2"/>
    <path d="M40 92 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l6 -12" fill="#fffaf0" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <rect x="28" y="118" width="144" height="64" rx="4" fill="#8b5a2b" stroke="${INK}" stroke-width="3"/>
    <path d="M28 136 H172 M28 164 H172" stroke="#6b4421" stroke-width="2.5"/>
    <rect x="56" y="118" width="12" height="64" fill="#e6b450" stroke="${INK}" stroke-width="2"/>
    <rect x="132" y="118" width="12" height="64" fill="#e6b450" stroke="${INK}" stroke-width="2"/>
    <rect x="88" y="126" width="24" height="26" rx="4" fill="#e6b450" stroke="${INK}" stroke-width="2.5"/>
    <circle cx="100" cy="138" r="4" fill="${INK}"/>
    <path d="M170 128 Q186 132 186 148" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="166" y="148" width="34" height="24" rx="4" fill="#fffaf0" stroke="${INK}" stroke-width="2.5"/>
    <text x="183" y="159" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="9" font-weight="700" fill="${INK}">MED</text>
    <text x="183" y="169" text-anchor="middle" font-family="ui-monospace, Consolas, monospace" font-size="10" font-weight="700" fill="#a3271a">0</text>`,
};

export function monsterSvg(id) {
  if (!(id in MONSTERS)) throw new Error(`No monster art for "${id}"`);
  const el = svg('0 0 200 200', MONSTERS[id], `art monster monster-${id}`);
  el.dataset.art = id;
  return el;
}

// ------------------------------------------------------------------ scenes

const SCENES = {
  'help-desk-gate': `
    <defs><linearGradient id="sky-hdg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8fc8f0"/><stop offset="1" stop-color="#f7dcb4"/></linearGradient></defs>
    <rect width="800" height="300" fill="url(#sky-hdg)"/>
    <circle cx="680" cy="70" r="34" fill="#fff3c4"/>
    <path d="M0 210 Q140 150 300 196 Q460 140 620 190 Q720 160 800 186 V300 H0 Z" fill="#9cc58a"/>
    <g opacity="0.95">
      <rect x="330" y="96" width="140" height="120" fill="#b7aa96" stroke="#5f574b" stroke-width="4"/>
      <path d="M360 216 V160 Q400 120 440 160 V216 Z" fill="#4a3f33"/>
      <rect x="318" y="84" width="34" height="132" fill="#c9bca6" stroke="#5f574b" stroke-width="4"/>
      <rect x="448" y="84" width="34" height="132" fill="#c9bca6" stroke="#5f574b" stroke-width="4"/>
      <path d="M318 84 h8 v-10 h8 v10 h8 v-10 h8 v10 M448 84 h8 v-10 h8 v10 h8 v-10 h8 v10" fill="none" stroke="#5f574b" stroke-width="4"/>
      <rect x="370" y="104" width="60" height="18" rx="3" fill="#fffaf0" stroke="#5f574b" stroke-width="3"/>
      <text x="400" y="118" text-anchor="middle" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#2a2620">HELP DESK</text>
    </g>
    <g>
      <rect x="70" y="176" width="110" height="12" fill="#8b5a2b" stroke="#2a2620" stroke-width="3"/>
      <rect x="80" y="188" width="10" height="30" fill="#6b4421"/><rect x="160" y="188" width="10" height="30" fill="#6b4421"/>
      <rect x="100" y="136" width="54" height="38" rx="4" fill="#2f3640" stroke="#2a2620" stroke-width="3"/>
      <rect x="106" y="142" width="42" height="26" fill="#7fdcd2"/>
      <path d="M112 152 h14 M112 158 h24" stroke="#2f3640" stroke-width="2"/>
    </g>
    <path d="M320 300 Q380 240 400 216 Q420 240 480 300 Z" fill="#d9c79f"/>
    <rect y="262" width="800" height="38" fill="#7fb06c"/>`,

  'walled-towns': `
    <defs><linearGradient id="sky-wt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f3a76b"/><stop offset="1" stop-color="#fbe2b8"/></linearGradient></defs>
    <rect width="800" height="300" fill="url(#sky-wt)"/>
    <circle cx="120" cy="90" r="40" fill="#ffe0a3"/>
    <path d="M0 200 Q200 160 400 190 Q600 150 800 184 V300 H0 Z" fill="#c9a66b"/>
    <g fill="#b98e62" stroke="#5f4630" stroke-width="4">
      <rect x="40" y="130" width="300" height="70"/>
      <rect x="440" y="120" width="320" height="80"/>
      <rect x="30" y="100" width="44" height="100"/><rect x="306" y="100" width="44" height="100"/>
      <rect x="430" y="90" width="44" height="110"/><rect x="726" y="90" width="44" height="110"/>
    </g>
    <path d="M40 130 h12 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10 h12 v10 h12 v-10 h12 v10"
      fill="none" stroke="#5f4630" stroke-width="4"/>
    <path d="M52 100 V72 M328 100 V72 M452 90 V60 M748 90 V60" stroke="#5f4630" stroke-width="4"/>
    <path d="M52 72 l24 8 l-24 8 Z M328 72 l24 8 l-24 8 Z" fill="#2e7d6b"/>
    <path d="M452 60 l24 8 l-24 8 Z M748 60 l24 8 l-24 8 Z" fill="#8b1e3f"/>
    <path d="M160 200 V160 Q190 132 220 160 V200 Z M580 200 V156 Q610 128 640 156 V200 Z" fill="#4a3426"/>
    <rect y="258" width="800" height="42" fill="#b48d55"/>`,

  'bgp-citadel': `
    <defs><linearGradient id="sky-bgp" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b1640"/><stop offset="1" stop-color="#5b3a74"/></linearGradient></defs>
    <rect width="800" height="300" fill="url(#sky-bgp)"/>
    <g fill="#fff6c2"><circle cx="60" cy="40" r="2"/><circle cx="160" cy="80" r="1.6"/><circle cx="250" cy="30" r="2.2"/>
      <circle cx="560" cy="50" r="1.8"/><circle cx="640" cy="24" r="2.4"/><circle cx="740" cy="70" r="1.6"/><circle cx="460" cy="20" r="1.5"/></g>
    <circle cx="700" cy="60" r="26" fill="#e9e4ff"/><circle cx="712" cy="52" r="24" fill="#1f1945"/>
    <path d="M0 220 Q200 170 400 200 Q600 160 800 196 V300 H0 Z" fill="#2c2443"/>
    <g fill="#3d3260" stroke="#120e26" stroke-width="4">
      <rect x="320" y="70" width="160" height="140"/>
      <rect x="296" y="40" width="44" height="170"/><rect x="460" y="40" width="44" height="170"/>
      <rect x="378" y="20" width="44" height="80"/>
    </g>
    <path d="M296 40 l22 -30 l22 30 Z M460 40 l22 -30 l22 30 Z M378 20 l22 -26 l22 26 Z" fill="#8b1e3f" stroke="#120e26" stroke-width="4" stroke-linejoin="round"/>
    <g fill="#f3c16b"><rect x="312" y="80" width="12" height="18"/><rect x="476" y="80" width="12" height="18"/>
      <rect x="394" y="44" width="12" height="18"/><rect x="350" y="120" width="12" height="18"/><rect x="438" y="120" width="12" height="18"/></g>
    <path d="M370 210 V170 Q400 140 430 170 V210 Z" fill="#120e26"/>
    <g fill="none" stroke-width="6" stroke-linecap="round" opacity="0.85">
      <path d="M400 214 Q300 240 120 300" stroke="#e6b450"/>
      <path d="M400 214 Q420 250 400 300" stroke="#5ec4cc"/>
      <path d="M400 214 Q520 236 700 300" stroke="#e04f3f"/>
    </g>
    <rect y="270" width="800" height="30" fill="#221b38"/>`,
};

export function sceneSvg(id) {
  if (!(id in SCENES)) throw new Error(`No scene art for "${id}"`);
  return svg('0 0 800 300', SCENES[id], `art scene scene-${id}`, { preserveAspectRatio: 'xMidYMid slice' });
}

// ------------------------------------------------------------------ icons & effects

const ICONS = {
  'no-lease': '<path d="M3 21 L17 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M14 4 L20 4 L20 10 Z" fill="currentColor"/><circle cx="6" cy="18" r="2" fill="currentColor"/>',
  'gateway-off-subnet': '<path d="M3 21 V9 Q12 1 21 9 V21" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M8 21 V14 Q12 10 16 14 V21" fill="currentColor"/>',
  'config-valid': '<path d="M12 2 L20 6 V12 Q20 19 12 22 Q4 19 4 12 V6 Z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M8 12 l3 3 l5 -6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  path: '<path d="M4 20 Q8 10 12 12 Q16 14 20 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="3 3"/><circle cx="20" cy="4" r="2.4" fill="currentColor"/>',
  attack: '<path d="M4 20 L16 8 M14 4 L20 4 L20 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M5 15 L9 19" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  scout: '<circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 15 L21 21" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
  scroll: '<path d="M6 4 H18 Q20 4 20 6 V18 Q20 20 18 20 H8 Q6 20 6 18 Z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M9 9 H17 M9 13 H17" stroke="currentColor" stroke-width="2"/>',
  next: '<path d="M5 12 H18 M13 6 L19 12 L13 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
};

export function icon(name) {
  return svg('0 0 24 24', ICONS[name] ?? ICONS.path, `icon icon-${name}`);
}

export function hitSparkSvg() {
  return svg('0 0 100 100', `
    <path d="M50 4 L58 36 L92 22 L66 48 L96 62 L60 62 L66 96 L48 68 L24 92 L32 58 L4 50 L34 40 L18 10 L44 32 Z"
      fill="#ffd54a" stroke="#e04f3f" stroke-width="3" stroke-linejoin="round"/>`, 'art fx-spark');
}

export function shieldSvg() {
  return svg('0 0 100 100', `
    <path d="M50 6 L88 20 V48 Q88 80 50 96 Q12 80 12 48 V20 Z" fill="rgba(191,227,247,0.85)" stroke="#1f6fb2" stroke-width="5"/>
    <path d="M50 18 L76 28 V48 Q76 70 50 82" fill="none" stroke="#fff" stroke-width="4" opacity="0.8"/>`, 'art fx-shield');
}
