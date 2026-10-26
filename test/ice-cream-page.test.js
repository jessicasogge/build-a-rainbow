// Plays Level 5, Ice cream shop, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { CUSTOMERS } from '../public/game/ice-cream.js';
import { start } from '../public/game/ice-cream-page.js';

const html = readFileSync(join(process.cwd(), 'public/ice-cream.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const tub = (color) => $(`.tub[data-color="${color}"]`);
const scoops = () => document.querySelectorAll('.cone .scoop:not(.is-falling)').length;
function scoopCone() {
  for (const color of CUSTOMERS[level.game.customer].scoops) tub(color).click();
}
function serveAll() {
  scoopCone();
  while (!$('#next').hidden) {
    $('#next').click();
    scoopCone();
  }
}

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

describe('ice cream shop page', () => {
  it('is level 5, with the bunny, its order, an empty cone and six tubs', () => {
    expect($('.level-title').textContent).toBe('Level 5 · Ice cream shop');
    expect($('.progress-pill').textContent).toBe('Customer 1 of 6');
    expect($('.customer svg')).not.toBeNull();
    expect($('.order').getAttribute('aria-label')).toBe('Bunny wants, from the bottom up: red');
    expect($('.cone').getAttribute('aria-label')).toBe('Your cone, empty');
    expect(document.querySelectorAll('.cone .scoop-ghost')).toHaveLength(1);
    expect(document.querySelectorAll('.tub')).toHaveLength(6);
    expect($('.helper-text').textContent).toBe('Bunny wants 1 red scoop!');
  });

  it('wobbles a wrong scoop off and wiggles its tub', () => {
    tub('blue').click();
    expect(scoops()).toBe(0);
    expect($('.cone .is-falling')).not.toBeNull();
    expect(tub('blue').classList.contains('is-wrong')).toBe(true);
    expect($('.helper-text').textContent).toBe('Oops, not blue! Look at the picture.');
  });

  it('scoops the cone and hands it over with sprinkles, then brings the next customer', () => {
    tub('red').click();
    expect(scoops()).toBe(1);
    expect($('.cone .is-new')).not.toBeNull();
    expect($('.cone').getAttribute('aria-label')).toBe('Your cone: red');
    expect($('.cone .sprinkles')).not.toBeNull();
    expect($('.customer').classList.contains('is-happy')).toBe(true);
    expect($('.tubs').hidden).toBe(true);
    expect($('#next').hidden).toBe(false);
    expect(document.activeElement).toBe($('#next'));
    expect($('.helper-text').textContent).toBe('Bunny says thank you! Tap Next.');
    $('#next').click();
    expect($('.progress-pill').textContent).toBe('Customer 2 of 6');
    expect(scoops()).toBe(0);
    expect(document.querySelectorAll('.cone .scoop-ghost')).toHaveLength(2);
    expect($('.tubs').hidden).toBe(false);
  });

  it('shows every customer with their cone at the end', () => {
    serveAll();
    expect(level.game.customer).toBe(5);
    expect($('.shop').hidden).toBe(true);
    expect($('.parade').hidden).toBe(false);
    expect(document.querySelectorAll('.parade-guest')).toHaveLength(6);
    expect($('.level-done').hidden).toBe(false);
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('starts over with the bunny on Play again', () => {
    serveAll();
    $('.level-done [data-restart]').click();
    expect(level.game).toEqual({ customer: 0, cone: [], served: false });
    expect($('.shop').hidden).toBe(false);
    expect($('.level-done').hidden).toBe(true);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
