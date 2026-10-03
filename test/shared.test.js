// The shared pieces every level uses: the rainbow colors and the shuffle.
import { describe, expect, it } from 'vitest';
import { COLORS, COLOR_IDS, PINK, colorById } from '../public/game/colors.js';
import { sameOrder, shuffle, shuffleUntil } from '../public/game/shuffle.js';

describe('colors', () => {
  it('are the six rainbow stripes, outside to inside', () => {
    expect(COLOR_IDS).toEqual(['red', 'orange', 'yellow', 'green', 'blue', 'purple']);
  });

  it('each have a name and a color code', () => {
    for (const c of [...COLORS, PINK]) {
      expect(c.name).toBeTruthy();
      expect(c.hex).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('can be looked up by id, and refuse ids that do not exist', () => {
    expect(colorById('blue').name).toBe('Blue');
    expect(() => colorById('gold')).toThrow();
  });
});

describe('shuffle', () => {
  it('keeps every item, and leaves the original alone', () => {
    const list = [1, 2, 3, 4, 5];
    const out = shuffle(list);
    expect([...out].sort()).toEqual(list);
    expect(list).toEqual([1, 2, 3, 4, 5]);
  });

  it('gives the same order for the same random numbers', () => {
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual([2, 3, 4, 1]);
    expect(shuffle([1, 2, 3, 4], () => 0.99)).toEqual([1, 2, 3, 4]);
  });

  it('shuffleUntil tries again while the order is too easy', () => {
    let calls = 0;
    const random = () => (calls++ < 3 ? 0.99 : 0);
    const out = shuffleUntil([1, 2, 3, 4], random, (order) => sameOrder(order, [1, 2, 3, 4]));
    expect(out).not.toEqual([1, 2, 3, 4]);
  });

  it('sameOrder compares lists item by item', () => {
    expect(sameOrder([1, 2], [1, 2])).toBe(true);
    expect(sameOrder([1, 2], [2, 1])).toBe(false);
    expect(sameOrder([1], [1, 2])).toBe(false);
  });
});
