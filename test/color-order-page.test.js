// Plays Level 2 on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { COLORS } from '../public/game/color-order.js';
import { start } from '../public/game/color-order-page.js';

const html = readFileSync(join(process.cwd(), 'public/color-order.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const swatch = (id) => $(`.swatch[data-color="${id}"]`);
const filledCount = () => document.querySelectorAll('.build-stripe.is-filled').length;

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

describe('color order page', () => {
  it('starts with red filled in on top, and its button greyed out', () => {
    expect(document.querySelectorAll('.swatch')).toHaveLength(6);
    expect(filledCount()).toBe(1);
    expect(document.querySelectorAll('.build-stripe')[0].getAttribute('fill')).toBe('#E5383B');
    expect(swatch('red').disabled).toBe(true);
    expect($('.helper-text').textContent).toBe('Red goes on top. Which color comes next?');
    expect($('.level-done').hidden).toBe(true);
  });

  it('fills the next stripe orange and greys out the orange button', () => {
    swatch('orange').click();
    expect(filledCount()).toBe(2);
    expect(document.querySelectorAll('.build-stripe')[1].getAttribute('fill')).toBe('#F77F00');
    expect(swatch('orange').disabled).toBe(true);
    expect($('.helper-text').textContent).toBe('Orange! What comes next?');
  });

  it('wiggles a wrong pick and fills nothing', () => {
    swatch('green').click();
    expect(filledCount()).toBe(1);
    expect(swatch('green').classList.contains('is-wrong')).toBe(true);
    expect($('.helper-text').textContent).toBe('Not that one yet. Try another color!');
  });

  it('celebrates when the rainbow is finished', () => {
    for (const { id } of COLORS.slice(1)) swatch(id).click();
    expect(filledCount()).toBe(6);
    expect($('.tray').hidden).toBe(true);
    expect($('.helper').hidden).toBe(true);
    expect($('.level-done').hidden).toBe(false);
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('starts over from Play again, with red filled in again', () => {
    for (const { id } of COLORS.slice(1)) swatch(id).click();
    $('.level-done [data-restart]').click();
    expect(filledCount()).toBe(1);
    expect(level.game.filled).toBe(1);
    expect($('.tray').hidden).toBe(false);
    expect($('.helper').hidden).toBe(false);
    expect($('.level-done').hidden).toBe(true);
  });

  it('starts over from the header button partway through', () => {
    swatch('orange').click();
    $('header [data-restart]').click();
    expect(filledCount()).toBe(1);
    expect(swatch('orange').disabled).toBe(false);
    expect(swatch('red').disabled).toBe(true);
  });

  it('has no speaker button', () => {
    expect($('#say')).toBeNull();
  });

  it('outlines the stripe that goes next, and has no Ready step', () => {
    expect(level.studying).toBe(false);
    expect(document.querySelectorAll('.build-stripe')[1].classList.contains('is-next')).toBe(true);
    expect($('#ready')).toBeNull();
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
