// Checks the game can be saved to a phone's home screen with its own icon
// and name: every page links the icon and manifest, and the icons are the
// sizes iPhones and Android phones expect.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const publicDir = join(process.cwd(), 'public');
const read = (name) => readFileSync(join(publicDir, name));
// Google Search Console's ownership file isn't a page of the game.
const pages = readdirSync(publicDir).filter((f) => f.endsWith('.html') && !/^google[0-9a-f]+\.html$/.test(f)).sort();

// A PNG's width and height, from its header.
function pngSize(name) {
  const png = read(name);
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  return [png.readUInt32BE(16), png.readUInt32BE(20)];
}

describe.each(pages)('%s', (page) => {
  it('links the home screen icon, manifest and name', () => {
    const html = read(page).toString();
    expect(html).toContain('<link rel="apple-touch-icon" href="./apple-touch-icon.png" />');
    expect(html).toContain('<link rel="manifest" href="./manifest.webmanifest" />');
    expect(html).toContain('<meta name="apple-mobile-web-app-title" content="Rainbow" />');
  });
});

describe('home screen icons', () => {
  it('has the 180 × 180 icon iPhones use', () => {
    expect(pngSize('apple-touch-icon.png')).toEqual([180, 180]);
  });

  it('has a manifest that opens the game full screen, with icons that exist', () => {
    const manifest = JSON.parse(read('manifest.webmanifest').toString());
    expect(manifest.short_name).toBe('Rainbow');
    expect(manifest.display).toBe('standalone');
    for (const { src, sizes } of manifest.icons) {
      const [w, h] = sizes.split('x').map(Number);
      expect(pngSize(src.replace('./', ''))).toEqual([w, h]);
    }
    expect(manifest.icons.map((i) => i.sizes)).toContain('512x512');
  });
});
