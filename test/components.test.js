// The shared page pieces in game/components.js.
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { stripePath } from '../public/game/components.js';
import { COLORS } from '../public/game/colors.js';

const render = (html) => {
  document.body.innerHTML = html;
  return document.body;
};

describe('<level-header>', () => {
  it('has Back, the level title and Start over', () => {
    const el = render('<level-header number="2" name="Color order"></level-header>');
    expect(el.querySelector('a.round-button').getAttribute('href')).toBe('./levels.html');
    expect(el.querySelector('.level-title').textContent).toBe('Level 2 · Color order');
    expect(el.querySelector('.progress-pill')).toBeNull();
    expect(el.querySelector('[data-restart]').className).toBe('round-button header-end');
  });

  it('adds the counter when there is one', () => {
    const el = render('<level-header number="6" name="Rainbow road" counter="Turn 1 of 6"></level-header>');
    expect(el.querySelector('.progress-pill').textContent).toBe('Turn 1 of 6');
    expect(el.querySelector('[data-restart]').className).toBe('round-button');
  });
});

describe('<helper-bubble>', () => {
  it('holds what the helper says first', () => {
    const el = render('<helper-bubble>Which color goes on top?</helper-bubble>');
    expect(el.querySelector('.helper .helper-face')).not.toBeNull();
    const text = el.querySelector('.helper-text');
    expect(text.textContent).toBe('Which color goes on top?');
    expect(text.getAttribute('aria-live')).toBe('polite');
  });
});

describe('<level-done>', () => {
  it('starts hidden, with Play again and More levels', () => {
    const el = render('<level-done heading="You did it!">Fun fact: hello.</level-done>');
    const done = el.querySelector('section.level-done');
    expect(done.hidden).toBe(true);
    expect(done.querySelector('h2').textContent).toBe('You did it!');
    expect(done.querySelector('.fun-fact').textContent).toBe('Fun fact: hello.');
    expect(done.querySelector('button[data-restart]').textContent).toBe('Play again');
    expect(done.querySelector('button[data-restart]').className).toBe('button button-secondary');
    expect(done.querySelector('a.button-play').textContent).toBe('More levels');
  });

  it('can name its buttons', () => {
    const el = render('<level-done heading="Done" again="Drive again" next="All levels">x</level-done>');
    expect(el.querySelector('button[data-restart]').textContent).toBe('Drive again');
    expect(el.querySelector('a.button-play').textContent).toBe('All levels');
  });

  it('keeps text as text', () => {
    const el = render('<level-done heading="&lt;b&gt;hi&lt;/b&gt;">x</level-done>');
    expect(el.querySelector('h2 b')).toBeNull();
    expect(el.querySelector('h2').textContent).toBe('<b>hi</b>');
  });
});

describe('<rainbow-stripes>', () => {
  it('draws six stripes in rainbow colors, described for screen readers', () => {
    const el = render('<rainbow-stripes svg-class="rainbow" label="A rainbow"></rainbow-stripes>');
    const svg = el.querySelector('svg.rainbow');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('A rainbow');
    expect([...svg.querySelectorAll('path.stripe')].map((p) => p.getAttribute('fill'))).toEqual(COLORS.map((c) => c.hex));
  });

  it('draws blank, tappable stripes for a level to fill in', () => {
    const el = render('<rainbow-stripes stripe-class="paint-stripe" blank tappable></rainbow-stripes>');
    const stripes = [...el.querySelectorAll('path.paint-stripe')];
    expect(stripes).toHaveLength(6);
    for (const s of stripes) {
      expect(s.getAttribute('fill')).toBe('#ffffff');
      expect(s.getAttribute('role')).toBe('button');
      expect(s.getAttribute('tabindex')).toBe('0');
    }
  });

  it('is hidden from screen readers when it is only decoration', () => {
    const el = render('<rainbow-stripes svg-class="mini-rainbow"></rainbow-stripes>');
    expect(el.querySelector('svg').getAttribute('aria-hidden')).toBe('true');
  });

  it('can add the picked-up outline, hidden, on top of the stripes', () => {
    const el = render('<rainbow-stripes stripe-class="fix-stripe" highlight></rainbow-stripes>');
    const last = el.querySelector('svg').lastElementChild;
    expect(last.getAttribute('class')).toBe('fix-highlight');
    expect(last.hasAttribute('hidden')).toBe(true);
  });
});

