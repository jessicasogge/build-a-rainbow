// The rules of Level 16, Rainbow puzzle.
import { describe, expect, it } from 'vitest';
import {
  PUZZLES, isDone, isPuzzleDone, message, newGame, nextPuzzle, pieceCount, place,
} from '../public/game/rainbow-puzzle.js';

// Always picks the first choice, so the shuffle is the same every time.
const random = () => 0;

// Puts every piece in its spot.
function solve(game) {
  let turn = { game };
  for (const piece of [...game.tray]) turn = place(turn.game, piece, piece);
  return turn;
}
function playAll() {
  let turn = solve(newGame(random));
  while (turn.result !== 'done') turn = solve(nextPuzzle(turn.game, random));
  return turn;
}

describe('the puzzles', () => {
  it('have 6, then 9, then 12 pieces', () => {
    expect(PUZZLES.map(pieceCount)).toEqual([6, 9, 12]);
  });
});

describe('place', () => {
  it('starts with every piece of the first puzzle in the tray, mixed up', () => {
    const game = newGame(random);
    expect(game.puzzle).toBe(0);
    expect(game.placed).toEqual([]);
    expect([...game.tray].sort()).toEqual([0, 1, 2, 3, 4, 5]);
    expect(game.tray).not.toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('never starts with the pieces already in order', () => {
    let calls = 0;
    const inOrderFirst = () => (calls++ < 5 ? 0.999 : 0); // in order the first time
    expect(newGame(inOrderFirst).tray).not.toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('puts a piece in its own spot', () => {
    const { game, result } = place(newGame(random), 3, 3);
    expect(result).toBe('right');
    expect(game.placed).toEqual([3]);
    expect(game.tray).not.toContain(3);
  });

  it("won't put a piece in someone else's spot", () => {
    const start = newGame(random);
    expect(place(start, 3, 4)).toEqual({ game: start, result: 'wrong' });
  });

  it("won't place a piece twice", () => {
    const one = place(newGame(random), 3, 3).game;
    expect(place(one, 3, 3)).toEqual({ game: one, result: 'taken' });
  });

  it('refuses a piece or spot that does not exist', () => {
    expect(() => place(newGame(random), 6, 6)).toThrow();
    expect(() => place(newGame(random), 0, -1)).toThrow();
  });

  it('finishes a picture once every piece is in', () => {
    const { game, result } = solve(newGame(random));
    expect(result).toBe('puzzle');
    expect(isPuzzleDone(game)).toBe(true);
    expect(game.tray).toEqual([]);
  });

  it("won't move on before the picture is done", () => {
    expect(() => nextPuzzle(newGame(random))).toThrow();
  });

  it('moves on to a bigger puzzle', () => {
    const next = nextPuzzle(solve(newGame(random)).game, random);
    expect(next.puzzle).toBe(1);
    expect(next.tray).toHaveLength(9);
  });

  it('is done after the last puzzle', () => {
    const { game, result } = playAll();
    expect(result).toBe('done');
    expect(isDone(game)).toBe(true);
    expect(() => nextPuzzle(game)).toThrow();
  });
});

describe('message', () => {
  it('says how many pieces there are', () => {
    expect(message(newGame(random))).toBe('Put the 6 pieces back in the picture!');
  });

  it('counts down the pieces left', () => {
    const { game, result } = place(newGame(random), 0, 0);
    expect(message(game, result)).toBe('It fits! 5 more pieces.');
    let last = game;
    for (const p of [1, 2, 3, 4]) last = place(last, p, p).game;
    expect(message(last, 'right')).toBe('It fits! 1 more piece.');
  });

  it('is gentle about a wrong spot, and explains how to play', () => {
    expect(message(newGame(random), 'wrong')).toBe('That piece goes somewhere else. Look at the picture!');
    expect(message(newGame(random), 'pick')).toBe('Tap a piece first, then tap where it goes!');
  });

  it('points to Next, and celebrates at the end', () => {
    const { game, result } = solve(newGame(random));
    expect(message(game, result)).toBe('You finished the picture! Tap Next.');
    const end = playAll();
    expect(message(end.game, end.result)).toBe('You finished every puzzle!');
  });
});
