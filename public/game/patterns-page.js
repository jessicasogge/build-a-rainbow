// Draws Level 9 (What comes next?) on patterns.html and handles the taps.
// The rules live in patterns.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { colorById } from './colors.js';
import { wiggle } from './page-helpers.js';
import {
  PATTERNS, currentPattern, isDone, isLastRound, message, nameOf, newGame, nextRound, pick,
} from './patterns.js';

// A five-pointed star centered in the 100 × 100 box.
const starPoints = Array.from({ length: 10 }, (_, i) => {
  const r = i % 2 ? 19 : 44;
  const a = (Math.PI / 5) * i - Math.PI / 2;
  return `${(50 + r * Math.cos(a)).toFixed(1)},${(54 + r * Math.sin(a)).toFixed(1)}`;
}).join(' ');

// Each shape, drawn in a 100 × 100 box in the color `fill`.
const SHAPE_DRAWINGS = {
  circle: (fill) => `<circle cx="50" cy="50" r="38" fill="${fill}" />`,
  square: (fill) => `<rect x="14" y="14" width="72" height="72" rx="14" fill="${fill}" />`,
  triangle: (fill) => `<path d="M50 12L90 84Q92 88 87 88H13Q8 88 10 84Z" fill="${fill}" />`,
  star: (fill) => `<polygon points="${starPoints}" fill="${fill}" stroke="${fill}" stroke-width="6" stroke-linejoin="round" />`,
  heart: (fill) => `<path d="M50 88C20 66 8 48 12 32C16 16 36 12 50 28C64 12 84 16 88 32C92 48 80 66 50 88Z" fill="${fill}" />`,
};

export function drawThing(t) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${SHAPE_DRAWINGS[t.shape](colorById(t.color).hex)}</svg>`;
}

export function start(doc = document, { random = Math.random } = {}) {
  const row = doc.querySelector('.pattern-row');
  const tray = doc.querySelector('.pattern-choices');
  const progress = doc.querySelector('.progress-pill');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const nextButton = doc.querySelector('#next');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let game;
  let choices = [];

  function draw(result) {
    const pattern = currentPattern(game);

    // The pattern, then the gap: a dashed "?" box, or the answer once found.
    const gap = doc.createElement('span');
    gap.className = 'pattern-gap';
    gap.classList.toggle('is-filled', game.solved);
    gap.innerHTML = game.solved ? drawThing(pattern.answer) : '<span aria-hidden="true">?</span>';
    row.replaceChildren(...pattern.shown.map((t) => {
      const tile = doc.createElement('span');
      tile.className = 'pattern-tile';
      tile.innerHTML = drawThing(t);
      return tile;
    }), gap);
    const names = pattern.shown.map(nameOf).join(', ');
    row.setAttribute('aria-label', `${names}, and then ${game.solved ? nameOf(pattern.answer) : 'what?'}`);

    choices.forEach((choice) => { choice.disabled = game.solved; });
    helper.textContent = message(game, result);
    progress.textContent = `Pattern ${game.round + 1} of ${PATTERNS.length}`;

    const finished = isDone(game);
    tray.hidden = game.solved;
    nextButton.hidden = !game.solved || isLastRound(game);
    helperBox.hidden = finished;
    done.hidden = !finished;
    if (finished) done.querySelector('h2').focus();
    else if (result === 'right') nextButton.focus();
  }

  // Sets up the choices for a new pattern.
  function setUpRound() {
    choices = game.choices.map((t, i) => {
      const choice = doc.createElement('button');
      choice.type = 'button';
      choice.className = 'pattern-choice';
      choice.dataset.thing = `${t.color} ${t.shape}`;
      choice.setAttribute('aria-label', nameOf(t));
      choice.innerHTML = drawThing(t);
      choice.addEventListener('click', () => {
        const turn = pick(game, i);
        game = turn.game;
        if (turn.result === 'wrong') wiggle(choice);
        draw(turn.result);
      });
      return choice;
    });
    tray.replaceChildren(...choices);
    draw();
  }

  nextButton.addEventListener('click', () => {
    game = nextRound(game, random);
    setUpRound();
    choices[0]?.focus();
  });

  function restart() {
    game = newGame(random);
    setUpRound();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current game.
  return { get game() { return game; } };
}
