// The rules of Level 7, Word scramble.
import { describe, expect, it } from 'vitest';
import { BOX_COLORS, WORD, isDone, message, newPuzzle, nextLetter, pick, scramble } from '../public/game/word-scramble.js';

describe('scramble', () => {
  it('uses every letter of RAINBOW once', () => {
    expect(WORD).toBe('RAINBOW');
    expect([...scramble()].sort()).toEqual([...WORD].sort());
  });

  it('never comes out already spelling RAINBOW', () => {
    // Math.random() always 0.99 leaves the letters in order, so it must try again.
    let calls = 0;
    const random = () => (calls++ < 6 ? 0.99 : 0);
    expect(scramble(random).join('')).not.toBe(WORD);
  });

  it('has a rainbow color for every box', () => {
    expect(BOX_COLORS).toHaveLength(WORD.length);
  });
});

describe('pick', () => {
  it('starts with R', () => {
    expect(nextLetter(newPuzzle())).toBe('R');
  });

  it('puts the next letter in its box', () => {
    const { puzzle, result } = pick(newPuzzle(), 'R');
    expect(result).toBe('right');
    expect(puzzle.placed).toBe(1);
    expect(nextLetter(puzzle)).toBe('A');
  });

  it('changes nothing with the wrong letter', () => {
    const start = newPuzzle();
    const { puzzle, result } = pick(start, 'W');
    expect(result).toBe('wrong');
    expect(puzzle).toBe(start);
  });

  it('ignores a letter that is already in a box', () => {
    const { puzzle } = pick(newPuzzle(), 'R');
    expect(pick(puzzle, 'R').result).toBe('used');
  });

  it('is done after W', () => {
    let puzzle = newPuzzle();
    let result;
    for (const letter of WORD) ({ puzzle, result } = pick(puzzle, letter));
    expect(result).toBe('done');
    expect(isDone(puzzle)).toBe(true);
    expect(nextLetter(puzzle)).toBeNull();
  });

  it('refuses a letter that is not in RAINBOW', () => {
    expect(() => pick(newPuzzle(), 'Z')).toThrow();
  });
});

describe('message', () => {
  it('explains the puzzle', () => {
    expect(message(newPuzzle())).toBe('Put the letters in order to spell RAINBOW.');
  });

  it('names the letter just placed', () => {
    const { puzzle, result } = pick(newPuzzle(), 'R');
    expect(message(puzzle, result)).toBe('R! What comes next?');
  });

  it('is gentle about a wrong letter', () => {
    expect(message(newPuzzle(), 'wrong', 'B')).toBe('Not B yet. Try another letter!');
  });

  it('celebrates the finished word', () => {
    expect(message({ tiles: [], placed: 7 })).toBe('You spelled RAINBOW!');
  });
});
