// Level 10: match six rainbow pairs from face-down cards.
// Matches stay up; mismatches flip back.
// Testable rules only; memory-rainbow-page.js handles drawing and taps.
import { COLOR_IDS, colorById } from './colors.js';
import { shuffle } from './shuffle.js';

export const PAIRS = COLOR_IDS.length;

// Memory: shuffled, face-down cards. `up` holds unmatched face-up cards;
// `matched` holds found pairs. Inject `random` for tests.
export function newGame(random = Math.random) {
  return { cards: shuffle([...COLOR_IDS, ...COLOR_IDS], random), up: [], matched: [] };
}

export const pairsFound = (game) => game.matched.length / 2;
export const isDone = (game) => pairsFound(game) === PAIRS;

// Turn two cards that didn't match back over.
export function hide(game) {
  return { ...game, up: [] };
}

// Turn over the card at `index`. Returns the new game and what happened:
//   'first' – the first card of a try; it's face up now
//   'match' – the second card, the same color as the first; both stay up
//   'done'  – a match, and it was the last pair
//   'miss'  – the second card, a different color; both are up until hide()
//   'used'  – that card is already face up; nothing changes
// Tapping a third card while two that don't match are showing turns those two
// back over first, so a quick player doesn't have to wait.
export function flip(game, index) {
  if (game.cards[index] === undefined) throw new Error(`No card ${index}`);
  if (game.up.length === 2) game = hide(game);
  if (game.up.includes(index) || game.matched.includes(index)) return { game, result: 'used' };
  if (game.up.length === 0) return { game: { ...game, up: [index] }, result: 'first' };

  const [first] = game.up;
  if (game.cards[first] !== game.cards[index]) return { game: { ...game, up: [first, index] }, result: 'miss' };
  const next = { ...game, up: [], matched: [...game.matched, first, index] };
  return { game: next, result: isDone(next) ? 'done' : 'match' };
}

const nameOf = (game, index) => colorById(game.cards[index]).name;

// What the helper says. Short, so a new reader can manage it. `index` is the
// card just turned over.
export function message(game, result, index) {
  if (isDone(game)) return 'You found every pair!';
  if (result === 'first') return `${nameOf(game, index)}! Where is the other one?`;
  if (result === 'match') return `Two ${nameOf(game, index).toLowerCase()} cards. A match!`;
  if (result === 'miss') return `${nameOf(game, game.up[0])} and ${nameOf(game, index).toLowerCase()} don't match. Try again!`;
  return 'Turn over two cards to find a matching pair.';
}
