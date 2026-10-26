// Draws Level 5 (Ice cream shop) on ice-cream.html and handles the taps:
// tap tubs to scoop the cone in the picture, then Sprinkles to hand it over.
// The rules live in ice-cream.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { COLORS, colorById } from './colors.js';
import { wiggle } from './page-helpers.js';
import {
  CUSTOMERS, currentCustomer, isConeDone, isDone, isLastCustomer, message, newGame, nextCustomer, scoop, serve,
} from './ice-cream.js';

const INK = '#1B2A4A';
const PINK = '#F28AB2';

// ---- The customers: a face for each, in a 100 × 100 box ----

const eyes = (happy) => (happy
  ? `<path d="M33 52q5-7 10 0M57 52q5-7 10 0" stroke="${INK}" stroke-width="3.5" stroke-linecap="round" fill="none" />`
  : `<circle cx="38" cy="50" r="4.5" fill="${INK}" /><circle cx="62" cy="50" r="4.5" fill="${INK}" />
     <circle cx="39.5" cy="48.5" r="1.5" fill="#fff" /><circle cx="63.5" cy="48.5" r="1.5" fill="#fff" />`);
const cheeks = `<circle cx="29" cy="62" r="5" fill="${PINK}" opacity="0.6" /><circle cx="71" cy="62" r="5" fill="${PINK}" opacity="0.6" />`;
const smile = (y = 66) => `<path d="M43 ${y}q7 7 14 0" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none" />`;
const head = (fill, stroke = 'none') => `<circle cx="50" cy="56" r="30" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;

const FACES = {
  bunny: (happy) => `
    <ellipse cx="38" cy="20" rx="9" ry="22" fill="#F7F0F4" stroke="#D9CCD6" stroke-width="2" transform="rotate(-8 38 20)" />
    <ellipse cx="62" cy="20" rx="9" ry="22" fill="#F7F0F4" stroke="#D9CCD6" stroke-width="2" transform="rotate(8 62 20)" />
    <ellipse cx="38" cy="21" rx="4" ry="15" fill="${PINK}" transform="rotate(-8 38 21)" />
    <ellipse cx="62" cy="21" rx="4" ry="15" fill="${PINK}" transform="rotate(8 62 21)" />
    ${head('#F7F0F4', '#D9CCD6')}${eyes(happy)}${cheeks}
    <ellipse cx="50" cy="59" rx="4" ry="3" fill="${PINK}" />${smile(63)}`,
  puppy: (happy) => `
    ${head('#D9A066')}
    <ellipse cx="23" cy="52" rx="10" ry="22" fill="#8A5A2B" transform="rotate(18 23 52)" />
    <ellipse cx="77" cy="52" rx="10" ry="22" fill="#8A5A2B" transform="rotate(-18 77 52)" />
    ${eyes(happy)}${cheeks}
    <ellipse cx="50" cy="67" rx="14" ry="10" fill="#F3D3A8" />
    <ellipse cx="50" cy="61" rx="5" ry="4" fill="${INK}" />${smile(68)}`,
  cat: (happy) => `
    <path d="M24 42L27 12L47 30Z" fill="#9AA8B8" /><path d="M76 42L73 12L53 30Z" fill="#9AA8B8" />
    <path d="M28 34L30 19L40 29Z" fill="${PINK}" /><path d="M72 34L70 19L60 29Z" fill="${PINK}" />
    ${head('#9AA8B8')}${eyes(happy)}${cheeks}
    <path d="M46 58h8l-4 4z" fill="${PINK}" />${smile(64)}
    <path d="M14 58h16M15 66l15-3M86 58H70M85 66l-15-3" stroke="${INK}" stroke-width="1.5" stroke-linecap="round" />`,
  bear: (happy) => `
    <circle cx="25" cy="31" r="12" fill="#8A5A2B" /><circle cx="75" cy="31" r="12" fill="#8A5A2B" />
    <circle cx="25" cy="31" r="6" fill="#C68B59" /><circle cx="75" cy="31" r="6" fill="#C68B59" />
    ${head('#A86F3D')}${eyes(happy)}${cheeks}
    <ellipse cx="50" cy="67" rx="14" ry="10" fill="#E2B88A" />
    <ellipse cx="50" cy="61" rx="5" ry="4" fill="${INK}" />${smile(68)}`,
  penguin: (happy) => `
    ${head('#2B3A55')}
    <circle cx="40" cy="53" r="14" fill="#fff" /><circle cx="60" cy="53" r="14" fill="#fff" />
    <ellipse cx="50" cy="66" rx="21" ry="16" fill="#fff" />
    ${eyes(happy)}${cheeks}
    <path d="M43 61h14l-7 8z" fill="#F77F00" />`,
  unicorn: (happy) => `
    <path d="M44 32L50 2L56 32Z" fill="#FCBF49" />
    <path d="M46 24l9-3M47.5 16l7-2.5" stroke="#E09B1A" stroke-width="2" stroke-linecap="round" />
    <path d="M26 40L30 18L44 32Z" fill="#fff" stroke="#D9CCD6" stroke-width="2" />
    <path d="M74 40L70 18L56 32Z" fill="#fff" stroke="#D9CCD6" stroke-width="2" />
    ${head('#fff', '#D9CCD6')}
    <circle cx="27" cy="38" r="8" fill="${PINK}" /><circle cx="22" cy="50" r="8" fill="#7B4FA0" />
    <circle cx="21" cy="63" r="7" fill="#277DA1" /><circle cx="36" cy="30" r="7" fill="#7B4FA0" />
    ${eyes(happy)}${cheeks}${smile(64)}`,
};

export function faceSvg(id, { happy = false } = {}) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${FACES[id](happy)}</svg>`;
}

