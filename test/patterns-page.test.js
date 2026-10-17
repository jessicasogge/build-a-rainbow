// Plays Level 10, What comes next?, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { PATTERNS, nameOf } from '../public/game/patterns.js';
import { start } from '../public/game/patterns-page.js';

const html = readFileSync(join(process.cwd(), 'public/patterns.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const choices = () => [...document.querySelectorAll('.pattern-choice')];
const answer = () => PATTERNS[level.game.round].answer;
const rightChoice = () => choices().find((c) => c.getAttribute('aria-label') === nameOf(answer()));
const wrongChoice = () => choices().find((c) => c.getAttribute('aria-label') !== nameOf(answer()));
const playToEnd = () => {
  rightChoice().click();
  while (!$('#next').hidden) {
    $('#next').click();
    rightChoice().click();
  }
};

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

describe('what comes next page', () => {
  it('is level 10, with the first pattern, a gap and three choices', () => {
    expect($('.level-title').textContent).toBe('Level 10 · What comes next?');
    expect($('.progress-pill').textContent).toBe('Pattern 1 of 6');
    expect(document.querySelectorAll('.pattern-tile')).toHaveLength(5);
    expect($('.pattern-gap').textContent).toBe('?');
    expect(choices()).toHaveLength(3);
    expect($('.pattern-row').getAttribute('aria-label'))
      .toBe('red circle, blue circle, red circle, blue circle, red circle, and then what?');
    expect($('.helper-text').textContent).toBe('What comes next?');
    expect($('#next').hidden).toBe(true);
  });

  it('wiggles a wrong choice and leaves the gap empty', () => {
    const choice = wrongChoice();
    choice.click();
    expect(choice.classList.contains('is-wrong')).toBe(true);
    expect($('.pattern-gap').classList.contains('is-filled')).toBe(false);
    expect($('.helper-text').textContent).toMatch(/^Not that one/);
  });

  it('fills the gap with the right choice and shows Next', () => {
    rightChoice().click();
    expect($('.pattern-gap').classList.contains('is-filled')).toBe(true);
    expect($('.pattern-gap svg')).not.toBeNull();
    expect($('.pattern-row').getAttribute('aria-label')).toMatch(/, and then blue circle$/);
    expect($('.pattern-choices').hidden).toBe(true);
    expect($('#next').hidden).toBe(false);
    expect(document.activeElement).toBe($('#next'));
  });

  it('brings the next pattern on Next', () => {
    rightChoice().click();
    $('#next').click();
    expect($('.progress-pill').textContent).toBe('Pattern 2 of 6');
    expect($('.pattern-gap').textContent).toBe('?');
    expect($('.pattern-choices').hidden).toBe(false);
    expect(choices().every((c) => !c.disabled)).toBe(true);
  });

  it('celebrates after the last pattern', () => {
    playToEnd();
    expect(level.game.round).toBe(5);
    expect($('.level-done').hidden).toBe(false);
    expect($('#next').hidden).toBe(true);
    expect($('.level-done a.button-play').textContent).toBe('All levels');
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('starts over from the first pattern on Play again', () => {
    playToEnd();
    $('.level-done [data-restart]').click();
    expect(level.game.round).toBe(0);
    expect($('.progress-pill').textContent).toBe('Pattern 1 of 6');
    expect($('.level-done').hidden).toBe(true);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
