// Plays Level 7, Word scramble, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { BOX_COLORS, boxColor } from '../public/game/word-scramble.js';
import { start } from '../public/game/word-scramble-page.js';

const html = readFileSync(join(process.cwd(), 'public/word-scramble.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const boxes = () => [...document.querySelectorAll('.letter-box')];
const tiles = () => [...document.querySelectorAll('.letter-tile')];
// The first tile with `letter` on it that's still in play.
const tile = (letter) => tiles().find((t) => t.dataset.letter === letter && !t.disabled);
const filled = () => boxes().filter((b) => b.classList.contains('is-filled')).length;
const spell = (word) => { for (const letter of word) tile(letter).click(); };
const clueShown = () => [...document.querySelectorAll('[data-clue]')].filter((c) => !c.hasAttribute('hidden')).map((c) => c.dataset.clue);

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

describe('word scramble page', () => {
  it('is level 7, starting on RAINBOW: seven empty boxes, seven scrambled letters and a rainbow', () => {
    expect($('.level-title').textContent).toBe('Level 7 · Word scramble');
    expect($('.progress-pill').textContent).toBe('Word 1 of 2');
    expect(boxes()).toHaveLength(7);
    expect(filled()).toBe(0);
    const letters = tiles().map((t) => t.textContent);
    expect([...letters].sort()).toEqual([...'RAINBOW'].sort());
    expect(letters.join('')).not.toBe('RAINBOW');
    expect(clueShown()).toEqual(['rainbow']);
    expect($('.helper-text').textContent).toBe('Put the letters in order to spell RAINBOW.');
    expect($('#next').hidden).toBe(true);
  });

  it('drops the right letter into the next box with its rainbow color', () => {
    tile('R').click();
    expect(boxes()[0].textContent).toBe('R');
    expect(boxes()[0].classList.contains('is-filled')).toBe(true);
    expect(boxes()[0].style.getPropertyValue('--box-color')).toBe(BOX_COLORS[0]);
    expect(boxes()[1].classList.contains('is-next')).toBe(true);
    expect(tiles().find((t) => t.dataset.letter === 'R').disabled).toBe(true);
    expect($('.helper-text').textContent).toBe('R! What comes next?');
  });

  it('wiggles a wrong letter and fills nothing', () => {
    tile('N').click();
    expect(filled()).toBe(0);
    expect(tile('N').classList.contains('is-wrong')).toBe(true);
    expect($('.helper-text').textContent).toBe('Not N yet. Try another letter!');
  });

  it('after RAINBOW, shows a Next button instead of the letters', () => {
    spell('RAINBOW');
    expect(boxes().map((b) => b.textContent).join('')).toBe('RAINBOW');
    expect($('.letter-tray').hidden).toBe(true);
    expect($('#next').hidden).toBe(false);
    expect(document.activeElement).toBe($('#next'));
    expect($('.level-done').hidden).toBe(true);
    expect($('.letter-boxes').getAttribute('aria-label')).toBe('RAINBOW');
    expect($('.helper-text').textContent).toBe('You spelled RAINBOW! Tap Next for another word.');
  });

  it('Next brings SUNSHINE: eight boxes, eight letters and a sun', () => {
    spell('RAINBOW');
    $('#next').click();
    expect($('.progress-pill').textContent).toBe('Word 2 of 2');
    expect(boxes()).toHaveLength(8);
    expect(filled()).toBe(0);
    expect($('.letter-boxes').style.getPropertyValue('--letters')).toBe('8');
    expect(boxes()[7].style.getPropertyValue('--box-color')).toBe(boxColor(7));
    expect([...tiles().map((t) => t.textContent)].sort()).toEqual([...'SUNSHINE'].sort());
    expect(clueShown()).toEqual(['sun']);
    expect($('.letter-tray').hidden).toBe(false);
    expect($('#next').hidden).toBe(true);
    expect($('.helper-text').textContent).toBe('Put the letters in order to spell SUNSHINE.');
  });

  it('celebrates when SUNSHINE is spelled too', () => {
    spell('RAINBOW');
    $('#next').click();
    spell('SUNSHINE');
    expect(boxes().map((b) => b.textContent).join('')).toBe('SUNSHINE');
    expect($('.level-done').hidden).toBe(false);
    expect($('#next').hidden).toBe(true);
    expect($('.letter-boxes').getAttribute('aria-label')).toBe('SUNSHINE');
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('starts over from RAINBOW on Play again', () => {
    spell('RAINBOW');
    $('#next').click();
    spell('SUNSHINE');
    $('.level-done [data-restart]').click();
    expect(level.puzzle.wordIndex).toBe(0);
    expect(boxes()).toHaveLength(7);
    expect(filled()).toBe(0);
    expect(clueShown()).toEqual(['rainbow']);
    expect($('.progress-pill').textContent).toBe('Word 1 of 2');
    expect($('.level-done').hidden).toBe(true);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
