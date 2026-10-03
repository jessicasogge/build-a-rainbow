// Plays Level 2 on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { question } from '../public/game/mix-a-color.js';
import { start } from '../public/game/mix-a-color-page.js';

const html = readFileSync(join(process.cwd(), 'public/mix-a-color.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const choice = (id) => $(`.swatch[data-color="${id}"]`);
const right = () => question(level.game).makes;
const wrong = () => [...document.querySelectorAll('.swatch')].map((b) => b.dataset.color).find((id) => id !== right());

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

describe('mix a color page', () => {
  it('shows two colors, a mystery color and three answers', () => {
    const q = question(level.game);
    expect($('[data-blob="a"] .blob-name').textContent).toBe(q.a[0].toUpperCase() + q.a.slice(1));
    expect($('[data-blob="mystery"] .blob-name').textContent).toBe('Mystery');
    expect(document.querySelectorAll('.swatch')).toHaveLength(3);
    expect($('.progress-pill').textContent).toBe('Question 1 of 3');
    expect($('#next').hidden).toBe(true);
  });

  it('wiggles a wrong answer and keeps the mystery', () => {
    choice(wrong()).click();
    expect(choice(wrong()).classList.contains('is-wrong')).toBe(true);
    expect($('[data-blob="mystery"]').classList.contains('is-solved')).toBe(false);
    expect($('.helper-text').textContent).toBe('Not quite. Try another color!');
  });

  it('reveals the mixed color and offers Next', () => {
    const id = right();
    choice(id).click();
    const mystery = $('[data-blob="mystery"]');
    expect(mystery.classList.contains('is-solved')).toBe(true);
    expect(mystery.querySelector('.blob-name').textContent.toLowerCase()).toBe(id);
    expect($('.tray').hidden).toBe(true);
    expect($('#next').hidden).toBe(false);
  });

  it('moves on to question 2', () => {
    choice(right()).click();
    $('#next').click();
    expect($('.progress-pill').textContent).toBe('Question 2 of 3');
    expect($('[data-blob="mystery"] .blob-name').textContent).toBe('Mystery');
    expect($('.tray').hidden).toBe(false);
  });

  it('celebrates after the third question', () => {
    for (let i = 0; i < 3; i++) {
      choice(right()).click();
      if (i < 2) $('#next').click();
    }
    expect($('#next').hidden).toBe(true);
    expect($('.helper').hidden).toBe(true);
    expect($('.level-done').hidden).toBe(false);
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('starts over from Play again', () => {
    for (let i = 0; i < 3; i++) {
      choice(right()).click();
      if (i < 2) $('#next').click();
    }
    $('.level-done [data-restart]').click();
    expect($('.progress-pill').textContent).toBe('Question 1 of 3');
    expect($('.level-done').hidden).toBe(true);
    expect($('.tray').hidden).toBe(false);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
