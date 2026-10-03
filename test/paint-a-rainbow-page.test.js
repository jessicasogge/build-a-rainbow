// Plays Level 5, Paint a rainbow, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { PAINTS } from '../public/game/paint-a-rainbow.js';
import { start } from '../public/game/paint-a-rainbow-page.js';

const html = readFileSync(join(process.cwd(), 'public/paint-a-rainbow.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const stripes = () => [...document.querySelectorAll('.paint-stripe')];
const pickPaint = (id) => $(`.paint[data-paint="${id}"]`).click();
const hex = (id) => PAINTS.find((p) => p.id === id).hex;
const paintEvery = (id) => { pickPaint(id); for (const s of stripes()) s.dispatchEvent(new MouseEvent('click', { bubbles: true })); };

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

describe('paint a rainbow page', () => {
  it('is level 5 and starts with a blank rainbow and ten paints', () => {
    expect($('.level-title').textContent).toBe('Level 5 · Paint a rainbow');
    expect(stripes()).toHaveLength(6);
    expect(stripes().every((s) => s.getAttribute('fill') === '#ffffff')).toBe(true);
    expect(document.querySelectorAll('.paint')).toHaveLength(10);
    expect($('.paint[data-paint="red"]').getAttribute('aria-pressed')).toBe('true');
    expect($('#done').hidden).toBe(true);
  });

  it('presses the paint that is picked', () => {
    pickPaint('pink');
    expect($('.paint[data-paint="pink"]').getAttribute('aria-pressed')).toBe('true');
    expect($('.paint[data-paint="red"]').getAttribute('aria-pressed')).toBe('false');
  });

  it('paints a tapped stripe with the picked paint', () => {
    pickPaint('sky');
    stripes()[3].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(stripes()[3].getAttribute('fill')).toBe(hex('sky'));
    expect(stripes()[3].getAttribute('aria-label')).toBe('fourth stripe, sky blue');
    expect($('.helper-text').textContent).toBe('Pretty! Keep painting.');
  });

  it('paints with the keyboard too', () => {
    pickPaint('green');
    stripes()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(stripes()[0].getAttribute('fill')).toBe(hex('green'));
  });

  it('shows Done once every stripe is painted', () => {
    paintEvery('purple');
    expect($('#done').hidden).toBe(false);
    expect($('.helper-text').textContent).toBe('All painted! Tap Done when you love it.');
  });

  it('celebrates on Done and keeps the painting', () => {
    paintEvery('black');
    $('#done').click();
    expect($('.level-done').hidden).toBe(false);
    expect($('.palette').hidden).toBe(true);
    expect($('#done').hidden).toBe(true);
    expect(stripes().every((s) => s.getAttribute('fill') === hex('black'))).toBe(true);
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('does not change the painting after Done', () => {
    paintEvery('black');
    $('#done').click();
    pickPaint('pink');
    stripes()[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(stripes()[0].getAttribute('fill')).toBe(hex('black'));
  });

  it('starts a blank rainbow on Paint another', () => {
    paintEvery('pink');
    $('#done').click();
    $('.level-done [data-restart]').click();
    expect(stripes().every((s) => s.getAttribute('fill') === '#ffffff')).toBe(true);
    expect($('.level-done').hidden).toBe(true);
    expect($('.palette').hidden).toBe(false);
    expect(level.painting.brush).toBe('red');
  });
});
