// Level 16: Rainbow puzzle. A picture is cut into square-ish pieces; put
// each one back where it goes. Three puzzles: 6 pieces, then 9, then 12.
// Testable rules only; rainbow-puzzle-page.js draws the pictures and
// handles the taps and drags.
import { shuffleUntil } from './shuffle.js';

// The puzzles, easiest first. Piece i goes in spot i, counting across the
// rows from the top left.
export const PUZZLES = [
  { id: 'rainbow', cols: 3, rows: 2 },
  { id: 'ice-cream', cols: 3, rows: 3 },
  { id: 'park', cols: 4, rows: 3 },
];

export const pieceCount = (puzzle) => puzzle.cols * puzzle.rows;

// A puzzle, with its pieces in the tray in a random order (never already in
// order, so the tray never gives the answer away). Inject `random` for tests.
function startPuzzle(puzzle, random) {
  const pieces = Array.from({ length: pieceCount(PUZZLES[puzzle]) }, (_, i) => i);
  return { puzzle, tray: shuffleUntil(pieces, random, (order) => order.every((p, i) => p === i)), placed: [] };
}

export const newGame = (random = Math.random) => startPuzzle(0, random);

export const currentPuzzle = (game) => PUZZLES[game.puzzle];
export const isPuzzleDone = (game) => game.placed.length === pieceCount(currentPuzzle(game));
export const isLastPuzzle = (game) => game.puzzle === PUZZLES.length - 1;
export const isDone = (game) => isLastPuzzle(game) && isPuzzleDone(game);

// Put `piece` in `spot`. Returns the new game and what happened:
//   'right'  – it goes there, and more pieces are left
//   'puzzle' – right, and the picture is finished, with another to come
//   'done'   – right, and that was the last puzzle
//   'wrong'  – it goes somewhere else; it stays in the tray
//   'taken'  – that piece is already in the picture; nothing changes
export function place(game, piece, spot) {
  const count = pieceCount(currentPuzzle(game));
  if (!(piece >= 0 && piece < count) || !(spot >= 0 && spot < count)) throw new Error(`No piece ${piece} or spot ${spot}`);
  if (game.placed.includes(piece)) return { game, result: 'taken' };
  if (piece !== spot) return { game, result: 'wrong' };
  const next = { ...game, tray: game.tray.filter((p) => p !== piece), placed: [...game.placed, piece] };
  if (!isPuzzleDone(next)) return { game: next, result: 'right' };
  return { game: next, result: isLastPuzzle(next) ? 'done' : 'puzzle' };
}

// On to the next puzzle.
export function nextPuzzle(game, random = Math.random) {
  if (!isPuzzleDone(game) || isLastPuzzle(game)) throw new Error('No next puzzle yet');
  return startPuzzle(game.puzzle + 1, random);
}

// What the helper says. Short, so a new reader can manage it.
export function message(game, result) {
  if (isDone(game)) return 'You finished every puzzle!';
  if (result === 'puzzle') return 'You finished the picture! Tap Next.';
  if (result === 'right') {
    const left = game.tray.length;
    return `It fits! ${left} more ${left === 1 ? 'piece' : 'pieces'}.`;
  }
  if (result === 'wrong') return 'That piece goes somewhere else. Look at the picture!';
  if (result === 'pick') return 'Tap a piece first, then tap where it goes!';
  return `Put the ${pieceCount(currentPuzzle(game))} pieces back in the picture!`;
}
