// Checks the opening screen has what it needs.
import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const file = (name) => new URL(`../public/${name}`, import.meta.url);
const html = readFileSync(file('index.html'), 'utf8');

describe('title screen', () => {
  it('has the game name', () => {
    expect(html).toContain('<h1 class="logo">Build a Rainbow</h1>');
  });

  it('draws six stripes, red on the outside to purple on the inside', () => {
    const fills = [...html.matchAll(/class="stripe"[^>]*fill="(#[0-9A-F]{6})"/g)].map((m) => m[1]);
    expect(fills).toEqual(['#E5383B', '#F77F00', '#FCBF49', '#43AA8B', '#277DA1', '#7B4FA0']);
  });

  it('has Play and Levels buttons', () => {
    expect(html).toMatch(/<button[^>]*id="play"/);
    expect(html).toMatch(/<button[^>]*id="levels"/);
  });

  it('is signed at the foot', () => {
    expect(html).toContain('<footer class="signature">jsogge 2026</footer>');
  });

  it('has the tab icon and the fonts it loads', () => {
    expect(existsSync(file('favicon.svg'))).toBe(true);
    expect(existsSync(file('fonts/fredoka-700.woff2'))).toBe(true);
    expect(existsSync(file('fonts/nunito-700.woff2'))).toBe(true);
  });
});
