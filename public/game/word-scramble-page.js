// Draws Level 7 (Word scramble) on word-scramble.html and handles the taps.
// The rules live in word-scramble.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { wiggle } from './page-helpers.js';
import { BOX_COLORS, WORD, isDone, message, newPuzzle, pick } from './word-scramble.js';

export function start(doc = document, { random = Math.random } = {}) {
  const boxes = [...doc.querySelectorAll('.letter-box')];
  const tray = doc.querySelector('.letter-tray');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let puzzle;
  let tiles = [];

  function draw(result, picked) {
    boxes.forEach((box, i) => {
      const filled = i < puzzle.placed;
      box.textContent = filled ? WORD[i] : '';
      box.classList.toggle('is-filled', filled);
      box.classList.toggle('is-next', i === puzzle.placed);
      box.style.setProperty('--box-color', BOX_COLORS[i]);
    });
    for (const tile of tiles) tile.disabled = WORD.indexOf(tile.dataset.letter) < puzzle.placed;
    helper.textContent = message(puzzle, result, picked);

    const finished = isDone(puzzle);
    tray.hidden = finished;
    helperBox.hidden = finished;
    done.hidden = !finished;
    doc.querySelector('.letter-boxes').setAttribute('aria-label', finished ? 'RAINBOW' : `${puzzle.placed} of ${WORD.length} letters in place`);
    if (finished) done.querySelector('h2').focus();
  }

  function restart() {
    puzzle = newPuzzle(random);
    tray.replaceChildren();
    tiles = puzzle.tiles.map((letter) => {
      const tile = doc.createElement('button');
      tile.type = 'button';
      tile.className = 'letter-tile';
      tile.dataset.letter = letter;
      tile.textContent = letter;
      tile.addEventListener('click', () => {
        const turn = pick(puzzle, letter);
        puzzle = turn.puzzle;
        if (turn.result === 'wrong') wiggle(tile);
        draw(turn.result, letter);
      });
      tray.append(tile);
      return tile;
    });
    draw();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current puzzle.
  return { get puzzle() { return puzzle; } };
}
