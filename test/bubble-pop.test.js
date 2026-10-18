// The rules of Level 11, Bubble pop.
import { describe, expect, it } from 'vitest';
import { COLOR_IDS } from '../public/game/colors.js';
import { POPS, ROUNDS, bubbleColor, isDone, message, newGame, pop, target } from '../public/game/bubble-pop.js';

// Pops `n` bubbles of the color called.
function popRight(game, n) {
  let turn = { game };
  for (let i = 0; i < n; i++) turn = pop(turn.game, target(turn.game));
  return turn;
}
const other = (game) => COLOR_IDS.find((c) => c !== target(game));
const game = (targets = ['green', 'red', 'blue']) => ({ targets, round: 0, popped: 0 });

describe('newGame', () => {
  it('calls three different rainbow colors', () => {
    const { targets, round, popped } = newGame();
    expect(targets).toHaveLength(ROUNDS);
    expect(new Set(targets).size).toBe(ROUNDS);
    for (const c of targets) expect(COLOR_IDS).toContain(c);
    expect([round, popped]).toEqual([0, 0]);
  });

  it('calls different colors from game to game', () => {
    const games = new Set(Array.from({ length: 20 }, () => newGame().targets.join()));
    expect(games.size).toBeGreaterThan(1);
  });
});

describe('bubbleColor', () => {
  it('is often the color called', () => {
    expect(bubbleColor(game(), () => 0)).toBe('green');
  });

  it('is otherwise one of the other colors', () => {
    const colors = new Set(Array.from({ length: 50 }, (_, i) => bubbleColor(game(), () => 0.4 + (i / 50) * 0.59)));
    expect(colors.has('green')).toBe(false);
    for (const c of colors) expect(COLOR_IDS).toContain(c);
    expect(colors.size).toBeGreaterThan(1);
  });
});

describe('pop', () => {
  it('counts a bubble of the color called', () => {
    const turn = pop(game(), 'green');
    expect(turn.result).toBe('right');
    expect(turn.game.popped).toBe(1);
  });

  it('lets a bubble of another color boing away', () => {
    const start = game();
    expect(pop(start, 'red')).toEqual({ game: start, result: 'wrong' });
  });

  it('calls the next color after five', () => {
    const turn = popRight(game(), POPS);
    expect(turn.result).toBe('round');
    expect(target(turn.game)).toBe('red');
    expect(turn.game.popped).toBe(0);
  });

  it('is done after three colors', () => {
    const turn = popRight(game(), POPS * ROUNDS);
    expect(turn.result).toBe('done');
    expect(isDone(turn.game)).toBe(true);
    expect(target(turn.game)).toBeNull();
    expect(pop(turn.game, 'red').result).toBe('wrong');
  });

  it('refuses a color that is not in the rainbow', () => {
    expect(() => pop(game(), 'pink')).toThrow();
  });
});

describe('message', () => {
  it('calls the color', () => {
    expect(message(game())).toBe('Pop the green bubbles!');
  });

  it('counts down the pops', () => {
    const turn = pop(game(), 'green');
    expect(message(turn.game, turn.result)).toBe('Pop! 4 more green bubbles!');
    const almost = popRight(game(), POPS - 1);
    expect(message(almost.game, almost.result)).toBe('Pop! Just one more!');
  });

  it('is gentle about another color', () => {
    expect(message(game(), 'wrong', 'red')).toBe('That one is red. Pop the green ones!');
  });

  it('calls the next color', () => {
    const turn = popRight(game(), POPS);
    expect(message(turn.game, turn.result)).toBe('Great popping! Now pop the red bubbles!');
  });

  it('celebrates at the end', () => {
    const turn = popRight(game(), POPS * ROUNDS);
    expect(message(turn.game, turn.result)).toBe('You popped them all!');
  });
});