describe('<level-picture>', () => {
  const LEVELS = ['mix-a-color', 'color-order', 'memory-rainbow', 'sun-and-rain', 'paint-a-rainbow', 'rainbow-road', 'word-scramble', 'fix-the-rainbow'];

  it.each(LEVELS)('draws a picture for %s', (level) => {
    const el = render(`<level-picture level="${level}"></level-picture>`);
    const svg = el.querySelector('svg.level-picture');
    expect(svg.getAttribute('viewBox')).toBe('0 0 88 56');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.children.length).toBeGreaterThan(0);
  });
});

describe('stripePath', () => {
  // The exact shapes that used to be typed out by hand in the pages.
  const BIG = [
    'M20 330 A300 300 0 0 1 620 330 L584 330 A264 264 0 0 0 56 330 Z',
    'M56 330 A264 264 0 0 1 584 330 L548 330 A228 228 0 0 0 92 330 Z',
    'M92 330 A228 228 0 0 1 548 330 L512 330 A192 192 0 0 0 128 330 Z',
    'M128 330 A192 192 0 0 1 512 330 L476 330 A156 156 0 0 0 164 330 Z',
    'M164 330 A156 156 0 0 1 476 330 L440 330 A120 120 0 0 0 200 330 Z',
    'M200 330 A120 120 0 0 1 440 330 L404 330 A84 84 0 0 0 236 330 Z',
  ];
  const MINI = [
    'M2 33 A30 30 0 0 1 62 33 L58 33 A26 26 0 0 0 6 33 Z',
    'M6 33 A26 26 0 0 1 58 33 L54 33 A22 22 0 0 0 10 33 Z',
    'M10 33 A22 22 0 0 1 54 33 L50 33 A18 18 0 0 0 14 33 Z',
    'M14 33 A18 18 0 0 1 50 33 L46 33 A14 14 0 0 0 18 33 Z',
    'M18 33 A14 14 0 0 1 46 33 L42 33 A10 10 0 0 0 22 33 Z',
    'M22 33 A10 10 0 0 1 42 33 L38 33 A6 6 0 0 0 26 33 Z',
  ];
  const CLUE = [
    'M10 160 A150 150 0 0 1 310 160 L288 160 A128 128 0 0 0 32 160 Z',
    'M32 160 A128 128 0 0 1 288 160 L266 160 A106 106 0 0 0 54 160 Z',
    'M54 160 A106 106 0 0 1 266 160 L244 160 A84 84 0 0 0 76 160 Z',
    'M76 160 A84 84 0 0 1 244 160 L222 160 A62 62 0 0 0 98 160 Z',
    'M98 160 A62 62 0 0 1 222 160 L200 160 A40 40 0 0 0 120 160 Z',
    'M120 160 A40 40 0 0 1 200 160 L178 160 A18 18 0 0 0 142 160 Z',
  ];

  it('matches the big rainbow the levels used', () => {
    expect(COLORS.map((_, i) => stripePath(i))).toEqual(BIG);
  });

  it('matches the little rainbow on the level cards', () => {
    expect(COLORS.map((_, i) => stripePath(i, { cx: 32, base: 33, outer: 30, inner: 6 }))).toEqual(MINI);
  });

  it('matches the clue rainbow in Word scramble', () => {
    expect(COLORS.map((_, i) => stripePath(i, { cx: 160, base: 160, outer: 150, inner: 18 }))).toEqual(CLUE);
  });
});
