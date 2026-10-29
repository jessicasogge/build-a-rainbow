// Plays Level 16, Rainbow puzzle, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { PUZZLES } from '../public/game/rainbow-puzzle.js';
import { PICTURES, start } from '../public/game/rainbow-puzzle-page.js';

const html = readFileSync(join(process.cwd(), 'public/rainbow-puzzle.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const piece = (p) => $(`.puzzle-piece[data-piece="${p}"]`);
const spot = (s) => $(`.puzzle-spot[data-spot="${s}"]`);
function solve() {
  for (const p of [...level.game.tray]) {
    piece(p).click();
    spot(p).click();
  }
}
function playAll() {
  solve();
  while (!$('#next').hidden) {
    $('#next').click();
    solve();
  }
}

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document, { random: () => 0 });
});

describe('rainbow puzzle page', () => {
  it('has a picture for every puzzle', () => {
    for (const p of PUZZLES) expect(PICTURES[p.id].art).toContain('<');
  });

  it('is level 16, with six empty spots, the faint picture and six pieces', () => {
    expect($('.level-title').textContent).toBe('Level 16 · Rainbow puzzle');
    expect($('.progress-pill').textContent).toBe('Puzzle 1 of 3');
    expect($('.puzzle-guide')).not.toBeNull();
    expect(document.querySelectorAll('.puzzle-spot')).toHaveLength(6);
    expect(document.querySelectorAll('.puzzle-piece')).toHaveLength(6);
    expect($('.helper-text').textContent).toBe('Put the 6 pieces back in the picture!');
  });

  it('shows each piece as its own part of the picture', () => {
    expect(piece(0).querySelector('svg').getAttribute('viewBox')).toBe('0 0 200 200');
    expect(piece(5).querySelector('svg').getAttribute('viewBox')).toBe('400 200 200 200');
  });

  it('asks for a piece before a spot', () => {
    spot(0).click();
    expect($('.helper-text').textContent).toBe('Tap a piece first, then tap where it goes!');
  });

  it('picks a piece, and puts it in its spot', () => {
    piece(2).click();
    expect(level.picked).toBe(2);
    expect(piece(2).getAttribute('aria-pressed')).toBe('true');
    spot(2).click();
    expect(spot(2).classList.contains('is-filled')).toBe(true);
    expect(spot(2).querySelector('svg')).not.toBeNull();
    expect(piece(2)).toBeNull();
    expect(level.picked).toBeNull();
    expect($('.helper-text').textContent).toBe('It fits! 5 more pieces.');
  });

  it('wiggles a piece put in the wrong spot, and keeps it in the tray', () => {
    piece(2).click();
    spot(4).click();
    expect(spot(4).classList.contains('is-filled')).toBe(false);
    expect(spot(4).classList.contains('is-wrong')).toBe(true);
    expect(piece(2).classList.contains('is-wrong')).toBe(true);
    expect(level.picked).toBe(2); // still picked, to try another spot
  });

  it('lets a picked piece be put down again', () => {
    piece(2).click();
    piece(2).click();
    expect(level.picked).toBeNull();
  });

  it('shows Next once the picture is done, then a bigger puzzle', () => {
    solve();
    expect($('.puzzle-tray').hidden).toBe(true);
    expect($('#next').hidden).toBe(false);
    expect(document.activeElement).toBe($('#next'));
    $('#next').click();
    expect($('.progress-pill').textContent).toBe('Puzzle 2 of 3');
    expect(document.querySelectorAll('.puzzle-spot')).toHaveLength(9);
    expect(document.querySelectorAll('.puzzle-piece')).toHaveLength(9);
  });

  it('celebrates after the last puzzle, and leads back to all the levels', () => {
    playAll();
    expect(level.game.puzzle).toBe(2);
    expect(document.querySelectorAll('.puzzle-spot.is-filled')).toHaveLength(12);
    expect($('.level-done').hidden).toBe(false);
    expect($('.level-done a.button-play').textContent).toBe('All levels'); // the last level
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('starts over with the first puzzle on Play again', () => {
    playAll();
    $('.level-done [data-restart]').click();
    expect(level.game.puzzle).toBe(0);
    expect(document.querySelectorAll('.puzzle-piece')).toHaveLength(6);
    expect($('.level-done').hidden).toBe(true);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
