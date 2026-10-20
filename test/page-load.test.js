// Checks pages load without flashing unstyled text: both fonts are fetched
// early, and the page stays hidden until the shared pieces are filled in.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const publicDir = join(process.cwd(), 'public');
const read = (name) => readFileSync(join(publicDir, name), 'utf8');
// Google Search Console's ownership file isn't a page of the game.
const pages = readdirSync(publicDir).filter((f) => f.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(f)).sort();

describe.each(pages)('%s', (page) => {
  it('fetches both fonts early', () => {
    const html = read(page);
    for (const font of ['fredoka-700', 'nunito-700']) {
      expect(html).toContain(`<link rel="preload" href="./fonts/${font}.woff2" as="font" type="font/woff2" crossorigin />`);
    }
  });
});

describe('styles.css', () => {
  it('keeps the page hidden until every shared piece is filled in', () => {
    const pieces = [...read('game/components.js').matchAll(/^define\('([a-z-]+)'/gm)].map((m) => m[1]);
    expect(pieces.length).toBeGreaterThan(0);
    const rule = read('styles.css').match(/body:has\(:is\(([^)]*)\):not\(:defined\)\)/);
    expect(rule).not.toBeNull();
    expect(rule[1].split(',').map((s) => s.trim()).sort()).toEqual([...pieces].sort());
  });

  it('shows the page anyway if the scripts never load', () => {
    expect(read('styles.css')).toMatch(/animation: show-anyway 0s 3s forwards;/);
  });
});
