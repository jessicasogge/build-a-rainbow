// Plays Level 1 on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { COLORS } from '../public/game/color-order.js';
import { start } from '../public/game/color-order-page.js';

const html = readFileSync(join(process.cwd(), 'public/color-order.html'), 'utf8');

let spoken;
let level;
const $ = (sel) => document.querySelector(sel);
const swatch = (id) => $(`.swatch[data-color="${id}"]`);
const filledCount = () => document.querySelectorAll('.build-stripe.is-filled').length;

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  spoken = [];
  level = start(document, { speak: (text) => spoken.push(text) });
});

describe('color order page', () => {
  it('starts with six color buttons and an empty rainbow', () => {
    expect(document.querySelectorAll('.swatch')).toHaveLength(6);
    expect(filledCount()).toBe(0);
    expect($('.helper-text').textContent).toBe('Which color goes on top?');
    expect($('.level-done').hidden).toBe(true);
  });

  it('fills the top stripe red and greys out the red button', () => {
    swatch('red').click();
    expect(filledCount()).toBe(1);
    expect(document.querySelectorAll('.build-stripe')[0].getAttribute('fill')).toBe('#E5383B');
    expect(swatch('red').disabled).toBe(true);
    expect($('.helper-text').textContent).toBe('Red! What comes next?');
  });

  it('wiggles a wrong pick and fills nothing', () => {
    swatch('green').click();
    expect(filledCount()).toBe(0);
    expect(swatch('green').classList.contains('is-wrong')).toBe(true);
    expect($('.helper-text').textContent).toBe('Not that one yet. Try another color!');
  });

  it('celebrates when the rainbow is finished', () => {
    for (const { id } of COLORS) swatch(id).click();
    expect(filledCount()).toBe(6);
    expect($('.tray').hidden).toBe(true);
    expect($('.helper').hidden).toBe(true);
    expect($('.level-done').hidden).toBe(false);
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('starts over from Play again', () => {
    for (const { id } of COLORS) swatch(id).click();
    $('.level-done [data-restart]').click();
    expect(filledCount()).toBe(0);
    expect(level.game.filled).toBe(0);
    expect($('.tray').hidden).toBe(false);
    expect($('.helper').hidden).toBe(false);
    expect($('.level-done').hidden).toBe(true);
  });

  it('starts over from the header button partway through', () => {
    swatch('red').click();
    $('header [data-restart]').click();
    expect(filledCount()).toBe(0);
    expect(swatch('red').disabled).toBe(false);
  });

  it('reads the helper out loud', () => {
    swatch('red').click();
    $('#say').click();
    expect(spoken).toEqual(['Red! What comes next?']);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
