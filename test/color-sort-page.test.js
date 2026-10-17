// Plays Level 9, Color sort, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { COLOR_IDS } from '../public/game/colors.js';
import { THINGS, currentThing } from '../public/game/color-sort.js';
import { PICTURES, start } from '../public/game/color-sort-page.js';

const html = readFileSync(join(process.cwd(), 'public/color-sort.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const basket = (color) => $(`.basket[data-color="${color}"]`);
const thing = () => currentThing(level.game);
const wrongColor = () => COLOR_IDS.find((c) => c !== thing().color);
const sortAll = () => { while (thing()) basket(thing().color).click(); };

// The pretend browser doesn't lay pages out, so give each basket a place:
// side by side, 100px wide, 100px down the page.
function placeBaskets() {
  COLOR_IDS.forEach((color, i) => {
    basket(color).getBoundingClientRect = () => ({ left: i * 100, right: i * 100 + 90, top: 100, bottom: 190 });
  });
}
const pointer = (type, x, y) => $('.sort-thing').dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
function dragTo(color) {
  const x = COLOR_IDS.indexOf(color) * 100 + 45;
  pointer('pointerdown', 300, 0);
  pointer('pointermove', x, 140);
  pointer('pointerup', x, 140);
}

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
  placeBaskets();
});

describe('color sort page', () => {
  it('is level 9, with the first thing and six empty baskets', () => {
    expect($('.level-title').textContent).toBe('Level 9 · Color sort');
    expect($('.progress-pill').textContent).toBe('0 of 6');
    expect(document.querySelectorAll('.basket')).toHaveLength(6);
    expect(document.querySelectorAll('.basket-thing')).toHaveLength(0);
    expect($('.sort-thing').dataset.thing).toBe(thing().id);
    expect($('.sort-thing svg')).not.toBeNull();
    expect($('.sort-thing').getAttribute('aria-label')).toBe(`The ${thing().name}`);
    expect($('.helper-text').textContent).toBe(`Drag the ${thing().name} into the basket of its color.`);
  });

  it('has a picture for every thing', () => {
    expect(Object.keys(PICTURES).sort()).toEqual(THINGS.map((t) => t.id).sort());
  });

  it('puts a thing in its basket when the basket is tapped', () => {
    const first = thing();
    basket(first.color).click();
    expect(basket(first.color).dataset.holds).toBe(first.id);
    expect(basket(first.color).querySelector('.basket-thing')).not.toBeNull();
    expect(basket(first.color).getAttribute('aria-label')).toMatch(new RegExp(`, with the ${first.name}$`));
    expect($('.progress-pill').textContent).toBe('1 of 6');
    expect($('.helper-text').textContent).toMatch(/^Yes! /);
  });

  it('puts a thing in its basket when it is dragged there', () => {
    const first = thing();
    dragTo(first.color);
    expect(level.game.sorted).toBe(1);
    expect(basket(first.color).querySelector('.basket-thing')).not.toBeNull();
    expect($('.sort-thing').style.transform).toBe('');
    expect($('.sort-thing').classList.contains('is-dragging')).toBe(false);
  });

  it('lights up the basket a thing is dragged over', () => {
    pointer('pointerdown', 300, 0);
    pointer('pointermove', 145, 140);
    expect(basket(COLOR_IDS[1]).classList.contains('is-over')).toBe(true);
    expect($('.sort-thing').style.transform).toBe('translate(-155px, 140px)');
  });

  it('wiggles the wrong basket and keeps the thing', () => {
    const first = thing();
    dragTo(wrongColor());
    expect(level.game.sorted).toBe(0);
    expect(basket(wrongColor()).classList.contains('is-wrong')).toBe(true);
    expect(thing()).toBe(first);
    expect($('.helper-text').textContent).toMatch(/Try another basket!$/);
  });

  it('puts the thing back when it is dropped away from the baskets', () => {
    pointer('pointerdown', 300, 0);
    pointer('pointermove', 900, 900);
    pointer('pointerup', 900, 900);
    expect(level.game.sorted).toBe(0);
    expect($('.sort-thing').style.transform).toBe('');
  });

  it('celebrates when everything is sorted', () => {
    sortAll();
    expect($('.progress-pill').textContent).toBe('6 of 6');
    expect(document.querySelectorAll('.basket-thing')).toHaveLength(6);
    expect($('.sort-stage').hidden).toBe(true);
    expect($('.level-done').hidden).toBe(false);
    expect($('.level-done a.button-play').textContent).toBe('More levels');
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('empties the baskets on Play again', () => {
    sortAll();
    $('.level-done [data-restart]').click();
    expect(level.game.sorted).toBe(0);
    expect(document.querySelectorAll('.basket-thing')).toHaveLength(0);
    expect($('.sort-stage').hidden).toBe(false);
    expect($('.level-done').hidden).toBe(true);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
