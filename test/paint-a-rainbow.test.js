// The rules of Level 5, Paint a rainbow.
import { describe, expect, it } from 'vitest';
import { COLORS } from '../public/game/color-order.js';
import { PAINTS, STRIPE_COUNT, chooseBrush, isFinished, message, newPainting, paintStripe } from '../public/game/paint-a-rainbow.js';

const paintAll = (painting, id) =>
  Array.from({ length: STRIPE_COUNT }, (_, i) => i).reduce((p, i) => paintStripe(p, i), chooseBrush(painting, id));

describe('paints', () => {
  it('are the rainbow colors plus pink, sky blue, brown and black', () => {
    expect(PAINTS.map((p) => p.id)).toEqual([...COLORS.map((c) => c.id), 'pink', 'sky', 'brown', 'black']);
  });

  it('each have a name and a color', () => {
    for (const p of PAINTS) {
      expect(p.name).toBeTruthy();
      expect(p.hex).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});

describe('painting', () => {
  it('starts blank, with red on the brush', () => {
    expect(newPainting()).toEqual({ stripes: [null, null, null, null, null, null], brush: 'red' });
  });

  it('paints a stripe with the paint on the brush', () => {
    const p = paintStripe(chooseBrush(newPainting(), 'pink'), 2);
    expect(p.stripes).toEqual([null, null, 'pink', null, null, null]);
  });

  it('lets a stripe be painted over', () => {
    let p = paintStripe(newPainting(), 0);
    p = paintStripe(chooseBrush(p, 'black'), 0);
    expect(p.stripes[0]).toBe('black');
  });

  it('allows any colors, in any order, even all the same', () => {
    const p = paintAll(newPainting(), 'brown');
    expect(p.stripes).toEqual(Array(STRIPE_COUNT).fill('brown'));
    expect(isFinished(p)).toBe(true);
  });

  it('is not finished while a stripe is blank', () => {
    let p = newPainting();
    for (let i = 0; i < STRIPE_COUNT - 1; i++) p = paintStripe(p, i);
    expect(isFinished(p)).toBe(false);
  });

  it('refuses paints and stripes that do not exist', () => {
    expect(() => chooseBrush(newPainting(), 'gold')).toThrow();
    expect(() => paintStripe(newPainting(), 6)).toThrow();
  });
});

describe('message', () => {
  it('explains how to paint', () => {
    expect(message(newPainting())).toBe('Pick a color, then tap a stripe to paint it.');
  });

  it('cheers on a painting in progress', () => {
    expect(message(paintStripe(newPainting(), 0))).toBe('Pretty! Keep painting.');
  });

  it('says to tap Done once every stripe is painted', () => {
    expect(message(paintAll(newPainting(), 'sky'))).toBe('All painted! Tap Done when you love it.');
  });
});
