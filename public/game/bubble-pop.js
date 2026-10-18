// Level 11: rainbow bubbles float up; pop the ones of the color called.
// Three colors a game, five pops each. A wrong bubble just boings away.
// Testable rules only; bubble-pop-page.js handles the bubbles and taps.
import { COLOR_IDS, colorById } from './colors.js';
import { shuffle } from './shuffle.js';

export const ROUNDS = 3;
export const POPS = 5; // to pop of each color
export const TARGET_SHARE = 0.4; // about this many of the bubbles are the color called

// A new game: three different colors to pop, in a random order. Inject
// `random` for tests.
export function newGame(random = Math.random) {
  return { targets: shuffle(COLOR_IDS, random).slice(0, ROUNDS), round: 0, popped: 0 };
}

export const target = (game) => (game.round < ROUNDS ? game.targets[game.round] : null);
export const isDone = (game) => game.round >= ROUNDS;

// The color of a new bubble: often the color called, so there are always
// some to pop, otherwise any of the others.
export function bubbleColor(game, random = Math.random) {
  const called = target(game);
  if (called && random() < TARGET_SHARE) return called;
  const others = COLOR_IDS.filter((c) => c !== called);
  return others[Math.floor(random() * others.length)];
}

// Pop a bubble of `color`. Returns the new game and what happened:
//   'right' – the color called; one more popped
//   'round' – right, and that was the fifth; the next color is called
//   'done'  – right, and that finished the last color
//   'wrong' – another color; it boings away and nothing changes
export function pop(game, color) {
  colorById(color); // throws for a color that isn't in the rainbow
  if (isDone(game)) return { game, result: 'wrong' };
  if (color !== target(game)) return { game, result: 'wrong' };
  if (game.popped + 1 < POPS) return { game: { ...game, popped: game.popped + 1 }, result: 'right' };
  const next = { ...game, round: game.round + 1, popped: 0 };
  return { game: next, result: isDone(next) ? 'done' : 'round' };
}

const nameOf = (color) => colorById(color).name.toLowerCase();

// What the helper says. Short, so a new reader can manage it. `color` is
// the bubble just tapped.
export function message(game, result, color) {
  if (isDone(game)) return 'You popped them all!';
  const called = nameOf(target(game));
  if (result === 'round') return `Great popping! Now pop the ${called} bubbles!`;
  if (result === 'wrong') return `That one is ${nameOf(color)}. Pop the ${called} ones!`;
  if (result === 'right') return POPS - game.popped === 1 ? 'Pop! Just one more!' : `Pop! ${POPS - game.popped} more ${called} bubbles!`;
  return `Pop the ${called} bubbles!`;
}
