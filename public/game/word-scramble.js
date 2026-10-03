// Level 7, Word scramble: the letters of RAINBOW come mixed up. Tap them in
// order to spell the word; each right letter drops into the next box.
//
// This file is only the rules. It doesn't touch the page, so the tests can
// play it directly. word-scramble-page.js draws it and handles the taps.

export const WORD = 'RAINBOW';

// Each box gets a rainbow color as its letter goes in: the six stripes, then
// pink for the seventh letter.
export const BOX_COLORS = ['#E5383B', '#F77F00', '#FCBF49', '#43AA8B', '#277DA1', '#7B4FA0', '#F28AB2'];

// The letters in a random order, never already spelling the word. RAINBOW has
// no repeated letters, so each letter is its own tile. `random` is there so
// tests can pass their own.
export function scramble(random = Math.random) {
  let letters;
  do {
    letters = [...WORD];
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
  } while (letters.join('') === WORD);
  return letters;
}

export function newPuzzle(random = Math.random) {
  return { tiles: scramble(random), placed: 0 };
}

export function isDone(puzzle) {
  return puzzle.placed >= WORD.length;
}

// The letter that goes in the next box (null when the word is spelled).
export function nextLetter(puzzle) {
  return WORD[puzzle.placed] ?? null;
}

// Tap a letter. Returns the new puzzle and what happened:
//   'right' – it's the next letter; it goes in the next box
//   'done'  – right, and it was the last letter
//   'wrong' – not that letter yet; nothing changes
//   'used'  – that letter is already in a box; nothing changes
export function pick(puzzle, letter) {
  const index = WORD.indexOf(letter);
  if (index === -1) throw new Error(`${letter} isn't in ${WORD}`);
  if (index < puzzle.placed || isDone(puzzle)) return { puzzle, result: 'used' };
  if (index !== puzzle.placed) return { puzzle, result: 'wrong' };
  const next = { ...puzzle, placed: puzzle.placed + 1 };
  return { puzzle: next, result: isDone(next) ? 'done' : 'right' };
}

// What the helper says. Short, so a new reader can manage it.
// `picked` is the letter that was just tapped, for a wrong pick.
export function message(puzzle, result, picked) {
  if (isDone(puzzle)) return 'You spelled RAINBOW!';
  if (result === 'wrong') return `Not ${picked} yet. Try another letter!`;
  if (result === 'right') return `${WORD[puzzle.placed - 1]}! What comes next?`;
  return 'Put the letters in order to spell RAINBOW.';
}
