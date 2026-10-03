// Level 2, Mix a color: two paint colors are shown, and you pick the color
// they make. There are three questions, one for each pair of primary colors:
//   red + yellow = orange, yellow + blue = green, red + blue = purple.
//
// This file is only the rules. It doesn't touch the page, so the tests can
// play it directly. mix-a-color-page.js draws it and handles the taps.
import { COLORS } from './color-order.js';

export const MIXES = [
  { a: 'red', b: 'yellow', makes: 'orange' },
  { a: 'yellow', b: 'blue', makes: 'green' },
  { a: 'red', b: 'blue', makes: 'purple' },
];

// The answer choices: every color a mix can make.
export const CHOICES = MIXES.map((mix) => mix.makes);

export function color(id) {
  const found = COLORS.find((c) => c.id === id);
  if (!found) throw new Error(`No color called ${id}`);
  return found;
}

function shuffle(list, random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// A new game: the three questions in a random order, each with its answer
// choices in a random order. `random` is there so tests can pass their own.
export function newGame(random = Math.random) {
  return {
    questions: shuffle(MIXES, random).map((mix) => ({ ...mix, choices: shuffle(CHOICES, random) })),
    index: 0,
    solved: false,
  };
}

export function question(game) {
  return game.questions[game.index];
}

export function isLast(game) {
  return game.index === game.questions.length - 1;
}

export function isDone(game) {
  return isLast(game) && game.solved;
}

// Tap an answer. Returns the new game and what happened:
//   'right' – that's the color they make; the mystery color is shown
//   'done'  – right, and it was the last question
//   'wrong' – not that one; nothing changes
//   'used'  – this question is already answered; nothing changes
export function pick(game, id) {
  color(id); // unknown colors are a mistake in the page, not a wrong answer
  if (game.solved) return { game, result: 'used' };
  if (id !== question(game).makes) return { game, result: 'wrong' };
  const next = { ...game, solved: true };
  return { game: next, result: isDone(next) ? 'done' : 'right' };
}

// Move on to the next question, once this one is answered.
export function nextQuestion(game) {
  if (!game.solved || isLast(game)) return game;
  return { ...game, index: game.index + 1, solved: false };
}

// What the helper says. Short, so a new reader can manage it.
export function message(game, result) {
  const q = question(game);
  if (result === 'wrong') return 'Not quite. Try another color!';
  if (game.solved) return `${color(q.a).name} and ${color(q.b).name.toLowerCase()} make ${color(q.makes).name.toLowerCase()}!`;
  return 'What color do they make?';
}
