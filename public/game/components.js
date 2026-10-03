// Shared pieces of the pages, written once here instead of copied into every
// HTML file. Each one is a small custom HTML element that, when the page
// loads, fills itself in with the same markup the pages used to repeat by
// hand, so the styles and the level code work on it unchanged.
//
//   <level-header number="2" name="Color order" counter="Turn 1 of 6">
//     The Back button, the level's title, an optional counter, and Start over.
//
//   <helper-bubble>What color do they make?</helper-bubble>
//     The smiling helper and what it says first.
//
//   <level-done heading="You did it!" again="Play again" next="More levels">
//     Fun fact: ...
//   </level-done>
//     The panel shown when a level is finished: heading, fun fact, and the
//     Play again and More levels buttons.
//
//   <rainbow-stripes svg-class="build-rainbow" stripe-class="build-stripe" blank>
//     The rainbow picture, six stripes drawn from one shape. Options:
//       svg-class, stripe-class  classes for the picture and each stripe
//       blank                    white stripes, for a level to color in
//       tappable                 stripes are buttons (for tapping)
//       label="A rainbow"        a description for screen readers
//       highlight                adds Fix the rainbow's outline shape
//       viewbox, cx, base, outer, inner  the size and shape (see stripePath)
import { COLORS } from './colors.js';

// The path for one stripe of a rainbow centered at `cx` on the line `base`,
// running from radius `outer` (outside of the red stripe) in to `inner`.
export function stripePath(i, { cx = 320, base = 330, outer = 300, inner = 84 } = {}) {
  const step = (outer - inner) / COLORS.length;
  const r = outer - step * i;
  const q = r - step;
  return `M${cx - r} ${base} A${r} ${r} 0 0 1 ${cx + r} ${base} L${cx + q} ${base} A${q} ${q} 0 0 0 ${cx - q} ${base} Z`;
}

const escape = (text) => String(text).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

// Defines an element that renders `html(element)` into itself once, when it's
// first put on the page.
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