// ---- Cones: in a 100 × 250 box, room for six scoops ----

const scoopY = (i) => 168 - i * 26; // the middle of scoop i, from the bottom
const CONE = `
  <path d="M22 182H78L50 246Z" fill="#E9A955" />
  <path d="M30 186l22 30M42 186l16 22M54 186l10 14M70 186l-26 38M58 186l-18 26M46 186l-10 14" stroke="#C9853A" stroke-width="2.5" stroke-linecap="round" />
  <rect x="19" y="176" width="62" height="12" rx="6" fill="#D9944A" />`;

const scoopShape = (cy, fill, extra = '') => `
  <g${extra}>
    <circle cx="50" cy="${cy}" r="24" fill="${fill}" />
    ${[-18, -9, 0, 9, 18].map((dx) => `<circle cx="${50 + dx}" cy="${cy + 16}" r="7" fill="${fill}" />`).join('')}
    <ellipse cx="40" cy="${cy - 10}" rx="8" ry="5" fill="#fff" opacity="0.4" />
  </g>`;

const SPRINKLES = [[-14, -10, 30, 'red'], [-4, -17, -40, 'blue'], [8, -14, 70, 'yellow'], [16, -4, -20, 'green'],
  [-17, 2, 80, 'purple'], [2, -4, 10, 'orange'], [10, 6, -60, 'blue'], [-8, 8, 45, 'yellow']];
const sprinklesOn = (cy) => `
  <g class="sprinkles">
    ${SPRINKLES.map(([dx, dy, turn, color]) => `<rect x="${48 + dx}" y="${cy + dy - 1.5}" width="7" height="3" rx="1.5" fill="${colorById(color).hex}" transform="rotate(${turn} ${50 + dx} ${cy + dy})" />`).join('')}
    <path d="M50 ${cy - 28}q2-9 9-12" stroke="#2E8A6E" stroke-width="2.5" stroke-linecap="round" fill="none" />
    <circle cx="50" cy="${cy - 26}" r="7" fill="#D62F32" /><circle cx="47.5" cy="${cy - 28.5}" r="2" fill="#fff" opacity="0.6" />
  </g>`;

// A cone with `scoops`, from the bottom up. `room` dashed outlines show how
// many there will be; `fresh` makes the top scoop plop on; `falling` is a
// scoop of that color sliding off; `sprinkles` tops it off.
export function coneSvg(scoops, { room = scoops.length, fresh = false, falling = null, sprinkles = false, fit = false } = {}) {
  const ghosts = Array.from({ length: room - scoops.length }, (_, k) => {
    const cy = scoopY(scoops.length + k);
    return `<circle class="scoop-ghost" cx="50" cy="${cy}" r="22" fill="#fff" fill-opacity="0.45" stroke="#7FA9CC" stroke-width="2.5" stroke-dasharray="6 5" />`;
  }).join('');
  const drawn = scoops.map((color, i) => scoopShape(scoopY(i), colorById(color).hex, fresh && i === scoops.length - 1 ? ' class="scoop is-new"' : ' class="scoop"')).join('');
  const slide = falling ? scoopShape(scoopY(scoops.length), colorById(falling).hex, ' class="scoop is-falling"') : '';
  const top = sprinkles && scoops.length ? sprinklesOn(scoopY(scoops.length - 1)) : '';
  // `fit` crops the box to the scoops, for the little picture of the order.
  const y0 = fit ? scoopY(Math.max(room, 1) - 1) - 36 : 0;
  return `<svg viewBox="0 ${y0} 100 ${250 - y0}" aria-hidden="true">${CONE}${ghosts}${drawn}${slide}${top}</svg>`;
}

