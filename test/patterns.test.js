// The rules of Level 12, What comes next?
import { describe, expect, it } from 'vitest';
import { COLOR_IDS } from '../public/game/colors.js';
import {
  PATTERNS, SHAPES, currentPattern, isDone, message, nameOf, newGame, nextRound, pick, sameThing,
} from '../public/game/patterns.js';

// The place of the right choice, and of a wrong one.
const right = (game) => game.choices.findIndex((c) => sameThing(c, currentPattern(game).answer));
const wrong = (game) => game.choices.findIndex((c) => !sameThing(c, currentPattern(game).answer));

// Picks the right choice.
const solve = (game) => pick(game, right(game));

// Plays right answers through to the end.
function finish(game) {
  let turn = solve(game);
  while (turn.result !== 'done') turn = solve(nextRound(turn.game));
  return turn;
}

describe('the patterns', () => {
  it('are six, using only rainbow colors and known shapes', () => {
    expect(PATTERNS).toHaveLength(6);
    for (const { shown, answer, others } of PATTERNS) {
      for (const t of [...shown, answer, ...others]) {
        expect(COLOR_IDS).toContain(t.color);
        expect(SHAPES).toContain(t.shape);
      }
    }
  });

  it('each have exactly one right choice among three different ones', () => {
    for (const { answer, others } of PATTERNS) {
      const choices = [answer, ...others];
      expect(choices).toHaveLength(3);
      expect(new Set(choices.map(nameOf)).size).toBe(3);
    }
  });

  it('end with the rainbow, where purple comes after blue', () => {
    const last = PATTERNS.at(-1);
    expect(last.shown.map((t) => t.color)).toEqual(['red', 'orange', 'yellow', 'green', 'blue']);
    expect(last.answer.color).toBe('purple');
  });
});

describe('a game', () => {
  it('starts on the first pattern with its three choices', () => {
    const game = newGame();
    expect(game.round).toBe(0);
    expect(game.solved).toBe(false);
    expect(game.choices.map(nameOf).sort()).toEqual(['blue circle', 'red circle', 'yellow circle']);
  });

  it('keeps a wrong choice out of the gap', () => {
    const game = newGame();
    expect(pick(game, wrong(game))).toEqual({ game, result: 'wrong' });
  });

  it('fills the gap with the right choice', () => {
    const { game, result } = solve(newGame());
    expect(result).toBe('right');
    expect(game.solved).toBe(true);
    expect(pick(game, 0).result).toBe('used');
  });

  it("won't move on before the gap is filled", () => {
    expect(() => nextRound(newGame())).toThrow();
  });

  it('moves on to the next pattern', () => {
    const solved = solve(newGame()).game;
    const next = nextRound(solved);
    expect(next.round).toBe(1);
    expect(next.solved).toBe(false);
  });

  it('is done after the last pattern', () => {
    const { game, result } = finish(newGame());
    expect(result).toBe('done');
    expect(isDone(game)).toBe(true);
    expect(game.round).toBe(5);
    expect(() => nextRound(game)).toThrow();
  });

  it('refuses a choice that does not exist', () => {
    expect(() => pick(newGame(), 3)).toThrow();
  });
});

describe('message', () => {
  it('asks the question', () => {
    expect(message(newGame())).toBe('What comes next?');
  });

  it('is gentle about a wrong choice', () => {
    expect(message(newGame(), 'wrong')).toBe('Not that one. Say the pattern out loud and try again!');
  });

  it('names the answer and points to Next', () => {
    const { game, result } = solve(newGame());
    expect(message(game, result)).toBe('Yes! The blue circle comes next. Tap Next!');
  });

  it('celebrates at the end', () => {
    const { game, result } = finish(newGame());
    expect(message(game, result)).toBe('You finished every pattern!');
  });
});
