// Draws Level 7 (I spy) on i-spy.html and handles the taps on the meadow.
// The rules live in i-spy.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { COLORS } from './colors.js';
import { onTap, wiggle } from './page-helpers.js';
import { currentThing, isDone, message, newGame, tap } from './i-spy.js';

// A tap this close to a thing's middle (in screen pixels) counts for it,
// even outside its tap area, so every thing is at least 52px wide to a
// finger on a phone. If two are in reach, the closest wins.
export const REACH = 26;

const escape = (text) => text.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

// The helper's words, with the color in a clue shown as a chip of that
// color, for kids who go by the color before they can read the word.
function withColorChip(text) {
  return escape(text).replace(/something (\w+)/, (whole, word) => {
    const color = COLORS.find((c) => c.name.toLowerCase() === word);
    if (!color) return whole;
    return `something <span class="spy-color" style="--chip: ${color.hex}" data-color="${color.id}">${word}</span>`;
  });
}

export function start(doc = document, { random = Math.random } = {}) {
  const scene = doc.querySelector('.spy-scene');
  const things = [...scene.querySelectorAll('.spy-thing')];
  const progress = doc.querySelector('.progress-pill');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let game;

  function draw(result, id) {
    const found = game.clues.slice(0, game.found);
    things.forEach((t) => t.classList.toggle('is-found', found.includes(t.dataset.thing)));
    helper.innerHTML = withColorChip(message(game, result, id));
    const finished = isDone(game);
    progress.textContent = `Clue ${Math.min(game.found + 1, game.clues.length)} of ${game.clues.length}`;
    scene.classList.toggle('is-done', finished);
    helperBox.hidden = finished;
    done.hidden = !finished;
    if (finished) done.querySelector('h2').focus();
  }

  function choose(thing) {
    if (isDone(game)) return;
    const id = thing.dataset.thing;
    const turn = tap(game, id);
    game = turn.game;
    if (turn.result === 'wrong') wiggle(thing);
    draw(turn.result, id);
  }

  things.forEach((thing) => onTap(thing, () => choose(thing)));

  // A tap on the meadow near a thing, but not on it, counts for the closest.
  scene.addEventListener('click', (event) => {
    if (event.target.closest('.spy-thing')) return; // that thing has it
    let nearest = null;
    let best = Infinity;
    for (const thing of things) {
      const r = thing.querySelector('.spy-hit').getBoundingClientRect();
      const d = Math.hypot(event.clientX - (r.left + r.width / 2), event.clientY - (r.top + r.height / 2));
      if (d <= Math.max(r.width / 2, REACH) && d < best) {
        best = d;
        nearest = thing;
      }
    }
    if (nearest) choose(nearest);
  });

  function restart() {
    game = newGame(random);
    draw();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current game, and the thing the clue is about.
  return {
    get game() { return game; },
    get looking() { return currentThing(game); },
  };
}
