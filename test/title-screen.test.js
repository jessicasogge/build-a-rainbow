// Checks the opening screen has what it needs.
// @vitest-environment jsdom
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { COLORS } from '../public/game/colors.js';
import { loadPage } from './load-page.js';

const file = (name) => join(process.cwd(), 'public', name);
let html;
beforeEach(() => {
  html = loadPage('index.html');
});

describe('title screen', () => {
  it('has the game name', () => {
    expect(html).toContain('<h1 class="logo">Build a Rainbow</h1>');
  });

  it('draws six stripes, red on the outside to purple on the inside', () => {
    const svg = document.querySelector('svg.rainbow');
    expect(svg.getAttribute('aria-label')).toBe('A rainbow');
    const fills = [...svg.querySelectorAll('path.stripe')].map((p) => p.getAttribute('fill'));
    expect(fills).toEqual(COLORS.map((c) => c.hex));
  });

  it('says what the game is about', () => {
    expect(document.querySelector('.tagline').textContent).toBe('Mix, build and play with rainbow colors!');
  });

  it('has a Play button that opens the level picker', () => {
    expect(html).toMatch(/<a class="button button-play" id="play" href="\.\/levels\.html">/);
  });

  it('has no separate Levels button', () => {
    expect(html).not.toContain('id="levels"');
    expect(html.match(/class="button /g)).toHaveLength(1);
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
