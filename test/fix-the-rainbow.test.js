// The rules of Level 8, Fix the rainbow.
import { describe, expect, it } from 'vitest';
import { COLORS } from '../public/game/color-order.js';
import { inPlaceCount, isFixed, isInPlace, message, newRainbow, tapStripe } from '../public/game/fix-the-rainbow.js';

const ids = COLORS.map((c) => c.id);
const tap = (r, ...stripes) => stripes.reduce((acc, i) => tapStripe(acc.rainbow, i), { rainbow: r });

// Fixes a rainbow the simple way: put the right color in each stripe in turn.
function solve(rainbow) {
  let r = rainbow;
  const results = [];
  for (let i = 0; i < ids.length; i++) {
    if (isInPlace(r, i)) continue;
    const j = r.order.indexOf(ids[i]);
    const turn = tap(r, i, j);
    r = turn.rainbow;
    results.push(turn.result);
  }
  return { rainbow: r, results };
}

describe('newRainbow', () => {
  it('has every color once, jumbled, with nothing picked up', () => {
    const r = newRainbow();
    expect([...r.order].sort()).toEqual([...ids].sort());
    expect(isFixed(r)).toBe(false);
    expect(r.selected).toBeNull();
  });

  it('never comes out already fixed', () => {
    // Math.random() always 0.99 leaves the stripes in order, so it must try again.
    let calls = 0;
    const random = () => (calls++ < 5 ? 0.99 : 0);
    expect(isFixed(newRainbow(random))).toBe(false);
  });
});

describe('tapStripe', () => {
  const jumbled = { order: ['orange', 'red', 'yellow', 'green', 'blue', 'purple'], selected: null };

  it('picks up the first stripe tapped', () => {
    const { rainbow, result } = tapStripe(jumbled, 0);
    expect(result).toBe('picked');
    expect(rainbow.selected).toBe(0);
  });

  it('puts it back down if it is tapped again', () => {
    const { rainbow, result } = tap(jumbled, 0, 0);
    expect(result).toBe('dropped');
    expect(rainbow.selected).toBeNull();
    expect(rainbow.order).toEqual(jumbled.order);
  });

  it('swaps two stripes', () => {
    const { rainbow, result } = tap(jumbled, 2, 4);
    expect(result).toBe('swapped');
    expect(rainbow.order).toEqual(['orange', 'red', 'blue', 'green', 'yellow', 'purple']);
    expect(rainbow.selected).toBeNull();
  });

  it('is done when the last swap fixes it', () => {
    const { rainbow, result } = tap(jumbled, 0, 1);
    expect(result).toBe('done');
    expect(isFixed(rainbow)).toBe(true);
    expect(tapStripe(rainbow, 3).result).toBe('used');
  });

  it('can always be fixed', () => {
    for (let n = 0; n < 20; n++) {
      const { rainbow, results } = solve(newRainbow());
      expect(isFixed(rainbow)).toBe(true);
      expect(results.at(-1)).toBe('done');
    }
  });

  it('refuses a stripe that does not exist', () => {
    expect(() => tapStripe(jumbled, 6)).toThrow();
  });
});

describe('inPlaceCount', () => {
  it('counts the stripes in the right place', () => {
    expect(inPlaceCount({ order: ['orange', 'red', 'yellow', 'green', 'blue', 'purple'] })).toBe(4);
    expect(inPlaceCount({ order: [...ids] })).toBe(6);
  });
});

describe('message', () => {
  const jumbled = { order: ['orange', 'red', 'yellow', 'green', 'purple', 'blue'], selected: null };

  it('explains how to fix it', () => {
    expect(message(jumbled)).toBe('Oh no, the colors are mixed up! Tap two stripes to swap them.');
  });

  it('names the picked-up stripe', () => {
    const { rainbow, result } = tapStripe(jumbled, 4);
    expect(message(rainbow, result)).toBe('Purple! Now tap the stripe to swap it with.');
  });

  it('counts the stripes in place after a swap', () => {
    const { rainbow, result } = tap(jumbled, 4, 5);
    expect(message(rainbow, result)).toBe('Swapped! 4 of 6 stripes are in the right place.');
  });

  it('celebrates the fixed rainbow', () => {
    expect(message({ order: [...ids], selected: null })).toBe('You fixed the rainbow!');
  });
});
