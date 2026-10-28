// Checks the Pick a level page.
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { loadPage } from './load-page.js';

const html = loadPage('levels.html');
const cards = [...html.matchAll(/<(?:button type="button"|a) class="level-card"(?: href="[^"]*")? data-level="(\d+)"( disabled)?>/g)];

describe('pick a level page', () => {
  it('has a title', () => {
    expect(html).toContain('<h1 class="page-title">Pick a level</h1>');
  });

  it('has a Back button to the title screen', () => {
    expect(html).toMatch(/<a class="round-button" href="\.\/index\.html" aria-label="Back[^"]*">/);
  });

  it('lists fifteen levels in order', () => {
    expect(cards.map((m) => m[1])).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15']);
  });

  it('has every level open, none locked', () => {
    expect(cards.map((m) => Boolean(m[2]))).toEqual(Array(15).fill(false));
    expect(html).not.toContain('unlock');
  });

  it.each([
    ['Paint a rainbow', 'paint-a-rainbow', 1],
    ['Bubble pop', 'bubble-pop', 2],
    ['Color sort', 'color-sort', 3],
    ['Rainbow garden', 'rainbow-garden', 4],
    ['Ice cream shop', 'ice-cream', 5],
    ['Sun and rain', 'sun-and-rain', 6],
    ['Rainbow road', 'rainbow-road', 7],
    ['I spy', 'i-spy', 8],
    ['Color order', 'color-order', 9],
    ['Memory rainbow', 'memory-rainbow', 10],
    ['Mix a color', 'mix-a-color', 11],
    ['What comes next?', 'patterns', 12],
    ['Fix the rainbow', 'fix-the-rainbow', 13],
    ['Word scramble', 'word-scramble', 14],
    ['Spot the difference', 'spot-the-difference', 15],
  ])('opens %s from its card', (name, page, level) => {
    expect(html).toContain(`<a class="level-card" href="./${page}.html" data-level="${level}">`);
  });

  it('gives every card its own picture, hidden from screen readers', () => {
    const pictures = [...document.querySelectorAll('.level-card svg.level-picture')];
    expect(pictures).toHaveLength(15);
    for (const svg of pictures) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
      expect(svg.children.length).toBeGreaterThan(0);
    }
    // Each card's picture is its own.
    expect(new Set(pictures.map((svg) => svg.innerHTML)).size).toBe(15);
  });

  it('shares the title screen stylesheet, tab icon and signature', () => {
    expect(html).toContain('<link rel="stylesheet" href="./styles.css" />');
    expect(html).toContain('<link rel="icon" href="./favicon.svg" type="image/svg+xml" />');
    expect(html).toContain('<footer class="signature">jsogge 2026</footer>');
  });
});
