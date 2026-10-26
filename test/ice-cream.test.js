// The rules of Level 5, Ice cream shop.
import { describe, expect, it } from 'vitest';
import { COLOR_IDS } from '../public/game/colors.js';
import {
  CUSTOMERS, ask, currentCustomer, isConeDone, isDone, message, newGame, nextCustomer, nextScoop, scoop,
} from '../public/game/ice-cream.js';

// Scoops the whole cone the customer wants.
function scoopCone(game) {
  let turn = { game };
  for (const color of currentCustomer(game).scoops) turn = scoop(turn.game, color);
  return turn;
}
function playAll() {
  let turn = scoopCone(newGame());
  while (turn.result !== 'done') turn = scoopCone(nextCustomer(turn.game));
  return turn;
}
const PUPPY = { customer: 1, cone: [], served: false }; // yellow, then blue

describe('the customers', () => {
  it('want one more scoop each, from 1 up to 6', () => {
    expect(CUSTOMERS.map((c) => c.scoops.length)).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('want rainbow colors', () => {
    for (const c of CUSTOMERS) for (const color of c.scoops) expect(COLOR_IDS).toContain(color);
  });

  it('end with a unicorn who wants a rainbow, red on top', () => {
    const unicorn = CUSTOMERS.at(-1);
    expect(unicorn.id).toBe('unicorn');
    expect([...unicorn.scoops].reverse()).toEqual(COLOR_IDS);
  });
});

describe('scoop', () => {
  it('starts with the bunny and an empty cone', () => {
    expect(newGame()).toEqual({ customer: 0, cone: [], served: false });
    expect(currentCustomer(newGame()).id).toBe('bunny');
  });

  it('adds the next scoop in the picture, from the bottom up', () => {
    expect(nextScoop(PUPPY)).toBe('yellow');
    const { game, result } = scoop(PUPPY, 'yellow');
    expect(result).toBe('right');
    expect(game.cone).toEqual(['yellow']);
    expect(nextScoop(game)).toBe('blue');
  });

  it("won't add a scoop out of order", () => {
    expect(scoop(PUPPY, 'blue')).toEqual({ game: PUPPY, result: 'wrong' });
  });

  it('serves the cone as soon as it matches the picture', () => {
    const { game, result } = scoopCone(PUPPY);
    expect(result).toBe('served');
    expect(isConeDone(game)).toBe(true);
    expect(game.served).toBe(true);
    expect(scoop(game, 'red')).toEqual({ game, result: 'full' });
  });

  it('refuses a color that is not in the rainbow', () => {
    expect(() => scoop(newGame(), 'pink')).toThrow();
  });
});

describe('next customer', () => {
  it("won't move on before the customer is served", () => {
    expect(() => nextCustomer(scoop(PUPPY, 'yellow').game)).toThrow();
  });

  it('moves on to the next customer with an empty cone', () => {
    const next = nextCustomer(scoopCone(newGame()).game);
    expect(next).toEqual({ customer: 1, cone: [], served: false });
  });

  it('is done once the unicorn is served', () => {
    const { game, result } = playAll();
    expect(result).toBe('done');
    expect(isDone(game)).toBe(true);
    expect(() => nextCustomer(game)).toThrow();
  });
});

describe('message', () => {
  it('asks for the cone in the picture', () => {
    expect(ask(newGame())).toBe('Bunny wants 1 red scoop!');
    expect(ask(PUPPY)).toBe('Puppy wants yellow, then blue!');
    expect(ask({ customer: 2, cone: [] })).toBe('Cat wants green, then orange, then green!');
    expect(ask({ customer: 5, cone: [] })).toBe('Unicorn wants 6 scoops! Start at the bottom.');
  });

  it('cheers each right scoop', () => {
    const { game, result } = scoop(PUPPY, 'yellow');
    expect(message(game, result, 'yellow')).toBe("Yum, yellow! What's next?");
  });

  it('is gentle about a wrong scoop', () => {
    expect(message(PUPPY, 'wrong', 'blue')).toBe('Oops, not blue! Look at the picture.');
  });

  it('says thank you for the cone', () => {
    const { game, result } = scoopCone(PUPPY);
    expect(message(game, result, 'blue')).toBe('Puppy says thank you! Tap Next.');
  });

  it('celebrates at the end', () => {
    const end = playAll();
    expect(message(end.game, end.result)).toBe('Every customer is happy!');
  });
});
