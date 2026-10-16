// Shared page components, filled in on load.
//
// <level-header number name counter>: Back, title, optional counter, Start over.
// <helper-bubble>: helper's opening message.
// <level-done heading again next>: finished panel with fun fact and buttons.
// <rainbow-stripes>: six-stripe rainbow; classes, modes, label, geometry.
// <level-picture level>: level-picker card thumbnail.
import { COLORS } from './colors.js';

// One rainbow stripe's path: arc from `outer` to `inner` around `cx` on `base`.
export function stripePath(i, { cx = 320, base = 330, outer = 300, inner = 84 } = {}) {
  const step = (outer - inner) / COLORS.length;
  const r = outer - step * i;
  const q = r - step;
  return `M${cx - r} ${base} A${r} ${r} 0 0 1 ${cx + r} ${base} L${cx + q} ${base} A${q} ${q} 0 0 0 ${cx - q} ${base} Z`;
}

const escape = (text) => String(text).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

// Custom element that renders `html(element)` into itself on first connect.
function define(name, html) {
  if (!globalThis.customElements || customElements.get(name)) return;
  customElements.define(
    name,
    class extends HTMLElement {
      connectedCallback() {
        if (this.dataset.ready) return;
        this.dataset.ready = 'true';
        this.innerHTML = html(this);
      }
    },
  );
}

const BACK_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>';
const RESTART_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></svg>';
const HELPER_FACE = '<svg viewBox="0 0 24 24"><circle cx="9" cy="10" r="1" /><circle cx="15" cy="10" r="1" /><path d="M8 14.5c1.2 1.6 2.4 2.2 4 2.2s2.8-.6 4-2.2" /></svg>';

define('level-header', (el) => {
  const counter = el.getAttribute('counter');
  return `
    <header class="page-header">
      <a class="round-button" href="./levels.html" aria-label="Back to the levels">${BACK_ICON}</a>
      <h1 class="level-title">Level ${escape(el.getAttribute('number'))} · ${escape(el.getAttribute('name'))}</h1>
      ${counter ? `<p class="progress-pill">${escape(counter)}</p>` : ''}
      <button type="button" class="round-button${counter ? '' : ' header-end'}" data-restart aria-label="Start over">${RESTART_ICON}</button>
    </header>`;
});

define('helper-bubble', (el) => `
  <div class="helper">
    <span class="helper-face" aria-hidden="true">${HELPER_FACE}</span>
    <p class="helper-text" aria-live="polite">${escape(el.textContent.trim())}</p>
  </div>`);

define('level-done', (el) => `
  <section class="level-done" hidden>
    <h2 tabindex="-1">${escape(el.getAttribute('heading'))}</h2>
    <p class="fun-fact">${escape(el.textContent.trim())}</p>
    <div class="buttons">
      <button type="button" class="button button-secondary" data-restart>${escape(el.getAttribute('again') ?? 'Play again')}</button>
      <a class="button button-play" href="./levels.html">${escape(el.getAttribute('next') ?? 'More levels')}</a>
    </div>
  </section>`);

define('rainbow-stripes', (el) => {
  const num = (name, fallback) => (el.hasAttribute(name) ? Number(el.getAttribute(name)) : fallback);
  const shape = { cx: num('cx', 320), base: num('base', 330), outer: num('outer', 300), inner: num('inner', 84) };
  const tappable = el.hasAttribute('tappable');
  const label = el.getAttribute('label');
  const svgAttrs = label ? `role="img" aria-label="${escape(label)}"` : tappable ? '' : 'aria-hidden="true"';
  const stripeAttrs = tappable ? ' role="button" tabindex="0"' : '';
  const stripes = COLORS.map(
    (c, i) =>
      `<path class="${escape(el.getAttribute('stripe-class') ?? 'stripe')}"${stripeAttrs} d="${stripePath(i, shape)}" fill="${el.hasAttribute('blank') ? '#ffffff' : c.hex}" />`,
  ).join('');
  const highlight = el.hasAttribute('highlight') ? '<path class="fix-highlight" d="" hidden />' : '';
  return `<svg class="${escape(el.getAttribute('svg-class') ?? '')}" viewBox="${escape(el.getAttribute('viewbox') ?? '0 0 640 340')}" ${svgAttrs}>${stripes}${highlight}</svg>`;
});

const ink = '#1B2A4A';
const [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE] = COLORS.map((c) => c.hex);

const tinyRainbow = (fill, extra = '') =>
  COLORS.map(
    (_, i) => `<path d="${stripePath(i, { cx: 44, base: 50, outer: 36, inner: 12 })}" fill="${fill(i)}"${extra} />`,
  ).join('');

