// Checks the Pick a level page.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const html = readFileSync(new URL('../public/levels.html', import.meta.url), 'utf8');
const cards = [...html.matchAll(/<button type="button" class="level-card" data-level="(\d)"( disabled)?>/g)];

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

  it('has levels 1 and 2 open and levels 3 and 4 locked', () => {
    expect(cards.map((m) => Boolean(m[2]))).toEqual([false, false, true, true]);
  });

  it('shares the title screen stylesheet, tab icon and signature', () => {
    expect(html).toContain('<link rel="stylesheet" href="./styles.css" />');
    expect(html).toContain('<link rel="icon" href="./favicon.svg" type="image/svg+xml" />');
    expect(html).toContain('<footer class="signature">jsogge 2026</footer>');
  });
});
