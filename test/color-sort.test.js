// The rules of Level 9, Color sort.
import { describe, expect, it } from 'vitest';
import { COLOR_IDS } from '../public/game/colors.js';
import { THINGS, currentThing, drop, isDone, message, newGame, thingById } from '../public/game/color-sort.js';

// Sorts the current thing into its own basket.
const sortOne = (game) => drop(game, currentThing(game).color);

function sortAll(game) {
  let turn = { game };
  while (!isDone(turn.game)) turn = sortOne(turn.game);
  return turn;
}

// A game that starts with `id`, for messages that name a thing.
function gameStartingWith(id) {
  const rest = newGame().things.filter((t) => thingById(t).color !== thingById(id).color);
  return { things: [id, ...rest], sorted: 0 };
}

describe('the things', () => {
  it('are two of each rainbow color', () => {
    expect(THINGS).toHaveLength(12);
    for (const color of COLOR_IDS) expect(THINGS.filter((t) => t.color === color)).toHaveLength(2);
  });
});

describe('newGame', () => {
  it('picks one thing of each color', () => {
    const game = newGame();
    expect(game.sorted).toBe(0);
    expect(game.things.map((id) => thingById(id).color).sort()).toEqual([...COLOR_IDS].sort());
  });

  it('picks different things and orders from game to game', () => {
    const games = new Set(Array.from({ length: 20 }, () => newGame().things.join()));
    expect(games.size).toBeGreaterThan(1);
  });
});

describe('drop', () => {
  it('sorts a thing into its own basket and brings the next', () => {
    const start = newGame();
    const { game, result } = sortOne(start);
    expect(result).toBe('right');
    expect(game.sorted).toBe(1);
    expect(currentThing(game).id).toBe(start.things[1]);
  });

  it('keeps a thing out of the wrong basket', () => {
    const start = gameStartingWith('frog');
    expect(drop(start, 'red')).toEqual({ game: start, result: 'wrong' });
  });

  it('is done after the sixth thing', () => {
    const { game, result } = sortAll(newGame());
    expect(result).toBe('done');
    expect(isDone(game)).toBe(true);
    expect(currentThing(game)).toBeNull();
    expect(() => drop(game, 'red')).toThrow();
  });

  it('refuses a basket that is not a rainbow color', () => {
    expect(() => drop(newGame(), 'pink')).toThrow();
  });
});

describe('message', () => {
  it('explains the game', () => {
    expect(message(gameStartingWith('frog'))).toBe('Drag the frog into the basket of its color.');
  });

  it('is gentle about the wrong basket', () => {
    expect(message(gameStartingWith('frog'), 'wrong', 'blue')).toBe("The frog isn't blue. Try another basket!");
    expect(message(gameStartingWith('grapes'), 'wrong', 'red')).toBe("The grapes aren't red. Try another basket!");
  });

  it('cheers a right basket and names the next thing', () => {
    const { game, result } = sortOne(gameStartingWith('blueberries'));
    expect(message(game, result)).toBe(`Yes! The blueberries are blue. Now the ${currentThing(game).name}!`);
  });

  it('celebrates at the end', () => {
    const { game, result } = sortAll(newGame());
    expect(message(game, result)).toBe('You sorted them all!');
  });
});
