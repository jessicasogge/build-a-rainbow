// Draws Level 4 (Rainbow garden) on rainbow-garden.html and handles the
// taps: pick a seed packet, then tap pots to plant it. The rules live in
// rainbow-garden.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { COLORS, colorById } from './colors.js';
import { wiggle } from './page-helpers.js';
import {
  POTS, ROUNDS, isDone, isLastRound, isRoundDone, message, newGame, nextRound, plant, planted, wanted,
} from './rainbow-garden.js';

// A flower of `color`: a stem and leaves, then five petals round a middle.
export function flowerPicture(color) {
  const hex = colorById(color).hex;
  const middle = color === 'yellow' || color === 'orange' ? '#7A4A22' : '#FCBF49';
  const petals = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    return `<circle cx="${(50 + 14 * Math.cos(a)).toFixed(1)}" cy="${(36 + 14 * Math.sin(a)).toFixed(1)}" r="11" fill="${hex}" />`;
  }).join('');
  return `
    <g class="flower-stem">
      <path d="M50 96V44" stroke="#2E8A6E" stroke-width="5" stroke-linecap="round" />
      <path d="M50 78q-16-2-20-14q14 0 20 12z" fill="#43AA8B" />
      <path d="M50 70q16-2 20-14q-14 0-20 12z" fill="#43AA8B" />
    </g>
    <g class="flower-head">${petals}<circle cx="50" cy="36" r="9" fill="${middle}" /></g>`;
}

const POT = `
  <path d="M26 96h48l-6 40H32z" fill="#C8693A" />
  <rect x="22" y="90" width="56" height="12" rx="4" fill="#D97B49" />
  <ellipse cx="50" cy="92" rx="24" ry="4" fill="#6B4228" />`;

export function start(doc = document) {
  const garden = doc.querySelector('.garden');
  const goal = doc.querySelector('.garden-goal');
  const packetRow = doc.querySelector('.seed-packets');
  const progress = doc.querySelector('.progress-pill');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const nextButton = doc.querySelector('#next');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let game;
  let picked = null; // the seed packet chosen
  let pots = [];

  // A seed packet for each rainbow color.
  const packets = COLORS.map((color) => {
    const packet = doc.createElement('button');
    packet.type = 'button';
    packet.className = 'seed-packet';
    packet.dataset.color = color.id;
    packet.setAttribute('aria-pressed', 'false');
    packet.setAttribute('aria-label', `${color.name} seeds`);
    packet.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true">${flowerPicture(color.id)}</svg>${color.name}`;
    packet.addEventListener('click', () => {
      picked = color.id;
      draw();
    });
    return packet;
  });
  packetRow.replaceChildren(...packets);

  function draw(result, color, pot) {
    // Each pot shows its flower; only a new one is redrawn, so only it grows.
    pots.forEach((button, i) => {
      const flower = game.pots[i] ?? '';
      if (button.dataset.color !== flower) {
        button.dataset.color = flower;
        button.innerHTML = `<svg viewBox="0 0 100 140" aria-hidden="true">${flower ? flowerPicture(flower) : ''}${POT}</svg>`;
        button.classList.toggle('is-growing', Boolean(flower));
      }
      button.setAttribute('aria-label', `Pot ${i + 1}, ${flower ? `${colorById(flower).name.toLowerCase()} flower` : 'empty'}`);
    });

    // A dot for each flower wanted, filled in as they're planted, so kids
    // who don't know the numbers yet can count the dots.
    goal.replaceChildren(...Object.entries(wanted(game)).map(([id, n]) => {
      const row = doc.createElement('span');
      row.className = 'goal-row';
      row.style.setProperty('--color', colorById(id).hex);
      row.setAttribute('aria-label', `${planted(game, id)} of ${n} ${colorById(id).name.toLowerCase()}`);
      row.replaceChildren(...Array.from({ length: n }, (_, i) => {
        const dot = doc.createElement('span');
        dot.className = i < planted(game, id) ? 'goal-dot is-filled' : 'goal-dot';
        return dot;
      }));
      return row;
    }));

    packets.forEach((p) => p.setAttribute('aria-pressed', String(p.dataset.color === picked)));
    helper.textContent = message(game, result, color);
    progress.textContent = `Round ${game.round + 1} of ${ROUNDS.length}`;

    const roundDone = isRoundDone(game);
    const finished = isDone(game);
    packetRow.hidden = roundDone;
    nextButton.hidden = !roundDone || isLastRound(game);
    garden.classList.toggle('is-done', finished);
    helperBox.hidden = finished;
    done.hidden = !finished;
    if (finished) done.querySelector('h2').focus();
    else if (result === 'round') nextButton.focus();
    if (result === 'unwanted') wiggle(pots[pot]);
  }

  function tapPot(i) {
    if (isRoundDone(game)) return;
    if (!picked) {
      draw('pick');
      packets.forEach(wiggle);
      return;
    }
    const turn = plant(game, i, picked);
    game = turn.game;
    draw(turn.result, picked, i);
  }

  pots = Array.from({ length: POTS }, (_, i) => {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'garden-pot';
    button.dataset.color = 'none';
    button.addEventListener('click', () => tapPot(i));
    return button;
  });
  garden.querySelector('.pots').replaceChildren(...pots);

  nextButton.addEventListener('click', () => {
    game = nextRound(game);
    picked = null;
    draw();
    packets[0].focus();
  });

  function restart() {
    game = newGame();
    picked = null;
    draw();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current game and the packet picked.
  return {
    get game() { return game; },
    get picked() { return picked; },
  };
}
