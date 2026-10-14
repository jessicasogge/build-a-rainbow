// Checks every page counts its visits, so the numbers show which levels kids
// play and where they stop.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const publicDir = join(process.cwd(), 'public');
// Google Search Console's ownership file isn't a page of the game.
const pages = readdirSync(publicDir).filter((f) => f.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(f)).sort();

const COUNTER = `<script data-goatcounter="https://petripals.goatcounter.com/count"
      async src="https://gc.zgo.at/count.js">
    </script>`;

describe.each(pages)('%s', (page) => {
  it('counts visits, once', () => {
    const html = readFileSync(join(publicDir, page), 'utf8');
    expect(html.split(COUNTER)).toHaveLength(2);
  });
});
