// Pages through the level picker in a pretend browser.
// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { start } from '../public/game/levels-page.js';
import { loadPage } from './load-page.js';

let picker;
const $ = (sel) => document.querySelector(sel);
const shown = () => [...document.querySelectorAll('.level-card:not([hidden])')].map((c) => c.dataset.level);
const back = () => $('[data-page="prev"]');
const more = () => $('[data-page="next"]');
const key = (name) => document.dispatchEvent(new KeyboardEvent('keydown', { key: name }));
const pointer = (type, x) => $('.level-card:not([hidden])').dispatchEvent(new MouseEvent(type, { clientX: x, clientY: 100, bubbles: true }));

beforeEach(() => {
  sessionStorage.clear();
  loadPage('levels.html');
  picker = start(document, { size: 4 });
});

describe('level picker pages', () => {
  it('shows the first four levels, with only More levels to go on', () => {
    expect(shown()).toEqual(['1', '2', '3', '4']);
    expect($('.pager').hidden).toBe(false);
    expect(more().textContent).toMatch(/^\s*More levels/);
    expect(more().hidden).toBe(false);
    expect(back().hidden).toBe(true);
  });

  it('turns the page with More levels and Back', () => {
    more().click();
    expect(shown()).toEqual(['5', '6', '7', '8']);
    expect(back().hidden).toBe(false);
    expect(back().textContent).toMatch(/Back\s*$/);
    expect(more().hidden).toBe(false);
    more().click();
    expect(shown()).toEqual(['9', '10', '11', '12']);
    more().click();
    expect(shown()).toEqual(['13', '14', '15', '16']);
    expect(more().hidden).toBe(true);
    back().click();
    expect(shown()).toEqual(['9', '10', '11', '12']);
  });

  it('turns the page with the arrow keys, and stops at the ends', () => {
    key('ArrowLeft');
    expect(picker.page).toBe(0);
    key('ArrowRight');
    key('ArrowRight');
    key('ArrowRight');
    key('ArrowRight');
    expect(picker.page).toBe(3);
  });

  it('turns the page with a sideways swipe, without opening a level', () => {
    pointer('pointerdown', 300);
    pointer('pointerup', 150);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    document.querySelector('.level-card:not([hidden])').dispatchEvent(click);
    expect(picker.page).toBe(1);
    expect(click.defaultPrevented).toBe(true);

    pointer('pointerdown', 150);
    pointer('pointerup', 300);
    expect(picker.page).toBe(0);
  });

  it('opens a level on a plain tap', () => {
    pointer('pointerdown', 300);
    pointer('pointerup', 305);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    document.querySelector('.level-card:not([hidden])').dispatchEvent(click);
    expect(click.defaultPrevented).toBe(false);
    expect(picker.page).toBe(0);
  });

  it('comes back to the same page after playing a level', () => {
    more().click();
    loadPage('levels.html');
    picker = start(document, { size: 4 });
    expect(shown()).toEqual(['5', '6', '7', '8']);
  });

  it('keeps the same levels on screen when more fit on a page', () => {
    more().click(); // levels 5 to 8
    loadPage('levels.html');
    picker = start(document, { size: 8 });
    expect(shown()).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
  });

  it('hides Back and More levels when every level fits on one page', () => {
    loadPage('levels.html');
    start(document, { size: 16 });
    expect(shown()).toHaveLength(16);
    expect($('.pager').hidden).toBe(true);
  });

  it('measures the screen when no size is given', () => {
    loadPage('levels.html');
    picker = start(document);
    // The pretend browser lays nothing out, so it falls back to the fewest.
    expect(picker.size).toBe(4);
  });
});
