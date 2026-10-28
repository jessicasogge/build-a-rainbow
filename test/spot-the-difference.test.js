// The rules of Level 15, Spot the difference.
import { describe, expect, it } from 'vitest';
import { COLOR_IDS } from '../public/game/colors.js';
import {
  SCENES, changesIn, colorOf, isDone, isSceneDone, message, newGame, nextScene, tap,
} from '../public/game/spot-the-difference.js';

// Finds every difference in the picture.
function findAll(game) {
  let turn = { game };
  for (const thing of changesIn(game)) turn = tap(turn.game, thing);
  return turn;
}
function playAll() {
  let turn = findAll(newGame());
  while (turn.result !== 'done') turn = findAll(nextScene(turn.game));
  return turn;
}

describe('the pictures', () => {
  it('have 3, then 4, then 5 differences', () => {
    expect(SCENES.map((s) => Object.keys(s.changes).length)).toEqual([3, 4, 5]);
  });

  it('change things that are in the picture to a different rainbow color', () => {
    for (const { things, changes } of SCENES) {
      for (const color of Object.values(things)) expect(COLOR_IDS).toContain(color);
      for (const [thing, color] of Object.entries(changes)) {
        expect(COLOR_IDS).toContain(color);
        expect(things[thing]).toBeDefined();
        expect(color).not.toBe(things[thing]);
      }
    }
  });

  it('leave some things the same, so not every tap is right', () => {
    for (const { things, changes } of SCENES) {
      expect(Object.keys(things).length).toBeGreaterThan(Object.keys(changes).length + 2);
    }
  });
});

describe('tap', () => {
  it('starts on the park, with nothing found', () => {
    expect(newGame()).toEqual({ scene: 0, found: [] });
  });

  it('gives each copy its own color', () => {
    expect(colorOf(newGame(), 'ball')).toBe('blue');
    expect(colorOf(newGame(), 'ball', true)).toBe('yellow');
    expect(colorOf(newGame(), 'kite', true)).toBe('purple');
  });

  it('finds a thing that changed color', () => {
    const { game, result } = tap(newGame(), 'ball');
    expect(result).toBe('found');
    expect(game.found).toEqual(['ball']);
  });

  it("won't count a thing that's the same in both", () => {
    expect(tap(newGame(), 'kite')).toEqual({ game: newGame(), result: 'same' });
  });

  it("won't count a thing twice", () => {
    const one = tap(newGame(), 'ball').game;
    expect(tap(one, 'ball')).toEqual({ game: one, result: 'again' });
  });

  it('refuses a thing that is not in the picture', () => {
    expect(() => tap(newGame(), 'crab')).toThrow();
  });

  it('finishes a picture once every difference is found', () => {
    const { game, result } = findAll(newGame());
    expect(result).toBe('scene');
    expect(isSceneDone(game)).toBe(true);
  });

  it("won't move on before the picture is done", () => {
    expect(() => nextScene(newGame())).toThrow();
  });

  it('moves on to the next picture', () => {
    expect(nextScene(findAll(newGame()).game)).toEqual({ scene: 1, found: [] });
  });

  it('is done after the beach', () => {
    const { game, result } = playAll();
    expect(result).toBe('done');
    expect(isDone(game)).toBe(true);
    expect(() => nextScene(game)).toThrow();
  });
});

describe('message', () => {
  it('says how many to find', () => {
    expect(message(newGame())).toBe('Find 3 things that changed color!');
  });

  it('says what changed, and how many are left', () => {
    const { game, result } = tap(newGame(), 'ball');
    expect(message(game, result, 'ball')).toBe('The ball changed from blue to yellow! 2 more to go.');
  });

  it('is gentle about a thing that did not change', () => {
    expect(message(newGame(), 'same', 'kite')).toBe('The kite is purple in both. Look again!');
  });

  it('says when one was found already', () => {
    const one = tap(newGame(), 'ball').game;
    expect(message(one, 'again', 'ball')).toBe('You found that one already! 2 more to go.');
  });

  it('points to Next, and celebrates at the end', () => {
    const { game, result } = findAll(newGame());
    expect(message(game, result, 'ball')).toBe('The ball changed from blue to yellow! Tap Next.');
    const end = playAll();
    expect(message(end.game, end.result)).toBe('You found every difference!');
  });

  it('calls the watering can by its whole name', () => {
    const garden = nextScene(findAll(newGame()).game);
    const { game, result } = tap(garden, 'can');
    expect(message(game, result, 'can')).toBe('The watering can changed from green to blue! 3 more to go.');
  });
});
