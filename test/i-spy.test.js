// The rules of Level 6, I spy.
import { describe, expect, it } from 'vitest';
import { COLOR_IDS } from '../public/game/colors.js';
import { THINGS, clue, currentThing, isDone, message, newGame, tap, thingById } from '../public/game/i-spy.js';

// Taps the thing each clue is about, through to the end.
function findAll(game) {
  let turn = { game };
  while (!isDone(turn.game)) turn = tap(turn.game, currentThing(turn.game).id);
  return turn;
}
// The other thing of the same color as `id`.
const twin = (id) => THINGS.find((t) => t.color === thingById(id).color && t.id !== id).id;
const startingWith = (id) => ({ clues: [id, ...newGame().clues.filter((c) => thingById(c).color !== thingById(id).color)], found: 0 });

describe('the meadow', () => {
  it('has two things of each rainbow color, each with its own hint', () => {
    expect(THINGS).toHaveLength(12);
    for (const color of COLOR_IDS) expect(THINGS.filter((t) => t.color === color)).toHaveLength(2);
    expect(new Set(THINGS.map((t) => t.hint)).size).toBe(12);
  });
});

describe('newGame', () => {
  it('has a clue for one thing of each color', () => {
    const { clues, found } = newGame();
    expect(found).toBe(0);
    expect(clues.map((id) => thingById(id).color).sort()).toEqual([...COLOR_IDS].sort());
  });

  it('picks different things and orders from game to game', () => {
    const games = new Set(Array.from({ length: 20 }, () => newGame().clues.join()));
    expect(games.size).toBeGreaterThan(1);
  });
});

describe('tap', () => {
  it('finds the thing the clue is about', () => {
    const start = newGame();
    const { game, result } = tap(start, start.clues[0]);
    expect(result).toBe('right');
    expect(game.found).toBe(1);
  });

  it("doesn't count the other thing of the same color", () => {
    const start = newGame();
    expect(tap(start, twin(start.clues[0]))).toEqual({ game: start, result: 'wrong' });
  });

  it('is done after six clues', () => {
    const { game, result } = findAll(newGame());
    expect(result).toBe('done');
    expect(currentThing(game)).toBeNull();
    expect(game.found).toBe(6);
  });

  it('refuses a thing that is not in the meadow', () => {
    expect(() => tap(newGame(), 'unicorn')).toThrow();
  });
});

describe('message', () => {
  it('gives the clue with a color and a hint', () => {
    expect(clue(thingById('butterfly'))).toBe('I spy something purple that flutters!');
    expect(message(startingWith('ladybug'))).toBe('I spy something red that crawls!');
  });

  it('says what was tapped, and gives the clue again', () => {
    expect(message(startingWith('ladybug'), 'wrong', 'apple'))
      .toBe("That's the red apple! I spy something red that crawls!");
  });

  it('cheers and gives the next clue', () => {
    const { game, result } = tap(startingWith('frog'), 'frog');
    expect(message(game, result)).toBe(`Yes, the frog! ${clue(currentThing(game))}`);
  });

  it('celebrates at the end', () => {
    const { game, result } = findAll(newGame());
    expect(message(game, result)).toBe('You found them all!');
  });
});