// ---- Tubs of ice cream, in a 100 × 80 box ----

const tubSvg = (hex) => `
  <svg viewBox="0 0 100 80" aria-hidden="true">
    <path d="M18 34q0-26 32-26t32 26z" fill="${hex}" />
    ${[24, 37, 50, 63, 76].map((x) => `<circle cx="${x}" cy="33" r="7" fill="${hex}" />`).join('')}
    <ellipse cx="38" cy="20" rx="8" ry="4" fill="#fff" opacity="0.4" />
    <path d="M12 34h76l-8 42H20z" fill="#fff" stroke="${hex}" stroke-width="4" stroke-linejoin="round" />
    <path d="M15 48h70" stroke="${hex}" stroke-width="6" />
  </svg>`;

const names = (scoops) => scoops.map((c) => colorById(c).name.toLowerCase()).join(', ');

export function start(doc = document) {
  const shop = doc.querySelector('.shop');
  const customer = doc.querySelector('.customer');
  const order = doc.querySelector('.order');
  const cone = doc.querySelector('.cone');
  const parade = doc.querySelector('.parade');
  const tubRow = doc.querySelector('.tubs');
  const progress = doc.querySelector('.progress-pill');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const sprinklesButton = doc.querySelector('#sprinkles');
  const nextButton = doc.querySelector('#next');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let game;

  // A tub for each rainbow color.
  const tubs = COLORS.map((color) => {
    const tub = doc.createElement('button');
    tub.type = 'button';
    tub.className = 'tub';
    tub.dataset.color = color.id;
    tub.setAttribute('aria-label', `${color.name} ice cream`);
    tub.innerHTML = `${tubSvg(color.hex)}${color.name}`;
    tub.addEventListener('click', () => {
      const turn = scoop(game, color.id);
      game = turn.game;
      if (turn.result === 'wrong') wiggle(tub);
      draw(turn.result, color.id);
    });
    return tub;
  });
  tubRow.replaceChildren(...tubs);

  // The six happy customers with their cones, once everyone is served.
  parade.innerHTML = CUSTOMERS.map((c) => `
    <span class="parade-guest">${faceSvg(c.id, { happy: true })}${coneSvg(c.scoops, { sprinkles: true, fit: true })}</span>`).join('');

  function draw(result, color, arriving = false) {
    const { id, name, scoops } = currentCustomer(game);
    customer.innerHTML = faceSvg(id, { happy: game.served });
    customer.classList.toggle('is-happy', game.served);
    customer.classList.toggle('is-arriving', arriving);
    order.innerHTML = coneSvg(scoops, { fit: true });
    order.setAttribute('aria-label', `${name} wants, from the bottom up: ${names(scoops)}`);
    cone.innerHTML = coneSvg(game.cone, {
      room: scoops.length,
      fresh: result === 'right' || result === 'cone',
      falling: result === 'wrong' ? color : null,
      sprinkles: game.served,
    });
    cone.setAttribute('aria-label', game.cone.length ? `Your cone: ${names(game.cone)}` : 'Your cone, empty');
    shop.classList.toggle('is-served', game.served);

    helper.textContent = message(game, result, color);
    progress.textContent = `Customer ${game.customer + 1} of ${CUSTOMERS.length}`;

    const finished = isDone(game);
    tubRow.hidden = isConeDone(game);
    sprinklesButton.hidden = !isConeDone(game) || game.served;
    nextButton.hidden = !game.served || isLastCustomer(game);
    shop.hidden = finished;
    parade.hidden = !finished;
    helperBox.hidden = finished;
    done.hidden = !finished;
    if (finished) done.querySelector('h2').focus();
    else if (result === 'cone') sprinklesButton.focus();
    else if (result === 'served') nextButton.focus();
  }

  sprinklesButton.addEventListener('click', () => {
    const turn = serve(game);
    game = turn.game;
    draw(turn.result);
  });

  nextButton.addEventListener('click', () => {
    game = nextCustomer(game);
    draw(undefined, undefined, true);
    tubs[0].focus();
  });

  function restart() {
    game = newGame();
    draw(undefined, undefined, true);
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current game.
  return { get game() { return game; } };
}
