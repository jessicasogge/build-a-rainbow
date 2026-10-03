// Checks the Pick a level page.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../public/levels.html', import.meta.url), 'utf8');
const cards = [...html.matchAll(/<(?:button type="button"|a) class="level-card"(?: href="[^"]*")? data-level="(\d)"( disabled)?>/g)];

describe('pick a level page', () => {
  it('has a title', () => {
    expect(html).toContain('<h1 class="page-title">Pick a level</h1>');
  });

  it('has a Back button to the title screen', () => {
    expect(html).toMatch(/<a class="round-button" href="\.\/index\.html" aria-label="Back[^"]*">/);
  });

  it('lists four levels in order', () => {
    expect(cards.map((m) => m[1])).toEqual(['1', '2', '3', '4']);
  });

  it('has every level open, none locked', () => {
    expect(cards.map((m) => Boolean(m[2]))).toEqual([false, false, false, false]);
    expect(html).not.toContain('unlock');
  });

  it('opens Color order from the level 1 card', () => {
    expect(html).toContain('<a class="level-card" href="./color-order.html" data-level="1">');
  });

  it('puts a little six-stripe rainbow on every card, hidden from screen readers', () => {
    const minis = [...html.matchAll(/<svg class="mini-rainbow"[^>]*aria-hidden="true">([\s\S]*?)<\/svg>/g)];
    expect(minis).toHaveLength(4);
    for (const [, inner] of minis) expect(inner.match(/<path/g)).toHaveLength(6);
  });

  it('shares the title screen stylesheet, tab icon and signature', () => {
    expect(html).toContain('<link rel="stylesheet" href="./styles.css" />');
    expect(html).toContain('<link rel="icon" href="./favicon.svg" type="image/svg+xml" />');
    expect(html).toContain('<footer class="signature">jsogge 2026</footer>');
  });
});
