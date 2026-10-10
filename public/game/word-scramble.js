// Level 7: tap scrambled letters to spell RAINBOW, then SUNSHINE.
// Testable rules only; word-scramble-page.js handles drawing and taps.
import { COLORS, PINK } from './colors.js';
import { shuffleUntil } from './shuffle.js';

// The words, in order. `clue` is the picture shown above the boxes.
export const WORDS = [
  { word: 'RAINBOW', clue: 'rainbow' },
  { word: 'SUNSHINE', clue: 'sun' },
];

// Filled boxes cycle through six rainbow colors, then pink.
export const BOX_COLORS = [...COLORS.map((c) => c.hex), PINK.hex];
export const boxColor = (i) => BOX_COLORS[i % BOX_COLORS.length];

// Shuffle letters, never into word order; track tiles by tray index for repeats.
// Inject `random` for tests.
export function scramble(word, random = Math.random) {
  return shuffleUntil([...word], random, (letters) => letters.join('') === word);
}

function startWord(wordIndex, random) {
  return { wordIndex, tiles: scramble(WORDS[wordIndex].word, random), used: [], placed: 0 };
}

export function newPuzzle(random = Math.random) {
  return startWord(0, random);
}

export const currentWord = (puzzle) => WORDS[puzzle.wordIndex].word;
export const isWordDone = (puzzle) => puzzle.placed >= currentWord(puzzle).length;
export const isLastWord = (puzzle) => puzzle.wordIndex === WORDS.length - 1;
export const isDone = (puzzle) => isLastWord(puzzle) && isWordDone(puzzle);

// The letter that goes in the next box (null when the word is spelled).
export function nextLetter(puzzle) {
  return currentWord(puzzle)[puzzle.placed] ?? null;
}

// On to the next word, freshly scrambled.
export function nextWord(puzzle, random = Math.random) {
  if (!isWordDone(puzzle) || isLastWord(puzzle)) throw new Error('No next word yet');
  return startWord(puzzle.wordIndex + 1, random);
}

// Tap the tile at `tileIndex` in the tray. Returns the new puzzle and what
// happened:
//   'right' – it's the next letter; it goes in the next box
//   'word'  – right, and it finished a word, with another word to come
//   'done'  – right, and it finished the last word
//   'wrong' – not that letter yet; nothing changes
//   'used'  – that tile is already in a box; nothing changes
export function pick(puzzle, tileIndex) {
  const letter = puzzle.tiles[tileIndex];
  if (letter === undefined) throw new Error(`No tile ${tileIndex}`);
  if (puzzle.used.includes(tileIndex) || isWordDone(puzzle)) return { puzzle, result: 'used' };
  if (letter !== nextLetter(puzzle)) return { puzzle, result: 'wrong' };
  const next = { ...puzzle, used: [...puzzle.used, tileIndex], placed: puzzle.placed + 1 };
  if (!isWordDone(next)) return { puzzle: next, result: 'right' };
  return { puzzle: next, result: isLastWord(next) ? 'done' : 'word' };
}

// What the helper says. Short, so a new reader can manage it.
// `picked` is the letter that was just tapped, for a wrong pick.
export function message(puzzle, result, picked) {
  const word = currentWord(puzzle);
  if (isDone(puzzle)) return `You spelled ${WORDS.map((w) => w.word).join(' and ')}!`;
  if (isWordDone(puzzle)) return `You spelled ${word}! Tap Next for another word.`;
  if (result === 'wrong') return `Not ${picked} yet. Try another letter!`;
  if (result === 'right') return `${word[puzzle.placed - 1]}! What comes next?`;
  return `Put the letters in order to spell ${word}.`;
}
