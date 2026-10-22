// Plays Level 8, Memory rainbow, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { COLOR_IDS } from '../public/game/colors.js';
import { HIDE_AFTER, start } from '../public/game/memory-rainbow-page.js';

const html = readFileSync(join(process.cwd(), 'public/memory-rainbow.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const cards = () => [...document.querySelectorAll('.memory-card')];
const ofColor = (color) => cards().filter((c) => c.dataset.color === color);
const notColor = (color) => cards().find((c) => c.dataset.color !== color);
const upCount = () => cards().filter((c) => c.classList.contains('is-up')).length;
const findPair = (color) => ofColor(color).forEach((c) => c.click());

beforeEach(() => {
  vi.useFakeTimers();
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('memory rainbow page', () => {
  it('is level 8, with twelve cards face down', () => {
    expect($('.level-title').textContent).toBe('Level 8 · Memory rainbow');
    expect($('.progress-pill').textContent).toBe('0 of 6 pairs');
    expect(cards()).toHaveLength(12);
    expect(upCount()).toBe(0);
    expect(cards()[0].getAttribute('aria-label')).toBe('Card 1, face down');
    expect($('.helper-text').textContent).toBe('Turn over two cards to find a matching pair.');
    expect($('.level-done').hidden).toBe(true);
  });

  it('turns a card over when it is tapped', () => {
    const [red] = ofColor('red');
    red.click();
    expect(red.classList.contains('is-up')).toBe(true);
    expect(red.getAttribute('aria-label')).toMatch(/, red$/);
    expect($('.helper-text').textContent).toBe('Red! Where is the other one?');
  });

  it('keeps a pair face up and counts it', () => {
    findPair('red');
    for (const card of ofColor('red')) {
      expect(card.classList.contains('is-matched')).toBe(true);
      expect(card.disabled).toBe(true);
    }
    expect($('.progress-pill').textContent).toBe('1 of 6 pairs');
    expect($('.helper-text').textContent).toBe('Two red cards. A match!');
  });

  it('turns two cards that do not match back over after a moment', () => {
    const [red] = ofColor('red');
    const other = notColor('red');
    red.click();
    other.click();
    expect(upCount()).toBe(2);
    expect(other.classList.contains('is-wrong')).toBe(true);
    expect($('.helper-text').textContent).toMatch(/^Red and .+ don't match\. Try again!$/);
    vi.advanceTimersByTime(HIDE_AFTER);
    expect(upCount()).toBe(0);
  });

  it('lets a quick player tap the next card without waiting', () => {
    const [red] = ofColor('red');
    const other = notColor('red');
    red.click();
    other.click();
    const third = cards().find((c) => c !== red && c !== other);
    third.click();
    expect(upCount()).toBe(1);
    expect(third.classList.contains('is-up')).toBe(true);
    vi.advanceTimersByTime(HIDE_AFTER);
    expect(third.classList.contains('is-up')).toBe(true); // the old timer doesn't hide it
  });

  it('celebrates when every pair is found', () => {
    COLOR_IDS.forEach(findPair);
    expect($('.progress-pill').textContent).toBe('6 of 6 pairs');
    expect($('.level-done').hidden).toBe(false);
    expect($('.helper').hidden).toBe(true);
    expect($('.memory-grid').hidden).toBe(true);
    expect($('rainbow-stripes').hidden).toBe(false);
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('deals a fresh set of cards on Play again', () => {
    COLOR_IDS.forEach(findPair);
    $('.level-done [data-restart]').click();
    expect(level.game.matched).toEqual([]);
    expect(upCount()).toBe(0);
    expect($('.progress-pill').textContent).toBe('0 of 6 pairs');
    expect($('.memory-grid').hidden).toBe(false);
    expect($('rainbow-stripes').hidden).toBe(true);
    expect($('.level-done').hidden).toBe(true);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
