// Level 5, Paint a rainbow: pick any paint and tap a stripe to paint it.
// There are no wrong colors. Once every stripe has paint, you can say
// you're done.
//
// This file is only the rules. It doesn't touch the page, so the tests can
// play it directly. paint-a-rainbow-page.js draws it and handles the taps.
import { COLORS, PINK } from './colors.js';

// The six rainbow colors, plus a few extras for painting.
export const PAINTS = [
  ...COLORS,
  PINK,
  { id: 'sky', name: 'Sky blue', hex: '#8ECAE6' },
  { id: 'brown', name: 'Brown', hex: '#8B5E3C' },
  { id: 'black', name: 'Black', hex: '#1B2A4A' },
];

export const STRIPE_COUNT = 6;

export function paintColor(id) {
  const found = PAINTS.find((p) => p.id === id);
  if (!found) throw new Error(`No paint called ${id}`);
  return found;
}

// A blank rainbow, with red on the brush to start.
export function newPainting() {
  return { stripes: Array(STRIPE_COUNT).fill(null), brush: 'red' };
}

// Put a different paint on the brush.
export function chooseBrush(painting, id) {
  paintColor(id);
  return { ...painting, brush: id };
}

// Paint one stripe (0 is the outside) with whatever is on the brush.
export function paintStripe(painting, index) {
  if (index < 0 || index >= STRIPE_COUNT) throw new Error(`No stripe ${index}`);
  const stripes = [...painting.stripes];
  stripes[index] = painting.brush;
  return { ...painting, stripes };
}

export function isFinished(painting) {
  return painting.stripes.every(Boolean);
}

// What the helper says. Short, so a new reader can manage it.
export function message(painting) {
  if (isFinished(painting)) return 'All painted! Tap Done when you love it.';
  if (painting.stripes.some(Boolean)) return 'Pretty! Keep painting.';
  return 'Pick a color, then tap a stripe to paint it.';
}
