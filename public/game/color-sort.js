// Level 9: drag everyday things into the basket of their color.
// One thing of each color per game, picked from two choices each.
// Testable rules only; color-sort-page.js handles drawing and dragging.
import { COLOR_IDS, colorById } from './colors.js';
import { shuffle } from './shuffle.js';

// Two things for each rainbow color. `plural` things take "are", not "is".
export const THINGS = [
  { id: 'strawberry', name: 'strawberry', color: 'red' },
  { id: 'apple', name: 'apple', color: 'red' },
  { id: 'carrot', name: 'carrot', color: 'orange' },
  { id: 'pumpkin', name: 'pumpkin', color: 'orange' },
  { id: 'banana', name: 'banana', color: 'yellow' },
  { id: 'lemon', name: 'lemon', color: 'yellow' },
  { id: 'frog', name: 'frog', color: 'green' },
  { id: 'leaf', name: 'leaf', color: 'green' },
  { id: 'blueberries', name: 'blueberries', color: 'blue', plural: true },
  { id: 'fish', name: 'fish', color: 'blue' },
  { id: 'grapes', name: 'grapes', color: 'purple', plural: true },
  { id: 'eggplant', name: 'eggplant', color: 'purple' },
];

export const thingById = (id) => THINGS.find((t) => t.id === id);

// A new game: one thing of each color, in a random order. Inject `random`
// for tests.
export function newGame(random = Math.random) {
  const picks = COLOR_IDS.map((color) => {
    const choices = THINGS.filter((t) => t.color === color);
    return choices[Math.floor(random() * choices.length)].id;
  });
  return { things: shuffle(picks, random), sorted: 0 };
}

export const isDone = (game) => game.sorted >= game.things.length;

// The thing waiting to be sorted (null when they're all in).
export function currentThing(game) {
  return isDone(game) ? null : thingById(game.things[game.sorted]);
}

// Drop the current thing in the basket of `color`. Returns the new game and
// what happened:
//   'right' – its basket; the next thing comes up
//   'done'  – right, and it was the last thing
//   'wrong' – not its basket; nothing changes
export function drop(game, color) {
  colorById(color); // throws for a color that isn't in the rainbow
  const thing = currentThing(game);
  if (!thing) throw new Error('Everything is sorted already');
  if (thing.color !== color) return { game, result: 'wrong' };
  const next = { ...game, sorted: game.sorted + 1 };
  return { game: next, result: isDone(next) ? 'done' : 'right' };
}

const the = (thing) => `the ${thing.name}`;
const capital = (text) => text[0].toUpperCase() + text.slice(1);
const is = (thing) => (thing.plural ? 'are' : 'is');
const isnt = (thing) => (thing.plural ? "aren't" : "isn't");

// What the helper says. Short, so a new reader can manage it. `color` is the
// basket just picked.
export function message(game, result, color) {
  if (isDone(game)) return 'You sorted them all!';
  const thing = currentThing(game);
  if (result === 'wrong') return `${capital(the(thing))} ${isnt(thing)} ${color}. Try another basket!`;
  if (result === 'right') {
    const last = thingById(game.things[game.sorted - 1]);
    return `Yes! ${capital(the(last))} ${is(last)} ${last.color}. Now ${the(thing)}!`;
  }
  return `Drag ${the(thing)} into the basket of its color.`;
}
