// Checks the Pick a level page.
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { loadPage } from './load-page.js';

const html = loadPage('levels.html');
const cards = [...html.matchAll(/<(?:button type="button"|a) class="level-card"(?: href="[^"]*")? data-level="(\d)"( disabled)?>/g)];

describe('pick a level page', () => {
  it('has a title', () => {
    expect(html).toContain('<h1 class="page-title">Pick a level</h1>');
  });

  it('has a Back button to the title screen', () => {
    expect(html).toMatch(/<a class="round-button" href="\.\/index\.html" aria-label="Back[^"]*">/);
  });

  it('lists eight levels in order', () => {
    expect(cards.map((m) => m[1])).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
  });

  it('has every level open, none locked', () => {
    expect(cards.map((m) => Boolean(m[2]))).toEqual([false, false, false, false, false, false, false, false]);
    expect(html).not.toContain('unlock');
  });

  it('opens Mix a color from the level 1 card', () => {
    expect(html).toContain('<a class="level-card" href="./mix-a-color.html" data-level="1">');
  });

  it('opens Color order from the level 2 card', () => {
    expect(html).toContain('<a class="level-card" href="./color-order.html" data-level="2">');
  });

  it('opens Memory rainbow from the level 3 card', () => {
    expect(html).toContain('<a class="level-card" href="./memory-rainbow.html" data-level="3">');
  });

  it('opens Sun and rain from the level 4 card', () => {
    expect(html).toContain('<a class="level-card" href="./sun-and-rain.html" data-level="4">');
  });

  it('opens Paint a rainbow from the level 5 card', () => {
    expect(html).toContain('<a class="level-card" href="./paint-a-rainbow.html" data-level="5">');
  });

  it('opens Rainbow road from the level 6 card', () => {
    expect(html).toContain('<a class="level-card" href="./rainbow-road.html" data-level="6">');
  });

  it('opens Word scramble from the level 7 card', () => {
    expect(html).toContain('<a class="level-card" href="./word-scramble.html" data-level="7">');
  });

  it('opens Fix the rainbow from the level 8 card', () => {
    expect(html).toContain('<a class="level-card" href="./fix-the-rainbow.html" data-level="8">');
  });

  it('gives every card its own picture, hidden from screen readers', () => {
    const pictures = [...document.querySelectorAll('.level-card svg.level-picture')];
    expect(pictures).toHaveLength(8);
    for (const svg of pictures) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.children.length).toBeGreaterThan(0);
    }
    // Each card's picture is its own.
    expect(new Set(pictures.map((svg) => svg.innerHTML)).size).toBe(8);
  });

  it('shares the title screen stylesheet, tab icon and signature', () => {
    expect(html).toContain('<link rel="stylesheet" href="./styles.css" />');
    expect(html).toContain('<link rel="icon" href="./favicon.svg" type="image/svg+xml" />');
    expect(html).toContain('<footer class="signature">jsogge 2026</footer>');
  });
});
