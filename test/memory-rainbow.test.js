// The rules of Level 8, Memory rainbow.
import { describe, expect, it } from 'vitest';
import { COLOR_IDS } from '../public/game/colors.js';
import { PAIRS, flip, hide, isDone, message, newGame, pairsFound } from '../public/game/memory-rainbow.js';

// The places of the two cards of `color`.
const both = (game, color) => game.cards.flatMap((c, i) => (c === color ? [i] : []));
// A card that isn't `color`.
const other = (game, color) => game.cards.findIndex((c) => c !== color);

function findPair(game, color) {
  const [a, b] = both(game, color);
  return flip(flip(game, a).game, b);
}

describe('newGame', () => {
  it('deals twelve cards face down, two of each color', () => {
    const game = newGame();
    expect(game.cards).toHaveLength(12);
    expect([...game.cards].sort()).toEqual([...COLOR_IDS, ...COLOR_IDS].sort());
    expect(game.up).toEqual([]);
    expect(game.matched).toEqual([]);
    expect(PAIRS).toBe(6);
  });

  it('shuffles the cards', () => {
    const orders = new Set(Array.from({ length: 10 }, () => newGame().cards.join()));
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe('flip', () => {
  it('turns over the first card of a try', () => {
    const { game, result } = flip(newGame(), 0);
    expect(result).toBe('first');
    expect(game.up).toEqual([0]);
  });

  it('keeps a matching pair face up', () => {
    const start = newGame();
    const [a, b] = both(start, 'red');
    const { game, result } = findPair(start, 'red');
    expect(result).toBe('match');
    expect(game.matched).toEqual([a, b]);
    expect(game.up).toEqual([]);
    expect(pairsFound(game)).toBe(1);
  });

  it('shows two cards that do not match until they are hidden', () => {
    const start = newGame();
    const [red] = both(start, 'red');
    const blue = other(start, 'red');
    const { game, result } = flip(flip(start, red).game, blue);
    expect(result).toBe('miss');
    expect(game.up).toEqual([red, blue]);
    expect(hide(game).up).toEqual([]);
    expect(game.matched).toEqual([]);
  });

  it('turns a miss back over when a third card is tapped', () => {
    const start = newGame();
    const [red] = both(start, 'red');
    const notRed = other(start, 'red');
    const missed = flip(flip(start, red).game, notRed).game;
    const third = missed.cards.findIndex((_, i) => i !== red && i !== notRed);
    const { game, result } = flip(missed, third);
    expect(result).toBe('first');
    expect(game.up).toEqual([third]);
  });

  it('ignores a card that is already face up', () => {
    const first = flip(newGame(), 3).game;
    expect(flip(first, 3)).toEqual({ game: first, result: 'used' });
    const { game } = findPair(newGame(), 'blue');
    expect(flip(game, game.matched[0]).result).toBe('used');
  });

  it('is done when every pair is found', () => {
    let game = newGame();
    let result;
    for (const color of COLOR_IDS) ({ game, result } = findPair(game, color));
    expect(result).toBe('done');
    expect(isDone(game)).toBe(true);
    expect(pairsFound(game)).toBe(6);
  });

  it('refuses a card that does not exist', () => {
    expect(() => flip(newGame(), 12)).toThrow();
  });
});

describe('message', () => {
  it('explains the game', () => {
    expect(message(newGame())).toBe('Turn over two cards to find a matching pair.');
  });

  it('names the first card', () => {
    const start = newGame();
    const [red] = both(start, 'red');
    const { game, result } = flip(start, red);
    expect(message(game, result, red)).toBe('Red! Where is the other one?');
  });

  it('cheers a match', () => {
    const start = newGame();
    const [, b] = both(start, 'green');
    const { game, result } = findPair(start, 'green');
    expect(message(game, result, b)).toBe('Two green cards. A match!');
  });

  it('is gentle about a miss', () => {
    const start = newGame();
    const [red] = both(start, 'red');
    const [blue] = both(start, 'blue');
    const { game, result } = flip(flip(start, red).game, blue);
    expect(message(game, result, blue)).toBe("Red and blue don't match. Try again!");
  });

  it('celebrates at the end', () => {
    let game = newGame();
    for (const color of COLOR_IDS) ({ game } = findPair(game, color));
    expect(message(game, 'done')).toBe('You found every pair!');
  });
});
