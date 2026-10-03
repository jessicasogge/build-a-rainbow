// Checks every page has what search engines read, and that the sitemap lists
// every page, so a new level can't be left out by mistake.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SITE = 'https://jessicasogge.github.io/build-a-rainbow/';
const publicDir = join(process.cwd(), 'public');
const pages = readdirSync(publicDir).filter((f) => f.endsWith('.html')).sort();
const read = (name) => readFileSync(join(publicDir, name), 'utf8');
const addressOf = (page) => (page === 'index.html' ? SITE : SITE + page);

describe.each(pages)('%s', (page) => {
  const html = read(page);

  it('has a title naming the game', () => {
    expect(html).toMatch(/<title>[^<]*Build a Rainbow[^<]*<\/title>/);
  });

  it('has a description', () => {
    const description = html.match(/<meta name="description" content="([^"]+)" \/>/)?.[1];
    expect(description?.length).toBeGreaterThan(40);
  });

  it('gives its one official address', () => {
    expect(html).toContain(`<link rel="canonical" href="${addressOf(page)}" />`);
  });
});

describe('sitemap', () => {
  it('lists every page, and nothing else', () => {
    const listed = [...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect([...listed].sort()).toEqual(pages.map(addressOf).sort());
  });
});
