// Level 8, Fix the rainbow: the stripes come jumbled. Tap one stripe, then
// another, to swap them, until every color is back in its place.
//
// This file is only the rules. It doesn't touch the page, so the tests can
// play it directly. fix-the-rainbow-page.js draws it and handles the taps.
import { COLORS } from './color-order.js';

const RIGHT_ORDER = COLORS.map((c) => c.id);

export function colorOf(id) {
  const found = COLORS.find((c) => c.id === id);
  if (!found) throw new Error(`No color called ${id}`);
  return found;
}

// A jumbled rainbow: `order` lists the color in each stripe, outside first.
// It's never already right. `random` is there so tests can pass their own.
export function newRainbow(random = Math.random) {
  let order;
  do {
    order = [...RIGHT_ORDER];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
  } while (isFixed({ order }));
  return { order, selected: null };
}

export function isInPlace(rainbow, i) {
  return rainbow.order[i] === RIGHT_ORDER[i];
}

export function inPlaceCount(rainbow) {
  return rainbow.order.filter((_, i) => isInPlace(rainbow, i)).length;
}

export function isFixed(rainbow) {
  return rainbow.order.every((id, i) => id === RIGHT_ORDER[i]);
}

// Tap stripe `i` (0 is the outside). Returns the new rainbow and what happened:
//   'picked'   – the first stripe of a swap is picked up
//   'dropped'  – the picked-up stripe was tapped again, so it's put back down
//   'swapped'  – the two stripes swapped places
//   'done'     – they swapped, and now the rainbow is fixed
//   'used'     – the rainbow is already fixed; nothing changes
export function tapStripe(rainbow, i) {
  if (i < 0 || i >= RIGHT_ORDER.length) throw new Error(`No stripe ${i}`);
  if (isFixed(rainbow)) return { rainbow, result: 'used' };
  if (rainbow.selected === null) return { rainbow: { ...rainbow, selected: i }, result: 'picked' };
  if (rainbow.selected === i) return { rainbow: { ...rainbow, selected: null }, result: 'dropped' };
  const order = [...rainbow.order];
  [order[rainbow.selected], order[i]] = [order[i], order[rainbow.selected]];
  const next = { order, selected: null };
  return { rainbow: next, result: isFixed(next) ? 'done' : 'swapped' };
}

// What the helper says. Short, so a new reader can manage it.
export function message(rainbow, result) {
  if (isFixed(rainbow)) return 'You fixed the rainbow!';
  if (rainbow.selected !== null) {
    return `${colorOf(rainbow.order[rainbow.selected]).name}! Now tap the stripe to swap it with.`;
  }
  if (result === 'swapped') {
    const n = inPlaceCount(rainbow);
    return `Swapped! ${n} of ${RIGHT_ORDER.length} stripes are in the right place.`;
  }
  return 'Oh no, the colors are mixed up! Tap two stripes to swap them.';
}
