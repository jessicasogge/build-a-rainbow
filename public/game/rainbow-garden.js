// Level 4: Rainbow garden. Plant the flowers asked for: "Plant 3 yellow
// flowers!" Six rounds, one color each, in rainbow order: 1 red, 2 orange,
// and so on up to 6 purple, which fills every pot.
// Testable rules only; rainbow-garden-page.js handles the garden and taps.
import { COLOR_IDS, colorById } from './colors.js';

// What each round asks for: round 1 wants 1 red flower, round 2 wants
// 2 orange, ... Written { red: 1 }.
export const ROUNDS = COLOR_IDS.map((color, i) => ({ [color]: i + 1 }));

export const POTS = 6;

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];
const capital = (text) => text[0].toUpperCase() + text.slice(1);

export const newGame = () => ({ round: 0, pots: Array(POTS).fill(null) });

export const wanted = (game) => ROUNDS[game.round];

// How many flowers of `color` are planted.
export const planted = (game, color) => game.pots.filter((c) => c === color).length;

export const isRoundDone = (game) => Object.entries(wanted(game)).every(([color, n]) => planted(game, color) === n);
export const isLastRound = (game) => game.round === ROUNDS.length - 1;
export const isDone = (game) => isLastRound(game) && isRoundDone(game);

// Plant a `color` seed in pot `pot`. Returns the new game and what happened:
//   'right'   – planted, and more are wanted
//   'round'   – planted, and the round is done, with another to come
//   'done'    – planted, and that was the last round
//   'unwanted' – that color isn't asked for this round; nothing is planted
//   'full'    – that pot already has a flower; nothing changes
export function plant(game, pot, color) {
  colorById(color); // throws for a color that isn't in the rainbow
  if (pot < 0 || pot >= POTS) throw new Error(`No pot ${pot}`);
  if (isRoundDone(game) || game.pots[pot]) return { game, result: 'full' };
  if (!wanted(game)[color]) return { game, result: 'unwanted' };
  const pots = game.pots.map((c, i) => (i === pot ? color : c));
  const next = { ...game, pots };
  if (isRoundDone(next)) return { game: next, result: isLastRound(next) ? 'done' : 'round' };
  return { game: next, result: 'right' };
}

// On to the next round, with empty pots.
export function nextRound(game) {
  if (!isRoundDone(game) || isLastRound(game)) throw new Error('No next round yet');
  return { round: game.round + 1, pots: Array(POTS).fill(null) };
}

const nameOf = (color) => colorById(color).name.toLowerCase();
const flowers = (n) => (n === 1 ? 'flower' : 'flowers');

// "Plant 3 yellow flowers!"
export function ask(game) {
  const [[color, n]] = Object.entries(wanted(game));
  return `Plant ${n} ${nameOf(color)} ${flowers(n)}!`;
}

// What the helper says. Short, so a new reader can manage it. `color` is
// the seed just planted, or tried.
export function message(game, result, color) {
  if (isDone(game)) return 'Your rainbow garden is all grown!';
  if (result === 'round') return 'You did it! Tap Next.';
  if (result === 'unwanted') return `We don't need ${nameOf(color)} this time. Look at the dots!`;
  if (result === 'right') return `${capital(WORDS[planted(game, color)])}!`;
  if (result === 'pick') return 'Tap a seed packet first!';
  return ask(game);
}
