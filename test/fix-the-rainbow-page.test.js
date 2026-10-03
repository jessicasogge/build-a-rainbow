// Plays Level 8, Fix the rainbow, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { COLORS } from '../public/game/colors.js';
import { start } from '../public/game/fix-the-rainbow-page.js';

const html = readFileSync(join(process.cwd(), 'public/fix-the-rainbow.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const stripes = () => [...document.querySelectorAll('.fix-stripe')];
const tap = (i) => stripes()[i].dispatchEvent(new MouseEvent('click', { bubbles: true }));
const fills = () => stripes().map((s) => s.getAttribute('fill'));
const hexOf = (id) => COLORS.find((c) => c.id === id).hex;

// Fix the rainbow on the page: put the right color in each stripe in turn.
function fixIt() {
  COLORS.forEach((color, i) => {
    const j = level.rainbow.order.indexOf(color.id);
    if (j !== i) { tap(i); tap(j); }
  });
}

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

describe('fix the rainbow page', () => {
  it('is level 8 and starts with a jumbled rainbow', () => {
    expect($('.level-title').textContent).toBe('Level 8 · Fix the rainbow');
    expect(fills()).toEqual(level.rainbow.order.map(hexOf));
    expect(fills()).not.toEqual(COLORS.map((c) => c.hex));
    expect($('.helper-text').textContent).toBe('Oh no, the colors are mixed up! Tap two stripes to swap them.');
  });

  it('picks up a tapped stripe', () => {
    tap(2);
    expect(stripes()[2].classList.contains('is-selected')).toBe(true);
    expect(stripes()[2].getAttribute('aria-pressed')).toBe('true');
    expect($('.fix-highlight').hasAttribute('hidden')).toBe(false);
    expect($('.fix-highlight').getAttribute('d')).toBe(stripes()[2].getAttribute('d'));
    expect($('.helper-text').textContent).toMatch(/^\w+! Now tap the stripe to swap it with\.$/);
  });

  it('swaps two tapped stripes', () => {
    // With random() always 0, the jumble is orange, yellow, green, blue, purple, red.
    document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
    level = start(document, { random: () => 0 });
    expect(level.rainbow.order).toEqual(['orange', 'yellow', 'green', 'blue', 'purple', 'red']);
    tap(0);
    tap(5);
    expect(fills()).toEqual(['red', 'yellow', 'green', 'blue', 'purple', 'orange'].map(hexOf));
    expect(stripes().some((s) => s.classList.contains('is-selected'))).toBe(false);
    expect($('.helper-text').textContent).toBe('Swapped! 1 of 6 stripes are in the right place.');
    expect($('.fix-highlight').hasAttribute('hidden')).toBe(true);
  });

  it('labels each stripe with its place and color', () => {
    const name = COLORS.find((c) => c.id === level.rainbow.order[3]).name.toLowerCase();
    expect(stripes()[3].getAttribute('aria-label')).toBe(`fourth stripe, ${name}`);
  });

  it('works with the keyboard too', () => {
    stripes()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(stripes()[1].classList.contains('is-selected')).toBe(true);
  });

  it('celebrates the fixed rainbow', () => {
    fixIt();
    expect(fills()).toEqual(COLORS.map((c) => c.hex));
    expect($('.fix-rainbow').classList.contains('is-fixed')).toBe(true);
    expect($('.level-done').hidden).toBe(false);
    expect($('.helper').hidden).toBe(true);
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('jumbles a new rainbow on Play again', () => {
    fixIt();
    $('.level-done [data-restart]').click();
    expect(fills()).not.toEqual(COLORS.map((c) => c.hex));
    expect($('.level-done').hidden).toBe(true);
  });
});
