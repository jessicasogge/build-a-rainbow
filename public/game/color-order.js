// Level 2, Color order: tap the colors in rainbow order, red first, and each
// one fills in the next stripe.
//
// This file is only the rules. It doesn't touch the page, so the tests can
// play it directly. color-order-page.js draws it and handles the taps.

// The six stripes, outside to inside. Indigo is left out, the usual
// simplification for young kids.
export const COLORS = [
  { id: 'red', name: 'Red', hex: '#E5383B' },
  { id: 'orange', name: 'Orange', hex: '#F77F00' },
  { id: 'yellow', name: 'Yellow', hex: '#FCBF49' },
  { id: 'green', name: 'Green', hex: '#43AA8B' },
  { id: 'blue', name: 'Blue', hex: '#277DA1' },
  { id: 'purple', name: 'Purple', hex: '#7B4FA0' },
];

// The colors in a random order for the tray, so the right answer isn't just
// left to right. Never returns them already in rainbow order. `random` is
// there so tests can pass their own.
export function shuffledColors(random = Math.random) {
  let order;
  do {
    order = [...COLORS];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  } while (order.every((color, i) => color.id === COLORS[i].id));
  return order;
}

// A new game. `filled` is how many stripes start already in place: Color
// order starts with red done (1) to show how it works; Memory rainbow starts
// empty (0).
export function newGame(filled = 0) {
  return { filled };
}

// How many stripes are in, and the color that goes next (null when done).
export function nextColor(game) {
  return COLORS[game.filled] ?? null;
}

export function isDone(game) {
  return game.filled >= COLORS.length;
}

// Tap a color. Returns the new game and what happened:
//   'right' – it was the next stripe, and it's filled in
//   'done'  – it was the last stripe; the rainbow is finished
//   'wrong' – not that one yet; nothing changes
//   'used'  – that color is already in the rainbow; nothing changes
export function pick(game, id) {
  if (isDone(game)) return { game, result: 'used' };
  const index = COLORS.findIndex((color) => color.id === id);
  if (index === -1) throw new Error(`No color called ${id}`);
  if (index < game.filled) return { game, result: 'used' };
  if (index !== game.filled) return { game, result: 'wrong' };
  const next = { filled: game.filled + 1 };
  return { game: next, result: isDone(next) ? 'done' : 'right' };
}

// What the helper says. Short, so a new reader can manage it.
export function message(game, result) {
  if (result === 'done' || isDone(game)) return 'You did it! Every color is in place.';
  if (result === 'wrong') return 'Not that one yet. Try another color!';
  if (result === 'right') return `${COLORS[game.filled - 1].name}! What comes next?`;
  if (game.filled === 0) return 'Which color goes on top?';
  if (game.filled === 1) return 'Red goes on top. Which color comes next?';
  return 'Which color comes next?';
}
