// Level 5: Ice cream shop. Six animal customers each show a picture of the
// cone they want; scoop it from the bottom up, add sprinkles and hand it over.
// From 1 scoop for the bunny up to a 6-scoop rainbow for the unicorn.
// Testable rules only; ice-cream-page.js handles drawing and taps.
import { colorById } from './colors.js';

// The customers, in the order they come in. Scoops go from the bottom up.
export const CUSTOMERS = [
  { id: 'bunny', name: 'Bunny', scoops: ['red'] },
  { id: 'puppy', name: 'Puppy', scoops: ['yellow', 'blue'] },
  { id: 'cat', name: 'Cat', scoops: ['green', 'orange', 'green'] },
  { id: 'bear', name: 'Bear', scoops: ['orange', 'yellow', 'orange', 'yellow'] },
  { id: 'penguin', name: 'Penguin', scoops: ['blue', 'purple', 'blue', 'purple', 'red'] },
  { id: 'unicorn', name: 'Unicorn', scoops: ['purple', 'blue', 'green', 'yellow', 'orange', 'red'] },
];

const startCustomer = (customer) => ({ customer, cone: [], served: false });

export const newGame = () => startCustomer(0);

export const currentCustomer = (game) => CUSTOMERS[game.customer];
export const isConeDone = (game) => game.cone.length === currentCustomer(game).scoops.length;
export const isLastCustomer = (game) => game.customer === CUSTOMERS.length - 1;
export const isDone = (game) => game.served && isLastCustomer(game);

// The color of the scoop that goes on next, or undefined once the cone is done.
export const nextScoop = (game) => currentCustomer(game).scoops[game.cone.length];

// Scoop `color` onto the cone. Returns the new game and what happened:
//   'right' – it's the next scoop in the picture, and more are wanted
//   'cone'  – right, and now the cone matches the picture
//   'wrong' – not the next scoop; it slides off and nothing changes
//   'full'  – the cone is already done; nothing changes
export function scoop(game, color) {
  colorById(color); // throws for a color that isn't in the rainbow
  if (isConeDone(game)) return { game, result: 'full' };
  if (color !== nextScoop(game)) return { game, result: 'wrong' };
  const next = { ...game, cone: [...game.cone, color] };
  return { game: next, result: isConeDone(next) ? 'cone' : 'right' };
}

// Sprinkles on top, and the cone goes to the customer. Returns 'served', or
// 'done' for the last customer.
export function serve(game) {
  if (!isConeDone(game) || game.served) throw new Error('No cone to serve');
  const next = { ...game, served: true };
  return { game: next, result: isLastCustomer(next) ? 'done' : 'served' };
}

// On to the next customer, with an empty cone.
export function nextCustomer(game) {
  if (!game.served || isLastCustomer(game)) throw new Error('No next customer yet');
  return startCustomer(game.customer + 1);
}

const nameOf = (color) => colorById(color).name.toLowerCase();

// "Puppy wants yellow, then blue!"
export function ask(game) {
  const { name, scoops } = currentCustomer(game);
  if (scoops.length === 1) return `${name} wants 1 ${nameOf(scoops[0])} scoop!`;
  if (scoops.length <= 3) return `${name} wants ${scoops.map(nameOf).join(', then ')}!`;
  return `${name} wants ${scoops.length} scoops! Start at the bottom.`;
}

// What the helper says. Short, so a new reader can manage it. `color` is
// the scoop just tried.
export function message(game, result, color) {
  if (isDone(game)) return 'Every customer is happy!';
  if (game.served) return `${currentCustomer(game).name} says thank you! Tap Next.`;
  if (result === 'cone') return 'Just like the picture! Now add sprinkles!';
  if (result === 'wrong') return `Oops, not ${nameOf(color)}! Look at the picture.`;
  if (result === 'right') return `Yum, ${nameOf(color)}! What's next?`;
  return ask(game);
}
