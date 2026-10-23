// Level 4: Rainbow garden. Plant the flowers asked for: "Plant 3 red
// flowers!" Five rounds, from one color to three at once, counting to five.
// Testable rules only; rainbow-garden-page.js handles the garden and taps.
import { colorById } from './colors.js';

// What each round asks for: how many flowers of each color.
export const ROUNDS = [
  { yellow: 2 },
  { red: 3 },
  { blue: 4 },
  { purple: 1, green: 2 },
  { orange: 2, red: 1, blue: 2 },
];

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
//   'right'   – planted, and more of that color are wanted
//   'color'   – planted, and that's all of that color
//   'round'   – planted, and the round is done, with another to come
//   'done'    – planted, and that was the last round
//   'extra'   – that color already has all it needs; nothing is planted
//   'unwanted' – that color isn't asked for this round; nothing is planted
//   'full'    – that pot already has a flower; nothing changes
export function plant(game, pot, color) {
  colorById(color); // throws for a color that isn't in the rainbow
  if (pot < 0 || pot >= POTS) throw new Error(`No pot ${pot}`);
  if (isRoundDone(game) || game.pots[pot]) return { game, result: 'full' };
  const goal = wanted(game)[color];
  if (!goal) return { game, result: 'unwanted' };
  if (planted(game, color) >= goal) return { game, result: 'extra' };
  const pots = game.pots.map((c, i) => (i === pot ? color : c));
  const next = { ...game, pots };
  if (isRoundDone(next)) return { game: next, result: isLastRound(next) ? 'done' : 'round' };
  return { game: next, result: planted(next, color) === goal ? 'color' : 'right' };
}

// On to the next round, with empty pots.
export function nextRound(game) {
  if (!isRoundDone(game) || isLastRound(game)) throw new Error('No next round yet');
  return { round: game.round + 1, pots: Array(POTS).fill(null) };
}

const nameOf = (color) => colorById(color).name.toLowerCase();
const flowers = (n) => (n === 1 ? 'flower' : 'flowers');

// "Plant 1 purple and 2 green flowers!"
export function ask(game) {
  const parts = Object.entries(wanted(game)).map(([color, n]) => `${n} ${nameOf(color)}`);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0];
  const total = Object.values(wanted(game)).at(-1);
  return `Plant ${list} ${flowers(total)}!`;
}

// What the helper says. Short, so a new reader can manage it. `color` is
// the seed just planted, or tried.
export function message(game, result, color) {
  if (isDone(game)) return 'Your rainbow garden is all grown!';
  if (result === 'round') return 'You did it! Tap Next.';
  if (result === 'unwanted') return `We don't need ${nameOf(color)} this time. Look at the dots!`;
  if (result === 'extra') {
    const goal = wanted(game)[color];
    return `Oops, that's ${goal + 1}! We need ${goal} ${nameOf(color)}.`;
  }
  if (result === 'color') return `${capital(WORDS[planted(game, color)])} ${nameOf(color)} ${flowers(planted(game, color))}!`;
  if (result === 'right') return `${capital(WORDS[planted(game, color)])}!`;
  if (result === 'pick') return 'Tap a seed packet first!';
  return ask(game);
}
