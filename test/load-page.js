// Loads one of the game's pages into the pretend browser (jsdom), with the
// shared page pieces from game/components.js filled in, as a real browser
// would show it. Tests using this need `// @vitest-environment jsdom`.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import '../public/game/components.js';

export function loadPage(name) {
  const html = readFileSync(join(process.cwd(), 'public', name), 'utf8');
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  return html;
}
