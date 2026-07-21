/** Simple orange/navy viewpoint diagrams — drawn only, no photos. */
const orange = '#E57200';
const navy = '#111827';

export const diagrams = {
  grafton: `<svg class="view-diagram" viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-label="Grafton Bridge viewpoints">
  <rect width="320" height="140" fill="#faf3e6"/>
  <path d="M20 95 Q160 25 300 95" fill="none" stroke="${navy}" stroke-width="3"/>
  <path d="M20 95 L300 95" stroke="${navy}" stroke-width="2"/>
  <rect x="40" y="78" width="240" height="6" fill="${orange}" opacity="0.5"/>
  <circle cx="55" cy="72" r="5" fill="${orange}"/><text x="55" y="118" text-anchor="middle" font-size="8" fill="${navy}">Deck</text>
  <circle cx="160" cy="108" r="5" fill="${orange}"/><text x="160" y="128" text-anchor="middle" font-size="8" fill="${navy}">Gully path</text>
  <circle cx="265" cy="72" r="5" fill="${orange}"/><text x="265" y="118" text-anchor="middle" font-size="8" fill="${navy}">Deck</text>
  <text x="160" y="14" text-anchor="middle" font-size="9" fill="${navy}" font-weight="bold">Public viewpoints (diagram)</text>
</svg>`,
  ngahau: `<svg class="view-diagram" viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-label="Ngā Hau Māngere viewpoints">
  <rect width="320" height="140" fill="#faf3e6"/>
  <path d="M30 70 Q160 35 290 70" fill="none" stroke="${navy}" stroke-width="3"/>
  <path d="M30 70 Q160 85 290 70" stroke="${navy}" stroke-width="2" fill="none"/>
  <line x1="30" y1="70" x2="30" y2="95" stroke="${navy}" stroke-width="2"/>
  <line x1="290" y1="70" x2="290" y2="95" stroke="${navy}" stroke-width="2"/>
  <circle cx="30" cy="98" r="5" fill="${orange}"/><text x="30" y="118" text-anchor="middle" font-size="7" fill="${navy}">Onehunga</text>
  <circle cx="160" cy="58" r="5" fill="${orange}"/><text x="160" y="48" text-anchor="middle" font-size="7" fill="${navy}">Mid-span</text>
  <circle cx="290" cy="98" r="5" fill="${orange}"/><text x="290" y="118" text-anchor="middle" font-size="7" fill="${navy}">Māngere</text>
  <text x="160" y="14" text-anchor="middle" font-size="9" fill="${navy}" font-weight="bold">Shared path viewpoints (diagram)</text>
</svg>`,
  harbour: `<svg class="view-diagram" viewBox="0 0 320 140" xmlns="http://www.w3.org/2000/svg" aria-label="Harbour Bridge viewpoints">
  <rect width="320" height="140" fill="#faf3e6"/>
  <rect x="0" y="78" width="320" height="62" fill="#dbeafe" opacity="0.5"/>
  <path d="M40 78 Q160 28 280 78" fill="none" stroke="${navy}" stroke-width="3"/>
  <line x1="40" y1="78" x2="280" y2="78" stroke="${navy}" stroke-width="2"/>
  <circle cx="55" cy="105" r="5" fill="${orange}"/><text x="55" y="125" text-anchor="middle" font-size="7" fill="${navy}">Northcote</text>
  <circle cx="95" cy="105" r="5" fill="${orange}"/><text x="95" y="125" text-anchor="middle" font-size="7" fill="${navy}">Stokes Pt</text>
  <circle cx="230" cy="105" r="5" fill="${orange}"/><text x="230" y="125" text-anchor="middle" font-size="7" fill="${navy}">Westhaven</text>
  <text x="160" y="14" text-anchor="middle" font-size="9" fill="${navy}" font-weight="bold">Shore viewpoints only — not motorway (diagram)</text>
</svg>`
};
