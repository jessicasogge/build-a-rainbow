// Draws Level 7 (Word scramble) on word-scramble.html and handles the taps.
// The rules live in word-scramble.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { wiggle } from './page-helpers.js';
import {
  WORDS, boxColor, currentWord, isDone, isLastWord, isWordDone, message, newPuzzle, nextWord, pick,
} from './word-scramble.js';

export function start(doc = document, { random = Math.random } = {}) {
  const clues = [...doc.querySelectorAll('[data-clue]')];
  const boxRow = doc.querySelector('.letter-boxes');
  const tray = doc.querySelector('.letter-tray');
  const progress = doc.querySelector('.progress-pill');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const nextButton = doc.querySelector('#next');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let puzzle;
  let boxes = [];
  let tiles = [];

  function draw(result, picked) {
    const word = currentWord(puzzle);
    boxes.forEach((box, i) => {
      const filled = i < puzzle.placed;
      box.textContent = filled ? word[i] : '';
      box.classList.toggle('is-filled', filled);
      box.classList.toggle('is-next', i === puzzle.placed);
    });
    tiles.forEach((tile, i) => { tile.disabled = puzzle.used.includes(i) || isWordDone(puzzle); });
    helper.textContent = message(puzzle, result, picked);
    progress.textContent = `Word ${puzzle.wordIndex + 1} of ${WORDS.length}`;

    const wordDone = isWordDone(puzzle);
    const finished = isDone(puzzle);
    tray.hidden = wordDone;
    nextButton.hidden = !wordDone || isLastWord(puzzle);
    helperBox.hidden = finished;
    done.hidden = !finished;
    boxRow.setAttribute('aria-label', wordDone ? word : `${puzzle.placed} of ${word.length} letters in place`);
    if (finished) done.querySelector('h2').focus();
    else if (result === 'word') nextButton.focus();
  }

  // Sets up a new word: its picture, an empty box per letter, and its tiles.
  function setUpWord() {
    const word = currentWord(puzzle);
    for (const clue of clues) clue.toggleAttribute('hidden', clue.dataset.clue !== WORDS[puzzle.wordIndex].clue);

    boxRow.style.setProperty('--letters', word.length);
    boxes = [...word].map((_, i) => {
      const box = doc.createElement('span');
      box.className = 'letter-box';
      box.style.setProperty('--box-color', boxColor(i));
      return box;
    });
    boxRow.replaceChildren(...boxes);

    tiles = puzzle.tiles.map((letter, i) => {
      const tile = doc.createElement('button');
      tile.type = 'button';
      tile.className = 'letter-tile';
      tile.dataset.letter = letter;
      tile.textContent = letter;
      tile.addEventListener('click', () => {
        const turn = pick(puzzle, i);
        puzzle = turn.puzzle;
        if (turn.result === 'wrong') wiggle(tile);
        draw(turn.result, letter);
      });
      return tile;
    });
    tray.replaceChildren(...tiles);
    draw();
  }

  nextButton.addEventListener('click', () => {
    puzzle = nextWord(puzzle, random);
    setUpWord();
    tiles[0]?.focus();
  });

  function restart() {
    puzzle = newPuzzle(random);
    setUpWord();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current puzzle.
  return { get puzzle() { return puzzle; } };
}
