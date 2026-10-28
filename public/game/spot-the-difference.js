// Level 15: Spot the difference. Two copies of a picture, but some things
// in the second are a different color. Tap them in either picture. Three
// pictures, with 3, then 4, then 5 changes to find.
// Testable rules only; spot-the-difference-page.js draws and handles taps.
import { colorById } from './colors.js';

// Each picture's things and their colors in the first copy, then what's a
// different color in the second.
export const SCENES = [
  {
    id: 'park',
    things: { balloon: 'red', kite: 'purple', slide: 'orange', ball: 'blue', flower: 'yellow', bird: 'blue', bench: 'green' },
    changes: { balloon: 'green', slide: 'purple', ball: 'yellow' },
  },
  {
    id: 'garden',
    things: { roof: 'red', door: 'blue', butterfly: 'purple', can: 'green', tulip: 'yellow', daisy: 'orange', snail: 'orange', bird: 'red' },
    changes: { door: 'red', butterfly: 'orange', can: 'blue', tulip: 'purple' },
  },
  {
    id: 'beach',
    things: { umbrella: 'red', sail: 'yellow', fish: 'orange', bucket: 'blue', towel: 'purple', ball: 'green', crab: 'red', starfish: 'orange' },
    changes: { sail: 'red', fish: 'purple', bucket: 'green', towel: 'yellow', starfish: 'blue' },
  },
];

const startScene = (scene) => ({ scene, found: [] });

export const newGame = () => startScene(0);

export const currentScene = (game) => SCENES[game.scene];
export const changesIn = (game) => Object.keys(currentScene(game).changes);
export const isSceneDone = (game) => game.found.length === changesIn(game).length;
export const isLastScene = (game) => game.scene === SCENES.length - 1;
export const isDone = (game) => isLastScene(game) && isSceneDone(game);

// A thing's color in the first copy, or in the second with `second`.
export function colorOf(game, thing, second = false) {
  const { things, changes } = currentScene(game);
  return (second && changes[thing]) || things[thing];
}

// Tap `thing`, in either copy. Returns the new game and what happened:
//   'found' – it's a different color in the two copies, with more to find
//   'scene' – found, and that was the last one in this picture
//   'done'  – found the last one in the last picture
//   'same'  – it's the same color in both; nothing changes
//   'again' – already found; nothing changes
export function tap(game, thing) {
  if (!currentScene(game).things[thing]) throw new Error(`No ${thing} in this picture`);
  if (game.found.includes(thing)) return { game, result: 'again' };
  if (!currentScene(game).changes[thing]) return { game, result: 'same' };
  const next = { ...game, found: [...game.found, thing] };
  if (!isSceneDone(next)) return { game: next, result: 'found' };
  return { game: next, result: isLastScene(next) ? 'done' : 'scene' };
}

// On to the next picture.
export function nextScene(game) {
  if (!isSceneDone(game) || isLastScene(game)) throw new Error('No next picture yet');
  return startScene(game.scene + 1);
}

const nameOf = (color) => colorById(color).name.toLowerCase();
export const thingName = (thing) => ({ can: 'watering can' })[thing] ?? thing;
const left = (game) => changesIn(game).length - game.found.length;

// What the helper says. Short, so a new reader can manage it. `thing` is
// the thing just tapped.
export function message(game, result, thing) {
  if (isDone(game)) return 'You found every difference!';
  if (result === 'same') return `The ${thingName(thing)} is ${nameOf(colorOf(game, thing))} in both. Look again!`;
  if (result === 'again') return `You found that one already! ${left(game)} more to go.`;
  const changed = thing && `The ${thingName(thing)} changed from ${nameOf(colorOf(game, thing))} to ${nameOf(colorOf(game, thing, true))}!`;
  if (isSceneDone(game)) return `${changed} Tap Next.`;
  if (result === 'found') return `${changed} ${left(game)} more to go.`;
  return `Find ${changesIn(game).length} things that changed color!`;
}
