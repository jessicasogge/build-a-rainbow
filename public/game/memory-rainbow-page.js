// Draws Level 3 (Memory rainbow) on memory-rainbow.html and handles the taps.
// The rules live in memory-rainbow.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { colorById } from './colors.js';
import { wiggle } from './page-helpers.js';
import { PAIRS, flip, hide, isDone, message, newGame, pairsFound } from './memory-rainbow.js';

// How long two cards that don't match stay face up, in milliseconds.
export const HIDE_AFTER = 1200;

export function start(doc = document, { random = Math.random } = {}) {
  const grid = doc.querySelector('.memory-grid');
  const rainbow = doc.querySelector('rainbow-stripes');
  const progress = doc.querySelector('.progress-pill');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let game;
  let cards = [];
  let hideTimer;

  function draw(result, index) {
    cards.forEach((card, i) => {
      const matched = game.matched.includes(i);
      const up = matched || game.up.includes(i);
      card.classList.toggle('is-up', up);
      card.classList.toggle('is-matched', matched);
      card.disabled = matched;
      card.setAttribute('aria-label', `Card ${i + 1}, ${up ? colorById(game.cards[i]).name.toLowerCase() : 'face down'}`);
    });
    helper.textContent = message(game, result, index);
    progress.textContent = `${pairsFound(game)} of ${PAIRS} pairs`;

    // Once every pair is found, a rainbow takes the cards' place, so the
    // celebration's buttons fit on a phone screen.
    const finished = isDone(game);
    grid.hidden = finished;
    rainbow.hidden = !finished;
    helperBox.hidden = finished;
    done.hidden = !finished;
    if (finished) done.querySelector('h2').focus();
  }

  function turnOver(i) {
    clearTimeout(hideTimer);
    const turn = flip(game, i);
    game = turn.game;
    if (turn.result === 'miss') {
      wiggle(cards[i]);
      hideTimer = setTimeout(() => {
        game = hide(game);
        draw();
      }, HIDE_AFTER);
    }
    draw(turn.result, i);
  }

  function restart() {
    clearTimeout(hideTimer);
    game = newGame(random);
    cards = game.cards.map((id, i) => {
      const color = colorById(id);
      const card = doc.createElement('button');
      card.type = 'button';
      card.className = 'memory-card';
      card.dataset.color = id;
      card.style.setProperty('--card-color', color.hex);
      card.innerHTML = `
        <span class="card-inner">
          <span class="card-back" aria-hidden="true"></span>
          <span class="card-face" aria-hidden="true">
            <span class="card-dot"></span>
            ${color.name}
          </span>
        </span>`;
      card.addEventListener('click', () => turnOver(i));
      return card;
    });
    grid.replaceChildren(...cards);
    draw();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current game.
  return { get game() { return game; } };
}
