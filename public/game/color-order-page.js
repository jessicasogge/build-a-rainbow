// Draws Level 9 (Color order) on color-order.html and handles the taps.
// The stripe that goes next is outlined. The rules live in color-order.js.
import './components.js';
import { COLORS } from './colors.js';
import { isDone, message, newGame, nextColor, pick, shuffledColors } from './color-order.js';
import { wiggle } from './page-helpers.js';

export function start(doc = document, { random = Math.random } = {}) {
  const stripes = [...doc.querySelectorAll('.build-stripe')];
  if (stripes.length !== COLORS.length) {
    throw new Error(`The rainbow has ${stripes.length} stripes but there are ${COLORS.length} colors`);
  }
  const tray = doc.querySelector('.tray');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let game;
  let swatches = [];

  function draw(result) {
    stripes.forEach((stripe, i) => {
      stripe.classList.toggle('is-filled', i < game.filled);
      stripe.classList.toggle('is-next', i === game.filled);
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

  function restart() {
    game = newGame(1); // red starts in place
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
        const turn = pick(game, color.id);
        game = turn.game;
        if (turn.result === 'wrong') wiggle(swatch);
        draw(turn.result);
      });
      tray.append(swatch);
      return swatch;
    });
    draw();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current game and what goes next.
  return {
    get game() { return game; },
    next: () => nextColor(game),
  };
}
