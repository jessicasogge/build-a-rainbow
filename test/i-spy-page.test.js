// Plays Level 7, I spy, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { THINGS } from '../public/game/i-spy.js';
import { REACH, start } from '../public/game/i-spy-page.js';

const html = readFileSync(join(process.cwd(), 'public/i-spy.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const thing = (id) => $(`.spy-thing[data-thing="${id}"]`);
const tapThing = (id) => thing(id).dispatchEvent(new MouseEvent('click', { bubbles: true }));
const findAll = () => { while (level.looking) tapThing(level.looking.id); };

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

describe('i spy page', () => {
  it('is level 7, with the meadow and the first clue', () => {
    expect($('.level-title').textContent).toBe('Level 7 · I spy');
    expect($('.progress-pill').textContent).toBe('Clue 1 of 6');
    expect($('.helper-text').textContent).toBe(`I spy something ${level.looking.color} that ${level.looking.hint}!`);
  });

  it('has every thing in the meadow, each a labeled button', () => {
    for (const t of THINGS) {
      const el = thing(t.id);
      expect(el, t.id).not.toBeNull();
      expect(el.getAttribute('role')).toBe('button');
      expect(el.getAttribute('tabindex')).toBe('0');
      expect(el.getAttribute('aria-label')).toBe(`${t.color} ${t.name}`);
      expect(el.querySelector('.spy-hit')).not.toBeNull();
    }
    expect(document.querySelectorAll('.spy-thing')).toHaveLength(THINGS.length);
  });

  it('shows the color in the clue as a chip of that color', () => {
    const chip = $('.helper-text .spy-color');
    expect(chip.textContent).toBe(level.looking.color);
    expect(chip.dataset.color).toBe(level.looking.color);
  });

  it('rings a found thing and gives the next clue', () => {
    const first = level.looking;
    tapThing(first.id);
    expect(thing(first.id).classList.contains('is-found')).toBe(true);
    expect($('.progress-pill').textContent).toBe('Clue 2 of 6');
    expect($('.helper-text').textContent).toMatch(new RegExp(`^Yes, the ${first.name}! I spy something`));
  });

  it('wiggles the other thing of the same color, and says what it is', () => {
    const other = THINGS.find((t) => t.color === level.looking.color && t.id !== level.looking.id);
    tapThing(other.id);
    expect(thing(other.id).classList.contains('is-wrong')).toBe(true);
    expect(thing(other.id).classList.contains('is-found')).toBe(false);
    expect($('.helper-text').textContent).toMatch(new RegExp(`^That's the ${other.color} ${other.name}!`));
  });

  it('counts a tap just outside a small thing, for the closest one', () => {
    // The pretend browser lays nothing out, so give each thing a small tap
    // area in a row, 40px apart.
    const ids = THINGS.map((t) => t.id);
    ids.forEach((id, i) => {
      thing(id).querySelector('.spy-hit').getBoundingClientRect = () => ({ left: i * 40, top: 0, width: 20, height: 20 });
    });
    const at = ids.indexOf(level.looking.id);
    const tapMeadow = (x) => $('.spy-sky').dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: x, clientY: 10 }));
    tapMeadow(at * 40 + 10 + REACH * 0.4); // just outside its 20px area, nearer it than its neighbor
    expect(level.game.found).toBe(1);
    tapMeadow(5000); // far from everything
    expect(level.game.found).toBe(1);
    expect($('.helper-text').textContent).toMatch(/^Yes, the /);
  });

  it('can be played from the keyboard', () => {
    const first = level.looking;
    thing(first.id).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(level.game.found).toBe(1);
  });

  it('celebrates when every clue is found', () => {
    findAll();
    expect(document.querySelectorAll('.spy-thing.is-found')).toHaveLength(6);
    expect($('.spy-scene').classList.contains('is-done')).toBe(true);
    expect($('.level-done').hidden).toBe(false);
    expect($('.helper').hidden).toBe(true);
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('starts over with new clues on Play again', () => {
    findAll();
    $('.level-done [data-restart]').click();
    expect(level.game.found).toBe(0);
    expect(document.querySelectorAll('.spy-thing.is-found')).toHaveLength(0);
    expect($('.level-done').hidden).toBe(true);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
