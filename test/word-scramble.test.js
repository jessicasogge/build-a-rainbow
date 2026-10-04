// The rules of Level 7, Word scramble.
import { describe, expect, it } from 'vitest';
import {
  BOX_COLORS, WORDS, boxColor, currentWord, isDone, isWordDone, message, newPuzzle, nextLetter, nextWord, pick, scramble,
} from '../public/game/word-scramble.js';

// Taps the tiles that spell the rest of the current word, in order, picking
// any unused tile with the right letter. Returns the last turn.
function spell(puzzle) {
  let turn = { puzzle };
  while (!isWordDone(turn.puzzle)) {
    const p = turn.puzzle;
    const i = p.tiles.findIndex((letter, j) => letter === nextLetter(p) && !p.used.includes(j));
    turn = pick(p, i);
  }
  return turn;
}

// The first unused tile with `letter` on it.
const tileOf = (puzzle, letter) => puzzle.tiles.findIndex((l, j) => l === letter && !puzzle.used.includes(j));

describe('the words', () => {
  it('are RAINBOW, then SUNSHINE', () => {
    expect(WORDS.map((w) => w.word)).toEqual(['RAINBOW', 'SUNSHINE']);
  });

  it('give every box a rainbow color, going round again for longer words', () => {
    expect(boxColor(0)).toBe(BOX_COLORS[0]);
    expect(boxColor(6)).toBe(BOX_COLORS[6]);
    expect(boxColor(7)).toBe(BOX_COLORS[0]);
  });
});

describe('scramble', () => {
  it('uses every letter of the word, repeated letters too', () => {
    for (const { word } of WORDS) expect([...scramble(word)].sort()).toEqual([...word].sort());
  });

  it('never comes out already spelling the word', () => {
    // Math.random() always 0.99 leaves the letters in order, so it must try again.
    let calls = 0;
    const random = () => (calls++ < 6 ? 0.99 : 0);
    expect(scramble('RAINBOW', random).join('')).not.toBe('RAINBOW');
  });
});

describe('pick', () => {
  it('starts with the R of RAINBOW', () => {
    const puzzle = newPuzzle();
    expect(currentWord(puzzle)).toBe('RAINBOW');
    expect(nextLetter(puzzle)).toBe('R');
  });

  it('puts the next letter in its box', () => {
    const start = newPuzzle();
    const { puzzle, result } = pick(start, tileOf(start, 'R'));
    expect(result).toBe('right');
    expect(puzzle.placed).toBe(1);
    expect(nextLetter(puzzle)).toBe('A');
  });

  it('changes nothing with the wrong letter', () => {
    const start = newPuzzle();
    const { puzzle, result } = pick(start, tileOf(start, 'W'));
    expect(result).toBe('wrong');
    expect(puzzle).toBe(start);
  });

  it('ignores a tile that is already in a box', () => {
    const start = newPuzzle();
    const r = tileOf(start, 'R');
    const { puzzle } = pick(start, r);
    expect(pick(puzzle, r).result).toBe('used');
  });

  it('finishes RAINBOW with another word to come', () => {
    const { puzzle, result } = spell(newPuzzle());
    expect(result).toBe('word');
    expect(isWordDone(puzzle)).toBe(true);
    expect(isDone(puzzle)).toBe(false);
    expect(nextLetter(puzzle)).toBeNull();
  });

  it('moves on to SUNSHINE, freshly scrambled', () => {
    const puzzle = nextWord(spell(newPuzzle()).puzzle);
    expect(currentWord(puzzle)).toBe('SUNSHINE');
    expect(puzzle.placed).toBe(0);
    expect([...puzzle.tiles].sort()).toEqual([...'SUNSHINE'].sort());
  });

  it("won't move on before the word is spelled", () => {
    expect(() => nextWord(newPuzzle())).toThrow();
  });

  it('takes either S for the first letter of SUNSHINE, and the other one later', () => {
    const start = nextWord(spell(newPuzzle()).puzzle);
    const [firstS, secondS] = start.tiles.flatMap((l, i) => (l === 'S' ? [i] : []));
    const { puzzle, result } = pick(start, secondS);
    expect(result).toBe('right');
    expect(pick(puzzle, firstS).result).toBe('wrong'); // U comes next
  });

  it('is done after the last letter of SUNSHINE', () => {
    const { puzzle, result } = spell(nextWord(spell(newPuzzle()).puzzle));
    expect(result).toBe('done');
    expect(isDone(puzzle)).toBe(true);
  });

  it('refuses a tile that does not exist', () => {
    expect(() => pick(newPuzzle(), 99)).toThrow();
  });
});

describe('message', () => {
  it('explains the puzzle', () => {
    expect(message(newPuzzle())).toBe('Put the letters in order to spell RAINBOW.');
  });

  it('names the letter just placed', () => {
    const start = newPuzzle();
    const { puzzle, result } = pick(start, tileOf(start, 'R'));
    expect(message(puzzle, result)).toBe('R! What comes next?');
  });

  it('is gentle about a wrong letter', () => {
    expect(message(newPuzzle(), 'wrong', 'B')).toBe('Not B yet. Try another letter!');
  });

  it('points to Next after the first word', () => {
    const { puzzle, result } = spell(newPuzzle());
    expect(message(puzzle, result)).toBe('You spelled RAINBOW! Tap Next for another word.');
  });

  it('explains the second word', () => {
    expect(message(nextWord(spell(newPuzzle()).puzzle))).toBe('Put the letters in order to spell SUNSHINE.');
  });

  it('celebrates both words at the end', () => {
    const { puzzle, result } = spell(nextWord(spell(newPuzzle()).puzzle));
    expect(message(puzzle, result)).toBe('You spelled RAINBOW and SUNSHINE!');
  });
});
