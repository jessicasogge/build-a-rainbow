// The helpers the level pages share: wiggle and tap.
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { ORDINALS, onTap, wiggle } from '../public/game/page-helpers.js';

describe('wiggle', () => {
  it('adds the wiggle class, even if it was already there', () => {
    const el = document.createElement('button');
    wiggle(el);
    expect(el.classList.contains('is-wrong')).toBe(true);
    wiggle(el);
    expect(el.classList.contains('is-wrong')).toBe(true);
  });
});

describe('onTap', () => {
  it('runs on a click, Enter or Space, but not other keys', () => {
    const el = document.createElement('div');
    let taps = 0;
    onTap(el, () => taps++);
    el.dispatchEvent(new MouseEvent('click'));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    el.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }));
    expect(taps).toBe(3);
  });
});

it('names six stripes', () => {
  expect(ORDINALS).toHaveLength(6);
});
