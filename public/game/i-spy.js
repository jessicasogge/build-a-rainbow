// Level 6: I spy. Twelve things hide in a rainbow meadow, two of each color.
// Each clue gives a color and a hint, so both are needed to find the right
// one: a red ladybug crawls, a red apple grows on a tree.
// Testable rules only; i-spy-page.js handles the meadow and taps.
import { COLOR_IDS, colorById } from './colors.js';
import { shuffle } from './shuffle.js';

export const THINGS = [
  { id: 'ladybug', name: 'ladybug', color: 'red', hint: 'crawls' },
  { id: 'apple', name: 'apple', color: 'red', hint: 'grows on a tree' },
  { id: 'fish', name: 'fish', color: 'orange', hint: 'swims' },
  { id: 'pumpkin', name: 'pumpkin', color: 'orange', hint: 'sits on the ground' },
  { id: 'duck', name: 'duck', color: 'yellow', hint: 'quacks' },
  { id: 'flower', name: 'flower', color: 'yellow', hint: 'grows in the grass' },
  { id: 'frog', name: 'frog', color: 'green', hint: 'hops' },
  { id: 'caterpillar', name: 'caterpillar', color: 'green', hint: 'wiggles' },
  { id: 'bird', name: 'bird', color: 'blue', hint: 'sings in a tree' },
  { id: 'boat', name: 'boat', color: 'blue', hint: 'floats' },
  { id: 'butterfly', name: 'butterfly', color: 'purple', hint: 'flutters' },
  { id: 'kite', name: 'kite', color: 'purple', hint: 'flies on a string' },
];

export const thingById = (id) => {
  const found = THINGS.find((t) => t.id === id);
  if (!found) throw new Error(`No thing called ${id}`);
  return found;
};

// A new game: one thing of each color to find, in a random order. Inject
// `random` for tests.
export function newGame(random = Math.random) {
  const picks = COLOR_IDS.map((color) => {
    const pair = THINGS.filter((t) => t.color === color);
    return pair[Math.floor(random() * pair.length)].id;
  });
  return { clues: shuffle(picks, random), found: 0 };
}

export const isDone = (game) => game.found >= game.clues.length;
export const currentThing = (game) => (isDone(game) ? null : thingById(game.clues[game.found]));

// Tap thing `id`. Returns the new game and what happened:
//   'right' – it's the thing the clue is about; on to the next clue
//   'done'  – right, and it was the last clue
//   'wrong' – something else; nothing changes
export function tap(game, id) {
  thingById(id); // throws for a thing that isn't in the meadow
  if (isDone(game) || id !== currentThing(game).id) return { game, result: 'wrong' };
  const next = { ...game, found: game.found + 1 };
  return { game: next, result: isDone(next) ? 'done' : 'right' };
}

const colorName = (t) => colorById(t.color).name.toLowerCase();

// The clue for a thing: "I spy something purple that flutters!"
export const clue = (t) => `I spy something ${colorName(t)} that ${t.hint}!`;

// What the helper says. Short, so a new reader can manage it. `id` is the
// thing just tapped.
export function message(game, result, id) {
  if (isDone(game)) return 'You found them all!';
  const next = clue(currentThing(game));
  if (result === 'wrong') {
    const tapped = thingById(id);
    return `That's the ${colorName(tapped)} ${tapped.name}! ${next}`;
  }
  if (result === 'right') {
    const last = thingById(game.clues[game.found - 1]);
    return `Yes, the ${last.name}! ${next}`;
  }
  return next;
}
