// Plays Level 15, Spot the difference, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { SCENES, changesIn } from '../public/game/spot-the-difference.js';
import { SCENE_ART, start } from '../public/game/spot-the-difference-page.js';

const html = readFileSync(join(process.cwd(), 'public/spot-the-difference.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const things = (id) => [...document.querySelectorAll(`.spot-thing[data-thing="${id}"]`)];
const click = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
function findAll() {
  for (const id of changesIn(level.game)) click(things(id)[0]);
}
function playAll() {
  findAll();
  while (!$('#next').hidden) {
    $('#next').click();
    findAll();
  }
}

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

describe('spot the difference page', () => {
  it('draws every thing in every picture', () => {
    for (const scene of SCENES) expect(Object.keys(SCENE_ART[scene.id].things).sort()).toEqual(Object.keys(scene.things).sort());
  });

  it('is level 15, with two copies of the park', () => {
    expect($('.level-title').textContent).toBe('Level 15 · Spot the difference');
    expect($('.progress-pill').textContent).toBe('Picture 1 of 3');
    expect(document.querySelectorAll('.spot-picture')).toHaveLength(2);
    expect(things('ball').map((t) => t.getAttribute('aria-label'))).toEqual(['blue ball', 'yellow ball']);
    expect(things('kite').map((t) => t.getAttribute('aria-label'))).toEqual(['purple kite', 'purple kite']);
    expect($('.helper-text').textContent).toBe('Find 3 things that changed color!');
  });

  it('rings a difference in both copies, tapped in either', () => {
    click(things('ball')[1]);
    expect(things('ball').every((t) => t.classList.contains('is-found'))).toBe(true);
    expect($('.helper-text').textContent).toBe('The ball changed from blue to yellow! 2 more to go.');
  });

  it('works from the keyboard', () => {
    things('slide')[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(level.game.found).toEqual(['slide']);
  });

  it('wiggles a thing that did not change, in both copies', () => {
    click(things('kite')[0]);
    expect(things('kite').every((t) => t.classList.contains('is-wrong'))).toBe(true);
    expect(level.game.found).toEqual([]);
  });

  it('shows Next once the picture is done, then the next picture', () => {
    findAll();
    expect($('#next').hidden).toBe(false);
    expect(document.activeElement).toBe($('#next'));
    expect($('.spot-pictures').classList.contains('is-solved')).toBe(true); // one copy, so Next fits
    $('#next').click();
    expect($('.progress-pill').textContent).toBe('Picture 2 of 3');
    expect(things('door')).toHaveLength(2);
    expect(document.querySelectorAll('.spot-thing.is-found')).toHaveLength(0);
    expect($('.spot-pictures').classList.contains('is-solved')).toBe(false);
    expect($('#next').hidden).toBe(true);
  });

  it('celebrates after the last picture, and leads back to all the levels', () => {
    playAll();
    expect(level.game.scene).toBe(2);
    expect($('.spot-pictures').classList.contains('is-done')).toBe(true);
    expect($('.level-done').hidden).toBe(false);
    expect($('.level-done a.button-play').textContent).toBe('All levels'); // the last level
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('starts over with the park on Play again', () => {
    playAll();
    $('.level-done [data-restart]').click();
    expect(level.game).toEqual({ scene: 0, found: [] });
    expect(things('balloon')).toHaveLength(2);
    expect($('.level-done').hidden).toBe(true);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
