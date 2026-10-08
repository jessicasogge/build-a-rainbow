// Rainbow levels: color order outlines the next stripe;
// memory shows the rainbow until Ready, then clears it with no hints.
// Both use color-order.js.
import './components.js';
import { COLORS } from './colors.js';
import { isDone, message, newGame, nextColor, pick, shuffledColors } from './color-order.js';
import { wiggle } from './page-helpers.js';

export const STUDY_MESSAGE = 'Look at the rainbow! Tap Ready when you remember it.';

export function start(doc = document, { random = Math.random, memory = false } = {}) {
  const stripes = [...doc.querySelectorAll('.build-stripe')];
  if (stripes.length !== COLORS.length) {
    throw new Error(`The rainbow has ${stripes.length} stripes but there are ${COLORS.length} colors`);
  }
  const tray = doc.querySelector('.tray');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');
  const readyButton = doc.querySelector('#ready'); // Memory rainbow only

  let game;
  let swatches = [];
  let studying = false;

  // Memory rainbow's first step: the finished rainbow, to look at.
  function drawStudy(focus) {
    stripes.forEach((stripe, i) => {
      stripe.classList.add('is-filled');
      stripe.classList.remove('is-next');
      stripe.setAttribute('fill', COLORS[i].hex);
    });
    helper.textContent = STUDY_MESSAGE;
    helperBox.hidden = false;
    tray.hidden = true;
    done.hidden = true;
    readyButton.hidden = false;
    if (focus) readyButton.focus(); // after a restart, not on first load
  }

  function draw(result) {
    if (readyButton) readyButton.hidden = true;
    stripes.forEach((stripe, i) => {
      stripe.classList.toggle('is-filled', i < game.filled);
      stripe.classList.toggle('is-next', !memory && i === game.filled);
      stripe.setAttribute('fill', i < game.filled ? COLORS[i].hex : '#ffffff');
    });
    for (const swatch of swatches) {
      const used = COLORS.findIndex((c) => c.id === swatch.dataset.color) < game.filled;
      swatch.disabled = used;
    }
    helper.textContent = message(game, result);
    const finished = isDone(game);
    tray.hidden = finished;
    helperBox.hidden = finished;
    done.hidden = !finished;
    if (finished) done.querySelector('h2').focus();
  }

  function restart(event) {
    game = newGame(memory ? 0 : 1); // Color order starts with red in place
    tray.replaceChildren();
    swatches = shuffledColors(random).map((color) => {
      const swatch = doc.createElement('button');
      swatch.type = 'button';
      swatch.className = 'swatch';
      swatch.dataset.color = color.id;
      const dot = doc.createElement('span');
      dot.className = 'swatch-dot';
      dot.style.background = color.hex;
      swatch.append(dot, color.name);
      swatch.addEventListener('click', () => {
        if (studying) return;
        const turn = pick(game, color.id);
        game = turn.game;
        if (turn.result === 'wrong') wiggle(swatch);
        draw(turn.result);
      });
      tray.append(swatch);
      return swatch;
    });
    studying = memory;
    if (studying) drawStudy(Boolean(event));
    else draw();
  }

  if (readyButton) {
    readyButton.addEventListener('click', () => {
      studying = false;
      draw();
    });
  }
  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current game, what goes next, and whether it's the
  // look-at-the-rainbow step.
  return {
    get game() { return game; },
    get studying() { return studying; },
    next: () => nextColor(game),
  };
}
