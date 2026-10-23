// The rules of Level 4, Rainbow garden.
import { describe, expect, it } from 'vitest';
import { COLOR_IDS } from '../public/game/colors.js';
import {
  POTS, ROUNDS, ask, isDone, isRoundDone, message, newGame, nextRound, plant, planted, wanted,
} from '../public/game/rainbow-garden.js';

// Plants everything the round asks for, in the first empty pots.
function plantRound(game) {
  let turn = { game };
  for (const [color, n] of Object.entries(wanted(game))) {
    for (let i = 0; i < n; i++) turn = plant(turn.game, turn.game.pots.indexOf(null), color);
  }
  return turn;
}
function playAll() {
  let turn = plantRound(newGame());
  while (turn.result !== 'done') turn = plantRound(nextRound(turn.game));
  return turn;
}

describe('the rounds', () => {
  it('ask for rainbow colors, never more flowers than there are pots, up to five', () => {
    expect(ROUNDS).toHaveLength(5);
    for (const round of ROUNDS) {
      for (const color of Object.keys(round)) expect(COLOR_IDS).toContain(color);
      const total = Object.values(round).reduce((a, b) => a + b, 0);
      expect(total).toBeLessThan(POTS); // a pot to spare, so too many can happen
      expect(total).toBeLessThanOrEqual(5);
    }
  });

  it('build from one color to three', () => {
    expect(ROUNDS.map((r) => Object.keys(r).length)).toEqual([1, 1, 1, 2, 3]);
  });
});

describe('plant', () => {
  it('starts with empty pots', () => {
    expect(newGame().pots).toEqual(Array(POTS).fill(null));
  });

  it('plants a color that is asked for, and counts it', () => {
    const { game, result } = plant(newGame(), 0, 'yellow');
    expect(result).toBe('right');
    expect(planted(game, 'yellow')).toBe(1);
  });

  it("won't plant a color that isn't asked for", () => {
    const start = newGame();
    expect(plant(start, 0, 'red')).toEqual({ game: start, result: 'unwanted' });
  });

  it('ends a round as soon as it has what it asks for', () => {
    const one = plant(newGame(), 0, 'yellow').game;
    const { game, result } = plant(one, 1, 'yellow');
    expect(result).toBe('round');
    expect(isRoundDone(game)).toBe(true);
    expect(plant(game, 2, 'yellow').result).toBe('full'); // no more planting
  });

  it('says when a color is all planted, before the round is', () => {
    const game = { round: 3, pots: Array(POTS).fill(null) }; // 1 purple and 2 green
    const turn = plant(game, 0, 'purple');
    expect(turn.result).toBe('color');
    expect(plant(turn.game, 1, 'purple')).toEqual({ game: turn.game, result: 'extra' });
  });

  it("won't plant in a pot that already has a flower", () => {
    const one = plant(newGame(), 0, 'yellow').game;
    expect(plant(one, 0, 'yellow')).toEqual({ game: one, result: 'full' });
  });

  it("won't move on before the round is done", () => {
    expect(() => nextRound(newGame())).toThrow();
  });

  it('moves on with empty pots', () => {
    const next = nextRound(plantRound(newGame()).game);
    expect(next.round).toBe(1);
    expect(next.pots).toEqual(Array(POTS).fill(null));
  });

  it('is done after the fifth round', () => {
    const { game, result } = playAll();
    expect(result).toBe('done');
    expect(isDone(game)).toBe(true);
  });

  it('refuses a pot or color that does not exist', () => {
    expect(() => plant(newGame(), POTS, 'yellow')).toThrow();
    expect(() => plant(newGame(), 0, 'pink')).toThrow();
  });
});

describe('message', () => {
  it('asks for the flowers', () => {
    expect(ask(newGame())).toBe('Plant 2 yellow flowers!');
    expect(ask({ round: 3, pots: [] })).toBe('Plant 1 purple and 2 green flowers!');
    expect(ask({ round: 4, pots: [] })).toBe('Plant 2 orange, 1 red and 2 blue flowers!');
  });

  it('counts along', () => {
    const { game, result } = plant(newGame(), 0, 'yellow');
    expect(message(game, result, 'yellow')).toBe('One!');
  });

  it('says when a color is all planted', () => {
    const { game, result } = plant({ round: 3, pots: Array(POTS).fill(null) }, 0, 'purple');
    expect(message(game, result, 'purple')).toBe('One purple flower!');
  });

  it('is gentle about one too many', () => {
    const game = { round: 3, pots: ['purple', null, null, null, null, null] };
    expect(message(game, 'extra', 'purple')).toBe("Oops, that's 2! We need 1 purple.");
  });

  it('is gentle about a color not asked for', () => {
    expect(message(newGame(), 'unwanted', 'red')).toBe("We don't need red this time. Look at the dots!");
  });

  it('points to Next, and celebrates at the end', () => {
    const { game, result } = plantRound(newGame());
    expect(message(game, result)).toBe('You did it! Tap Next.');
    const end = playAll();
    expect(message(end.game, end.result)).toBe('Your rainbow garden is all grown!');
  });
});
