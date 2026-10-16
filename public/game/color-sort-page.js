// Draws Level 9 (Color sort) on color-sort.html and handles dragging.
// A thing can be dragged onto a basket, or a basket tapped, for kids who
// find dragging hard and for keyboards. The rules live in color-sort.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { COLORS, colorById } from './colors.js';
import { wiggle } from './page-helpers.js';
import { currentThing, drop, isDone, message, newGame, thingById } from './color-sort.js';

const ink = '#1B2A4A';
const STEM = '#7A4A22';
const [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE] = COLORS.map((c) => c.hex);
const SEEDS = [[36, 46], [50, 44], [64, 46], [42, 60], [58, 60], [50, 74]];

// Each thing, drawn in a 100 × 100 box.
export const PICTURES = {
  strawberry: `
    <path d="M50 92C30 80 14 60 16 42C18 28 34 24 50 30C66 24 82 28 84 42C86 60 70 80 50 92Z" fill="${RED}" />
    ${SEEDS.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2.5" ry="3.5" fill="#FFE08A" />`).join('')}
    <path d="M50 32L34 20L46 22L50 8L54 22L66 20Z" fill="${GREEN}" />`,
  apple: `
    <path d="M50 30Q56 16 60 8" fill="none" stroke="${STEM}" stroke-width="5" stroke-linecap="round" />
    <path d="M57 20Q68 6 82 12Q72 26 57 20Z" fill="${GREEN}" />
    <path d="M50 30C38 20 16 24 16 50C16 74 34 92 50 86C66 92 84 74 84 50C84 24 62 20 50 30Z" fill="${RED}" />
    <ellipse cx="32" cy="48" rx="6" ry="11" fill="#ffffff" opacity="0.35" />`,
  carrot: `
    <path d="M70 28Q70 10 80 4Q82 18 75 30ZM74 32Q88 18 96 22Q88 32 77 36ZM68 28Q58 14 60 6Q70 14 72 27Z" fill="${GREEN}" />
    <path d="M71 27C81 33 81 43 75 49L23 91C19 93 14 89 16 85L58 29C62 23 67 24 71 27Z" fill="${ORANGE}" />
    <path d="M47 50l8 6M37 63l7 5M29 75l6 4" stroke="#C25E00" stroke-width="3" stroke-linecap="round" />`,
  pumpkin: `
    <path d="M46 30L47 12L55 12L54 30Z" fill="${STEM}" />
    <g fill="${ORANGE}" stroke="#C25E00" stroke-width="3">
      <ellipse cx="30" cy="60" rx="22" ry="28" />
      <ellipse cx="70" cy="60" rx="22" ry="28" />
      <ellipse cx="50" cy="60" rx="20" ry="31" />
    </g>`,
  banana: `
    <path d="M20 22L18 12L28 14L30 24Z" fill="${STEM}" />
    <path d="M18 26C18 68 50 92 88 76C90 72 88 68 84 69C56 76 34 58 30 26C30 20 18 20 18 26Z" fill="${YELLOW}" stroke="#C98F00" stroke-width="3" stroke-linejoin="round" />`,
  lemon: `
    <path d="M56 26Q66 12 80 16Q72 30 56 26Z" fill="${GREEN}" />
    <path d="M8 52Q12 48 16 46C30 22 70 22 84 46Q88 48 92 52Q88 56 84 58C70 82 30 82 16 58Q12 56 8 52Z" fill="${YELLOW}" stroke="#C98F00" stroke-width="3" />
    <ellipse cx="38" cy="44" rx="10" ry="5" fill="#ffffff" opacity="0.4" />`,
  frog: `
    <ellipse cx="26" cy="88" rx="13" ry="6" fill="#2E8A6E" />
    <ellipse cx="74" cy="88" rx="13" ry="6" fill="#2E8A6E" />
    <ellipse cx="50" cy="62" rx="38" ry="28" fill="${GREEN}" />
    <circle cx="31" cy="36" r="15" fill="${GREEN}" />
    <circle cx="69" cy="36" r="15" fill="${GREEN}" />
    <circle cx="31" cy="35" r="9" fill="#ffffff" />
    <circle cx="69" cy="35" r="9" fill="#ffffff" />
    <circle cx="32" cy="36" r="4.5" fill="${ink}" />
    <circle cx="68" cy="36" r="4.5" fill="${ink}" />
    <path d="M34 64Q50 76 66 64" fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" />`,
  leaf: `
    <path d="M14 86C10 46 40 14 88 12C90 60 58 90 14 86Z" fill="${GREEN}" />
    <path d="M14 86Q46 54 80 20M42 58L38 40M56 44L54 28M42 58L60 62M56 44L74 46" fill="none" stroke="#2E8A6E" stroke-width="4" stroke-linecap="round" />`,
  blueberries: [[50, 34], [32, 62], [68, 62]]
    .map(([x, y]) => `
    <circle cx="${x}" cy="${y}" r="20" fill="${BLUE}" />
    <circle cx="${x}" cy="${y - 10}" r="5" fill="#1B4D63" />
    <ellipse cx="${x - 8}" cy="${y + 4}" rx="4" ry="6" fill="#ffffff" opacity="0.3" />`)
    .join(''),
  fish: `
    <path d="M72 50L94 30L94 70Z" fill="${BLUE}" />
    <path d="M40 31Q50 16 62 32Z" fill="#1D6688" />
    <path d="M8 50C26 22 62 22 78 50C62 78 26 78 8 50Z" fill="${BLUE}" />
    <circle cx="28" cy="46" r="6" fill="#ffffff" />
    <circle cx="27" cy="46" r="3" fill="${ink}" />
    <path d="M46 40Q52 50 46 60" fill="none" stroke="#1D6688" stroke-width="3" stroke-linecap="round" />`,
  grapes: `
    <path d="M50 24L52 8" stroke="${STEM}" stroke-width="5" stroke-linecap="round" />
    <path d="M52 14Q66 2 78 10Q68 22 52 14Z" fill="${GREEN}" />
    ${[[30, 34], [50, 32], [70, 34], [40, 52], [60, 52], [30, 70], [50, 70], [70, 70], [50, 87]]
      .filter((_, i) => i !== 5 && i !== 7)
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="12" fill="${PURPLE}" stroke="#5E3A7D" stroke-width="2" />`)
      .join('')}`,
  eggplant: `
    <path d="M44 28L40 10" stroke="${GREEN}" stroke-width="6" stroke-linecap="round" />
    <path d="M34 34C14 54 18 90 44 90C70 90 86 70 76 46C70 34 50 22 34 34Z" fill="${PURPLE}" />
    <path d="M28 40C32 24 54 18 62 30C52 32 40 36 28 40Z" fill="${GREEN}" />
    <ellipse cx="34" cy="64" rx="5" ry="12" fill="#ffffff" opacity="0.3" />`,
};

// A basket of `color`, with `thing` sitting in it once it's sorted.
export function basketPicture(color, thing) {
  return `
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <path d="M24 56C24 22 76 22 76 56" fill="none" stroke="${color}" stroke-width="6" />
      ${thing ? `<g transform="translate(22 2) scale(0.56)"><g class="basket-thing">${PICTURES[thing]}</g></g>` : ''}
      <path d="M10 58H90L80 96H20Z" fill="${color}" />
      <path d="M16 74H84M19 86H81M34 62V96M50 62V96M66 62V96" stroke="#ffffff" stroke-width="3" opacity="0.4" />
      <rect x="6" y="50" width="88" height="12" rx="6" fill="${color}" />
      <rect x="6" y="50" width="88" height="12" rx="6" fill="#000000" opacity="0.15" />
    </svg>`;
}

export function start(doc = document, { random = Math.random } = {}) {
  const stage = doc.querySelector('.sort-stage');
  const thingBox = doc.querySelector('.sort-thing');
  const baskets = [...doc.querySelectorAll('.basket')];
  const progress = doc.querySelector('.progress-pill');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let game;
  let drag = null; // where a drag started, while one is going on
  let shown = null; // the thing drawn on the stage

  function draw(result, color) {
    // A new thing is drawn fresh, so it pops in; a wrong drop keeps it.
    const thing = currentThing(game);
    if (thing !== shown) {
      thingBox.innerHTML = thing ? `<svg viewBox="0 0 100 100">${PICTURES[thing.id]}</svg>` : '';
      thingBox.setAttribute('aria-label', thing ? `The ${thing.name}` : '');
      thingBox.dataset.thing = thing?.id ?? '';
      shown = thing;
    }

    // Each basket shows the thing sorted into it, if there is one yet. Only
    // a basket that just got its thing is redrawn, so only it pops.
    const sortedThings = game.things.slice(0, game.sorted).map(thingById);
    for (const basket of baskets) {
      const color = colorById(basket.dataset.color);
      const inside = sortedThings.find((t) => t.color === color.id);
      if (basket.dataset.holds === (inside?.id ?? '') && basket.querySelector('svg')) continue;
      basket.dataset.holds = inside?.id ?? '';
      basket.querySelector('.basket-picture').innerHTML = basketPicture(color.hex, inside?.id);
      basket.setAttribute('aria-label', `${color.name} basket${inside ? `, with the ${inside.name}` : ''}`);
    }

    helper.textContent = message(game, result, color);
    progress.textContent = `${game.sorted} of ${game.things.length}`;

    const finished = isDone(game);
    stage.hidden = finished;
    helperBox.hidden = finished;
    done.hidden = !finished;
    baskets.forEach((basket) => { basket.disabled = finished; });
    if (finished) done.querySelector('h2').focus();
  }

  function sortInto(basket) {
    if (isDone(game)) return;
    const turn = drop(game, basket.dataset.color);
    game = turn.game;
    if (turn.result === 'wrong') {
      wiggle(basket);
      wiggle(thingBox);
    }
    draw(turn.result, basket.dataset.color);
  }

  // The basket under the point (x, y) on the screen, if any.
  const basketAt = (x, y) => baskets.find((basket) => {
    const r = basket.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  });

  function endDrag(event, dropIt) {
    if (!drag) return;
    const target = dropIt ? basketAt(event.clientX, event.clientY) : null;
    drag = null;
    thingBox.classList.remove('is-dragging');
    thingBox.style.transform = '';
    baskets.forEach((b) => b.classList.remove('is-over'));
    if (target) sortInto(target);
  }

  thingBox.addEventListener('pointerdown', (event) => {
    if (isDone(game)) return;
    event.preventDefault();
    drag = { x: event.clientX, y: event.clientY };
    thingBox.setPointerCapture?.(event.pointerId);
    thingBox.classList.add('is-dragging');
  });
  thingBox.addEventListener('pointermove', (event) => {
    if (!drag) return;
    thingBox.style.transform = `translate(${event.clientX - drag.x}px, ${event.clientY - drag.y}px)`;
    const over = basketAt(event.clientX, event.clientY);
    baskets.forEach((b) => b.classList.toggle('is-over', b === over));
  });
  thingBox.addEventListener('pointerup', (event) => endDrag(event, true));
  thingBox.addEventListener('pointercancel', (event) => endDrag(event, false));

  baskets.forEach((basket) => basket.addEventListener('click', () => sortInto(basket)));

  function restart() {
    game = newGame(random);
    shown = null;
    draw();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current game.
  return { get game() { return game; } };
}
