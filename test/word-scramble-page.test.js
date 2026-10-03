// Plays Level 7, Word scramble, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { BOX_COLORS, WORD } from '../public/game/word-scramble.js';
import { start } from '../public/game/word-scramble-page.js';

const html = readFileSync(join(process.cwd(), 'public/word-scramble.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const boxes = () => [...document.querySelectorAll('.letter-box')];
const tile = (letter) => $(`.letter-tile[data-letter="${letter}"]`);
const filled = () => boxes().filter((b) => b.classList.contains('is-filled')).length;

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

describe('word scramble page', () => {
  it('is level 7, with seven empty boxes and seven scrambled letters', () => {
    expect($('.level-title').textContent).toBe('Level 7 · Word scramble');
    expect(boxes()).toHaveLength(7);
    expect(filled()).toBe(0);
    const letters = [...document.querySelectorAll('.letter-tile')].map((t) => t.textContent);
    expect([...letters].sort()).toEqual([...WORD].sort());
    expect(letters.join('')).not.toBe(WORD);
    expect($('.helper-text').textContent).toBe('Put the letters in order to spell RAINBOW.');
  });

  it('drops the right letter into the next box with its rainbow color', () => {
    tile('R').click();
    expect(boxes()[0].textContent).toBe('R');
    expect(boxes()[0].classList.contains('is-filled')).toBe(true);
    expect(boxes()[0].style.getPropertyValue('--box-color')).toBe(BOX_COLORS[0]);
    expect(boxes()[1].classList.contains('is-next')).toBe(true);
    expect(tile('R').disabled).toBe(true);
    expect($('.helper-text').textContent).toBe('R! What comes next?');
  });

  it('wiggles a wrong letter and fills nothing', () => {
    tile('N').click();
    expect(filled()).toBe(0);
    expect(tile('N').classList.contains('is-wrong')).toBe(true);
    expect($('.helper-text').textContent).toBe('Not N yet. Try another letter!');
  });

  it('celebrates when RAINBOW is spelled', () => {
    for (const letter of WORD) tile(letter).click();
    expect(boxes().map((b) => b.textContent).join('')).toBe(WORD);
    expect($('.letter-tray').hidden).toBe(true);
    expect($('.level-done').hidden).toBe(false);
    expect($('.letter-boxes').getAttribute('aria-label')).toBe('RAINBOW');
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('scrambles a new puzzle on Play again', () => {
    for (const letter of WORD) tile(letter).click();
    $('.level-done [data-restart]').click();
    expect(filled()).toBe(0);
    expect(level.puzzle.placed).toBe(0);
    expect($('.letter-tray').hidden).toBe(false);
    expect($('.level-done').hidden).toBe(true);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
