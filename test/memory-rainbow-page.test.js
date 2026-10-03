// Plays Level 3, Memory rainbow, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { COLORS } from '../public/game/colors.js';
import { STUDY_MESSAGE, start } from '../public/game/color-order-page.js';

const html = readFileSync(join(process.cwd(), 'public/memory-rainbow.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const swatch = (id) => $(`.swatch[data-color="${id}"]`);
const stripes = () => [...document.querySelectorAll('.build-stripe')];
const filledCount = () => stripes().filter((s) => s.classList.contains('is-filled')).length;

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  // The page itself starts the level with { memory: true }; do the same here.
  level = start(document, { memory: true });
});

describe('memory rainbow page', () => {
  it('is level 3', () => {
    expect($('.level-title').textContent).toBe('Level 3 · Memory rainbow');
    expect(html).toContain("start(document, { memory: true });");
  });

  it('starts by showing the whole rainbow, with a Ready button and no color buttons', () => {
    expect(level.studying).toBe(true);
    expect(filledCount()).toBe(6);
    expect(stripes().map((s) => s.getAttribute('fill'))).toEqual(COLORS.map((c) => c.hex));
    expect($('.helper-text').textContent).toBe(STUDY_MESSAGE);
    expect($('#ready').hidden).toBe(false);
    expect($('.tray').hidden).toBe(true);
  });

  it('clears the rainbow when Ready is tapped', () => {
    $('#ready').click();
    expect(level.studying).toBe(false);
    expect(filledCount()).toBe(0);
    expect($('#ready').hidden).toBe(true);
    expect($('.tray').hidden).toBe(false);
    expect($('.helper-text').textContent).toBe('Which color goes on top?');
  });

  it('gives no hint about which stripe is next', () => {
    $('#ready').click();
    expect(document.querySelectorAll('.build-stripe.is-next')).toHaveLength(0);
    swatch('red').click();
    expect(document.querySelectorAll('.build-stripe.is-next')).toHaveLength(0);
  });

  it('builds the rainbow from memory, wiggling wrong picks', () => {
    $('#ready').click();
    swatch('blue').click();
    expect(filledCount()).toBe(0);
    expect(swatch('blue').classList.contains('is-wrong')).toBe(true);
    swatch('red').click();
    expect(filledCount()).toBe(1);
  });

  it('celebrates when the rainbow is rebuilt', () => {
    $('#ready').click();
    for (const { id } of COLORS) swatch(id).click();
    expect($('.level-done').hidden).toBe(false);
    expect($('.level-done h2').textContent).toBe('You remembered the whole rainbow!');
    expect($('.tray').hidden).toBe(true);
  });

  it('goes back to looking at the rainbow on Play again', () => {
    $('#ready').click();
    for (const { id } of COLORS) swatch(id).click();
    $('.level-done [data-restart]').click();
    expect(level.studying).toBe(true);
    expect(filledCount()).toBe(6);
    expect($('#ready').hidden).toBe(false);
    expect($('.level-done').hidden).toBe(true);
  });

  it('goes back to looking at the rainbow on Start over, partway through', () => {
    $('#ready').click();
    swatch('red').click();
    $('header [data-restart]').click();
    expect(level.studying).toBe(true);
    expect($('#ready').hidden).toBe(false);
  });
});
