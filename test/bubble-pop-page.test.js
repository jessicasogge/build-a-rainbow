// Plays Level 11, Bubble pop, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POPS } from '../public/game/bubble-pop.js';
import { MAX_BUBBLES, SPAWN_EVERY, start } from '../public/game/bubble-pop-page.js';

const html = readFileSync(join(process.cwd(), 'public/bubble-pop.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const bubbles = () => [...document.querySelectorAll('.bubble:not(.is-popped)')];
const called = () => level.game.targets[level.game.round];
const rightBubble = () => bubbles().find((b) => b.dataset.color === called());
const wrongBubble = () => bubbles().find((b) => b.dataset.color !== called());
const filled = () => document.querySelectorAll('.pop-count .is-filled').length;

// Pops bubbles of the color called, waiting for more to float in as needed.
function popColor(n) {
  for (let i = 0; i < n; i++) {
    while (!rightBubble()) vi.advanceTimersByTime(SPAWN_EVERY);
    rightBubble().click();
  }
}

beforeEach(() => {
  vi.useFakeTimers();
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('bubble pop page', () => {
  it('is level 11, with bubbles already floating and one of them the color called', () => {
    expect($('.level-title').textContent).toBe('Level 11 · Bubble pop');
    expect($('.progress-pill').textContent).toBe('Color 1 of 3');
    expect(bubbles().length).toBeGreaterThan(0);
    expect(rightBubble()).toBeTruthy();
    expect(document.querySelectorAll('.pop-count span')).toHaveLength(POPS);
    expect($('.helper-text').textContent).toMatch(/^Pop the \w+ bubbles!$/);
  });

  it('floats in more bubbles, but never too many', () => {
    vi.advanceTimersByTime(SPAWN_EVERY * 30);
    expect(bubbles().length).toBeGreaterThan(0);
    expect(bubbles().length).toBeLessThanOrEqual(MAX_BUBBLES);
  });

  it('labels each bubble with its color for screen readers', () => {
    const bubble = bubbles()[0];
    expect(bubble.getAttribute('aria-label')).toMatch(/^[A-Z][a-z]+ bubble$/);
  });

  it('colors the helper face the color called', () => {
    const face = $('.helper').style;
    expect(face.getPropertyValue('--face')).toBe($('.pop-count').style.getPropertyValue('--target'));
    expect(face.getPropertyValue('--face-ink')).toBe(called() === 'yellow' ? 'var(--ink)' : '#ffffff');
    popColor(POPS);
    expect(face.getPropertyValue('--face')).toBe($('.pop-count').style.getPropertyValue('--target'));
  });

  it('pops a bubble of the color called and fills a dot', () => {
    const bubble = rightBubble();
    bubble.click();
    expect(bubble.classList.contains('is-popped')).toBe(true);
    expect(filled()).toBe(1);
    expect($('.helper-text').textContent).toMatch(/^Pop! 4 more/);
    vi.advanceTimersByTime(400);
    expect(bubble.isConnected).toBe(false);
  });

  it('boings a bubble of another color', () => {
    while (!wrongBubble()) vi.advanceTimersByTime(SPAWN_EVERY);
    const bubble = wrongBubble();
    bubble.click();
    expect(bubble.classList.contains('is-popped')).toBe(false);
    expect(bubble.querySelector('.bubble-ball').classList.contains('is-wrong')).toBe(true);
    expect(filled()).toBe(0);
    expect($('.helper-text').textContent).toMatch(/^That one is /);
  });

  it('calls the next color after five pops', () => {
    const first = called();
    popColor(POPS);
    expect(called()).not.toBe(first);
    expect($('.progress-pill').textContent).toBe('Color 2 of 3');
    expect(filled()).toBe(0);
  });

  it('celebrates after three colors, and stops the bubbles', () => {
    popColor(POPS * 3);
    expect($('.level-done').hidden).toBe(false);
    expect($('.bubble-sky').hidden).toBe(true);
    expect($('rainbow-stripes').hidden).toBe(false);
    expect($('.level-done a.button-play').textContent).toBe('All levels');
    expect(document.activeElement).toBe($('.level-done h2'));
    vi.advanceTimersByTime(SPAWN_EVERY * 5);
    expect(document.querySelectorAll('.bubble')).toHaveLength(0);
  });

  it('starts over on Play again', () => {
    popColor(POPS * 3);
    $('.level-done [data-restart]').click();
    expect(level.game.round).toBe(0);
    expect($('.bubble-sky').hidden).toBe(false);
    expect(bubbles().length).toBeGreaterThan(0);
    expect($('.level-done').hidden).toBe(true);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