const PICTURES = {
  // Two paint blobs mixing: red and yellow, orange where they overlap.
  'mix-a-color': `
    <circle cx="31" cy="30" r="20" fill="${RED}" />
    <circle cx="57" cy="30" r="20" fill="${YELLOW}" />
    <path d="M44 14.8 A20 20 0 0 1 44 45.2 A20 20 0 0 1 44 14.8 Z" fill="${ORANGE}" />`,
  // A rainbow being built: red and orange in, the rest still outlines.
  'color-order': tinyRainbow((i) => (i < 2 ? COLORS[i].hex : '#ffffff'), ' stroke="#7FA9CC" stroke-width="1.5"'),
  // Memory cards: a matching pair of reds turned over, one still face down
  // with a little rainbow on its back, like in the level.
  'memory-rainbow': `
    <rect x="4" y="8" width="24" height="34" rx="5" fill="#ffffff" stroke="${ink}" stroke-width="2" transform="rotate(-6 16 25)" />
    <circle cx="16" cy="25" r="7" fill="${RED}" transform="rotate(-6 16 25)" />
    <rect x="32" y="12" width="24" height="34" rx="5" fill="#ffffff" stroke="${ink}" stroke-width="2" />
    <circle cx="44" cy="29" r="7" fill="${RED}" />
    <g transform="rotate(6 72 25)">
      <rect x="60" y="8" width="24" height="34" rx="5" fill="#DCEFFF" stroke="${ink}" stroke-width="2" />
      ${COLORS.map((c, i) => `<path d="${stripePath(i, { cx: 72, base: 30, outer: 9, inner: 3 })}" fill="${c.hex}" />`).join('')}
    </g>`,
  // The sun peeking out behind a rain cloud.
  'sun-and-rain': `
    <g stroke="#F2B705" stroke-width="3.5" stroke-linecap="round">
      <path d="M26 3v6M11 18h6M15 7l4 4M37 7l-4 4" />
    </g>
    <circle cx="26" cy="20" r="11" fill="${'#FFD23F'}" />
    <path d="M36 40a10 10 0 0 1 2-19.8 13 13 0 0 1 25 3.3A8.5 8.5 0 0 1 62 40z" fill="#9AA8B8" />
    <g stroke="${BLUE}" stroke-width="3.5" stroke-linecap="round">
      <path d="M41 46l-2 6M50 46l-2 6M59 46l-2 6" />
    </g>`,
  // A paintbrush painting a stripe.
  'paint-a-rainbow': `
    <path d="M8 46 Q30 30 56 40" fill="none" stroke="${PURPLE}" stroke-width="9" stroke-linecap="round" />
    <g transform="rotate(40 64 24)">
      <rect x="60" y="2" width="8" height="26" rx="4" fill="#C98F00" />
      <rect x="59" y="27" width="10" height="7" fill="#B8C4D0" />
      <path d="M59 34h10l-2 12q-3 4-6 0z" fill="${PURPLE}" />
    </g>`,
  // A little white car on the road, like the one in the level.
  'rainbow-road': `
    <rect x="0" y="44" width="88" height="10" rx="5" fill="#7D8A99" />
    <path d="M10 48h12M38 48h12M66 48h12" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
    <path d="M18 40v-8q0-4 4-4h8l7-9h16q3 0 5 3l6 6h6q4 0 4 4v8z" fill="#ffffff" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round" />
    <path d="M38 27l5-6h9l4 6z" fill="#8ECAE6" />
    <circle cx="30" cy="41" r="6" fill="${ink}" />
    <circle cx="62" cy="41" r="6" fill="${ink}" />
    <circle cx="30" cy="41" r="2.5" fill="#ffffff" />
    <circle cx="62" cy="41" r="2.5" fill="#ffffff" />`,
  // Letter tiles: R, A, I in rainbow-bordered boxes.
  'word-scramble': ['R', 'A', 'I']
    .map(
      (letter, i) => `
    <rect x="${3 + i * 28}" y="${i === 1 ? 6 : 14}" width="25" height="25" rx="6" fill="#ffffff" stroke="${COLORS[i].hex}" stroke-width="4" transform="rotate(${[-8, 4, -3][i]} ${15.5 + i * 28} ${i === 1 ? 18.5 : 26.5})" />
    <text x="${15.5 + i * 28}" y="${i === 1 ? 25.5 : 33.5}" text-anchor="middle" font-family="Fredoka, system-ui, sans-serif" font-weight="700" font-size="16" fill="${ink}" transform="rotate(${[-8, 4, -3][i]} ${15.5 + i * 28} ${i === 1 ? 18.5 : 26.5})">${letter}</text>`,
    )
    .join(''),
  // A strawberry about to drop into the red basket.
  'color-sort': `
    <path d="M63 40C63 26 81 26 81 40" fill="none" stroke="${RED}" stroke-width="3" />
    <path d="M60 42H84L80 54H64Z" fill="${RED}" />
    <path d="M66 44V54M72 44V54M78 44V54M62 48H82" stroke="#ffffff" stroke-width="1.5" opacity="0.45" />
    <rect x="58" y="38" width="28" height="6" rx="3" fill="#B52B2E" />
    <path d="M18 30C12 26 8 20 8 14C9 9 14 8 18 10C22 8 27 9 28 14C28 20 24 26 18 30Z" fill="${RED}" />
    <path d="M18 11L13 6L17 7L18 3L19 7L23 6Z" fill="${GREEN}" />
    <path d="M30 16Q50 8 66 30" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="4 4" />
    <path d="M60 28L67 32L68 24" fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`,
  // A jumbled rainbow with swap arrows.
  'fix-the-rainbow': `
    ${tinyRainbow((i) => [GREEN, ORANGE, PURPLE, RED, BLUE, YELLOW][i])}
    <g fill="none" stroke="${ink}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M70 10q8 6 2 14M72 24l-0.5-5M72 24l4.5-1.5" />
      <path d="M18 24q-8-6-2-14M16 10l0.5 5M16 10l-4.5 1.5" />
    </g>`,
};

define('level-picture', (el) => {
  const picture = PICTURES[el.getAttribute('level')];
  if (!picture) throw new Error(`No picture for ${el.getAttribute('level')}`);
  return `<svg class="level-picture" viewBox="0 0 88 56" aria-hidden="true">${picture}</svg>`;
});
