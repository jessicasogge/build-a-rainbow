// Level 10: what comes next? Finish six patterns of colors and shapes,
// from two colors taking turns up to the rainbow itself.
// Testable rules only; patterns-page.js handles drawing and taps.
import { colorById } from './colors.js';
import { shuffle } from './shuffle.js';

export const SHAPES = ['circle', 'square', 'triangle', 'star', 'heart'];

// A thing in a pattern: a color and a shape, written 'red circle'.
const thing = (text) => {
  const [color, shape] = text.split(' ');
  return { color, shape };
};
const things = (...texts) => texts.map(thing);

// The patterns, easiest first. `shown` is the pattern up to the gap,
// `answer` goes in the gap, and `others` are the wrong choices.
export const PATTERNS = [
  { // AB: two colors take turns.
    shown: things('red circle', 'blue circle', 'red circle', 'blue circle', 'red circle'),
    answer: thing('blue circle'),
    others: things('red circle', 'yellow circle'),
  },
  { // AAB
    shown: things('yellow circle', 'yellow circle', 'green circle', 'yellow circle', 'yellow circle'),
    answer: thing('green circle'),
    others: things('yellow circle', 'purple circle'),
  },
  { // ABC
    shown: things('red circle', 'yellow circle', 'blue circle', 'red circle', 'yellow circle'),
    answer: thing('blue circle'),
    others: things('red circle', 'yellow circle'),
  },
  { // AB with shapes, all one color.
    shown: things('purple star', 'purple heart', 'purple star', 'purple heart', 'purple star'),
    answer: thing('purple heart'),
    others: things('purple star', 'purple square'),
  },
  { // ABB with color and shape together.
    shown: things('orange triangle', 'green square', 'green square', 'orange triangle', 'green square'),
    answer: thing('green square'),
    others: things('orange triangle', 'orange square'),
  },
  { // The rainbow: what color comes after blue?
    shown: things('red heart', 'orange heart', 'yellow heart', 'green heart', 'blue heart'),
    answer: thing('purple heart'),
    others: things('red heart', 'green heart'),
  },
];

export const sameThing = (a, b) => a.color === b.color && a.shape === b.shape;
export const nameOf = (t) => `${colorById(t.color).name.toLowerCase()} ${t.shape}`;

function startRound(round, random) {
  const { answer, others } = PATTERNS[round];
  return { round, choices: shuffle([answer, ...others], random), solved: false };
}

// A new game, on the first pattern. Choices come in a random order; inject
// `random` for tests.
export function newGame(random = Math.random) {
  return startRound(0, random);
}

export const currentPattern = (game) => PATTERNS[game.round];
export const isLastRound = (game) => game.round === PATTERNS.length - 1;
export const isDone = (game) => game.solved && isLastRound(game);

// Pick choice `index`. Returns the new game and what happened:
//   'right' – it goes in the gap, with another pattern to come
//   'done'  – right, and it was the last pattern
//   'wrong' – not that one; nothing changes
//   'used'  – the pattern is already finished; nothing changes
export function pick(game, index) {
  const choice = game.choices[index];
  if (!choice) throw new Error(`No choice ${index}`);
  if (game.solved) return { game, result: 'used' };
  if (!sameThing(choice, currentPattern(game).answer)) return { game, result: 'wrong' };
  const next = { ...game, solved: true };
  return { game: next, result: isLastRound(next) ? 'done' : 'right' };
}

// On to the next pattern.
export function nextRound(game, random = Math.random) {
  if (!game.solved || isLastRound(game)) throw new Error('No next pattern yet');
  return startRound(game.round + 1, random);
}

// What the helper says. Short, so a new reader can manage it.
export function message(game, result) {
  if (isDone(game)) return 'You finished every pattern!';
  if (game.solved) return `Yes! The ${nameOf(currentPattern(game).answer)} comes next. Tap Next!`;
  if (result === 'wrong') return 'Not that one. Say the pattern out loud and try again!';
  return 'What comes next?';
}
