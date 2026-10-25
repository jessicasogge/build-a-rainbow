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

// Round 2: 2 orange flowers.
const ROUND2 = { round: 1, pots: Array(POTS).fill(null) };

describe('the rounds', () => {
  it('go one color at a time, in rainbow order, one more flower each round', () => {
    expect(ROUNDS).toEqual(COLOR_IDS.map((color, i) => ({ [color]: i + 1 })));
    expect(ROUNDS[0]).toEqual({ red: 1 });
  });

  it('end with every pot full', () => {
    expect(ROUNDS.at(-1)).toEqual({ purple: POTS });
  });
});

describe('plant', () => {
  it('starts with empty pots', () => {
    expect(newGame().pots).toEqual(Array(POTS).fill(null));
  });

  it('plants a color that is asked for, and counts it', () => {
    const { game, result } = plant(ROUND2, 0, 'orange');
    expect(result).toBe('right');
    expect(planted(game, 'orange')).toBe(1);
  });

  it("won't plant a color that isn't asked for", () => {
    const start = newGame();
    expect(plant(start, 0, 'yellow')).toEqual({ game: start, result: 'unwanted' });
  });

  it('ends a round as soon as it has what it asks for', () => {
    const one = plant(ROUND2, 0, 'orange').game;
    const { game, result } = plant(one, 1, 'orange');
    expect(result).toBe('round');
    expect(isRoundDone(game)).toBe(true);
    expect(plant(game, 2, 'orange').result).toBe('full'); // no more planting
  });

  it("won't plant in a pot that already has a flower", () => {
    const one = plant(ROUND2, 0, 'orange').game;
    expect(plant(one, 0, 'orange')).toEqual({ game: one, result: 'full' });
  });

  it("won't move on before the round is done", () => {
    expect(() => nextRound(newGame())).toThrow();
  });

  it('moves on with empty pots', () => {
    const next = nextRound(plantRound(newGame()).game);
    expect(next.round).toBe(1);
    expect(next.pots).toEqual(Array(POTS).fill(null));
  });

  it('is done after the sixth round, with every pot full', () => {
    const { game, result } = playAll();
    expect(result).toBe('done');
    expect(isDone(game)).toBe(true);
    expect(game.pots).toEqual(Array(POTS).fill('purple'));
  });

  it('refuses a pot or color that does not exist', () => {
    expect(() => plant(newGame(), POTS, 'red')).toThrow();
    expect(() => plant(newGame(), 0, 'pink')).toThrow();
  });
});

describe('message', () => {
  it('asks for the flowers', () => {
    expect(ask(newGame())).toBe('Plant 1 red flower!');
    expect(ask(ROUND2)).toBe('Plant 2 orange flowers!');
    expect(ask({ round: 5, pots: [] })).toBe('Plant 6 purple flowers!');
  });

  it('counts along', () => {
    const { game, result } = plant(ROUND2, 0, 'orange');
    expect(message(game, result, 'orange')).toBe('One!');
  });

  it('is gentle about a color not asked for', () => {
    expect(message(newGame(), 'unwanted', 'yellow')).toBe("We don't need yellow this time. Look at the dots!");
  });

  it('points to Next, and celebrates at the end', () => {
    const { game, result } = plantRound(newGame());
    expect(message(game, result)).toBe('You did it! Tap Next.');
    const end = playAll();
    expect(message(end.game, end.result)).toBe('Your rainbow garden is all grown!');
  });
});
