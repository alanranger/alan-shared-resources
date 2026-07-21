/**
 * Premium orientation diagrams (MC-53) — flat OS/National-Trust style, Alan's palette.
 * Honest by design: built only from viewpoint names already in the workbook and each
 * structure's real, well-established orientation. Elements that cannot be confirmed are
 * left out. Every diagram is labelled "indicative orientation — not to scale".
 */
const cream = '#FAF3E6';
const navy = '#111827';
const orange = '#E57200';
const deep = '#C45F00';
const charcoal = '#2B2622';
const water = '#d6e2ea';
const land = '#ece0c8';
const rule = '#d9ccae';

function frame(title, inner) {
  return `<svg class="orient-diagram" viewBox="0 0 340 188" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
  <rect x="0.5" y="0.5" width="339" height="187" rx="4" fill="${cream}" stroke="${rule}"/>
  <text x="12" y="17" font-size="9" font-weight="bold" letter-spacing="0.5" fill="${deep}" text-transform="uppercase">${title}</text>
  ${inner}
  <text x="12" y="180" font-size="7.5" font-style="italic" fill="${charcoal}">Indicative orientation — not to scale.</text>
</svg>`;
}
function north(x, y) {
  return `<g transform="translate(${x},${y})">
    <line x1="0" y1="14" x2="0" y2="-4" stroke="${navy}" stroke-width="1.4"/>
    <path d="M0 -10 L4 -1 L0 -3 L-4 -1 Z" fill="${navy}"/>
    <text x="0" y="24" font-size="8" font-weight="bold" fill="${navy}" text-anchor="middle">N</text>
  </g>`;
}
function vp(x, y, n) {
  return `<circle cx="${x}" cy="${y}" r="6.5" fill="${orange}"/><text x="${x}" y="${y + 2.6}" font-size="8" font-weight="bold" fill="#fff" text-anchor="middle">${n}</text>`;
}
function arrow(x1, y1, x2, y2) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 5;
  const ax = x2 - h * Math.cos(a - Math.PI / 6);
  const ay = y2 - h * Math.sin(a - Math.PI / 6);
  const bx = x2 - h * Math.cos(a + Math.PI / 6);
  const by = y2 - h * Math.sin(a + Math.PI / 6);
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${deep}" stroke-width="1.6"/><path d="M${x2} ${y2} L${ax.toFixed(1)} ${ay.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)} Z" fill="${deep}"/>`;
}
function key(x, y, items) {
  return items
    .map((t, i) => `<text x="${x}" y="${y + i * 12}" font-size="8" fill="${charcoal}"><tspan font-weight="bold" fill="${deep}">${i + 1}</tspan>  ${t}</text>`)
    .join('');
}

/* Grafton — side elevation: deck over Grafton Gully. No compass (elevation view). */
const grafton = frame(
  'Grafton Bridge — section',
  `<path d="M12 60 L328 60" stroke="${navy}" stroke-width="3"/>
   <path d="M40 60 Q184 150 300 60" fill="none" stroke="${navy}" stroke-width="2.2"/>
   <line x1="60" y1="60" x2="86" y2="112" stroke="${navy}" stroke-width="1.4"/>
   <line x1="120" y1="60" x2="132" y2="128" stroke="${navy}" stroke-width="1.4"/>
   <line x1="220" y1="60" x2="236" y2="128" stroke="${navy}" stroke-width="1.4"/>
   <line x1="280" y1="60" x2="258" y2="112" stroke="${navy}" stroke-width="1.4"/>
   <path d="M12 150 Q90 128 184 150 Q280 168 328 150" fill="${land}" stroke="${rule}"/>
   <path d="M120 150 Q160 132 210 150" fill="none" stroke="${orange}" stroke-width="1.4" stroke-dasharray="3 2"/>
   ${vp(54, 52, 1)}
   ${vp(170, 138, 2)}
   ${arrow(170, 128, 178, 96)}
   ${key(150, 40, ['Deck — access from K\u2019Road / Symonds St', 'Grafton Gully paths — look up at the arch'])}`
);

/* Ngā Hau Māngere — plan: shared path across the Manukau, motorway spans alongside. */
const ngahau = frame(
  'Ngā Hau Māngere — plan',
  `<rect x="12" y="70" width="316" height="70" fill="${water}"/>
   <path d="M12 66 H328" stroke="${rule}"/><path d="M12 140 H328" stroke="${rule}"/>
   <text x="20" y="60" font-size="8" fill="${charcoal}">Onehunga side</text>
   <text x="20" y="156" font-size="8" fill="${charcoal}">Māngere side</text>
   <path d="M70 66 Q184 118 270 140" fill="none" stroke="${navy}" stroke-width="3"/>
   <path d="M70 66 Q190 108 270 140" fill="none" stroke="${orange}" stroke-width="1.3" stroke-dasharray="3 2"/>
   <line x1="96" y1="66" x2="150" y2="140" stroke="${navy}" stroke-width="6" opacity="0.28"/>
   <text x="120" y="112" font-size="7" fill="${charcoal}" transform="rotate(58 120 112)">SH20 — no access</text>
   ${vp(70, 66, 1)}
   ${vp(184, 104, 2)}
   ${vp(270, 140, 3)}
   ${north(316, 26)}
   ${key(150, 34, ['Onehunga abutment (path start)', 'Mid-span — look along the arch', 'Māngere abutment (path end)'])}`
);

/* Auckland Harbour Bridge — plan: shoot from shores only, never the deck. */
const harbour = frame(
  'Auckland Harbour Bridge — plan',
  `<rect x="12" y="40" width="316" height="108" fill="${water}"/>
   <rect x="12" y="40" width="316" height="20" fill="${land}"/>
   <rect x="12" y="128" width="316" height="20" fill="${land}"/>
   <text x="20" y="53" font-size="8" fill="${charcoal}">North Shore — Northcote Pt · Stokes Pt</text>
   <text x="20" y="142" font-size="8" fill="${charcoal}">City side — Westhaven / harbour edge</text>
   <path d="M150 60 Q135 94 150 128" fill="none" stroke="${navy}" stroke-width="3"/>
   <text x="158" y="96" font-size="7" fill="${charcoal}">deck — no access</text>
   ${vp(70, 60, 1)}
   ${vp(110, 60, 2)}
   ${vp(250, 128, 3)}
   ${arrow(70, 68, 120, 92)}
   ${arrow(250, 120, 175, 100)}
   ${north(316, 26)}
   ${key(178, 34, ['Northcote Point lookout', 'Stokes Point lookout', 'Westhaven / city edge'])}`
);

export const orientation = { grafton, ngahau, harbour };
