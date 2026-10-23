// Plays Level 4, Rainbow garden, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { POTS, ROUNDS } from '../public/game/rainbow-garden.js';
import { start } from '../public/game/rainbow-garden-page.js';

const html = readFileSync(join(process.cwd(), 'public/rainbow-garden.html'), 'utf8');

let level;
const $ = (sel) => document.querySelector(sel);
const pots = () => [...document.querySelectorAll('.garden-pot')];
const packet = (color) => $(`.seed-packet[data-color="${color}"]`);
const filledDots = () => document.querySelectorAll('.goal-dot.is-filled').length;
const emptyPot = () => pots().find((p) => !p.dataset.color);
function plantRound() {
  for (const [color, n] of Object.entries(ROUNDS[level.game.round])) {
    packet(color).click();
    for (let i = 0; i < n; i++) emptyPot().click();
  }
}
function playAll() {
  plantRound();
  while (!$('#next').hidden) {
    $('#next').click();
    plantRound();
  }
}

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  level = start(document);
});

describe('rainbow garden page', () => {
  it('is level 4, with empty pots, seed packets and dots for the flowers wanted', () => {
    expect($('.level-title').textContent).toBe('Level 4 · Rainbow garden');
    expect($('.progress-pill').textContent).toBe('Round 1 of 5');
    expect(pots()).toHaveLength(POTS);
    expect(pots()[0].getAttribute('aria-label')).toBe('Pot 1, empty');
    expect(document.querySelectorAll('.seed-packet')).toHaveLength(6);
    expect(document.querySelectorAll('.goal-dot')).toHaveLength(2);
    expect($('.helper-text').textContent).toBe('Plant 2 yellow flowers!');
  });

  it('asks for a seed packet before planting', () => {
    pots()[0].click();
    expect(pots()[0].dataset.color).toBe('');
    expect($('.helper-text').textContent).toBe('Tap a seed packet first!');
  });

  it('presses in the packet picked', () => {
    packet('yellow').click();
    expect(packet('yellow').getAttribute('aria-pressed')).toBe('true');
    expect(packet('red').getAttribute('aria-pressed')).toBe('false');
  });

  it('grows a flower, fills a dot and counts', () => {
    packet('yellow').click();
    pots()[2].click();
    expect(pots()[2].dataset.color).toBe('yellow');
    expect(pots()[2].classList.contains('is-growing')).toBe(true);
    expect(pots()[2].querySelector('.flower-head')).not.toBeNull();
    expect(pots()[2].getAttribute('aria-label')).toBe('Pot 3, yellow flower');
    expect(filledDots()).toBe(1);
    expect($('.helper-text').textContent).toBe('One!');
  });

  it('wiggles the pot for a color not asked for', () => {
    packet('red').click();
    pots()[0].click();
    expect(pots()[0].dataset.color).toBe('');
    expect(pots()[0].classList.contains('is-wrong')).toBe(true);
    expect($('.helper-text').textContent).toMatch(/^We don't need red/);
  });

  it('shows Next when the round is done, then the next round', () => {
    plantRound();
    expect($('#next').hidden).toBe(false);
    expect($('.seed-packets').hidden).toBe(true);
    $('#next').click();
    expect($('.progress-pill').textContent).toBe('Round 2 of 5');
    expect(pots().every((p) => !p.dataset.color)).toBe(true);
    expect(document.querySelectorAll('.goal-dot')).toHaveLength(3);
    expect(level.picked).toBeNull();
  });

  it('brings the butterflies when the garden is all grown', () => {
    playAll();
    expect(level.game.round).toBe(4);
    expect($('.garden').classList.contains('is-done')).toBe(true);
    expect($('.level-done').hidden).toBe(false);
    expect($('#next').hidden).toBe(true);
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('starts over with empty pots on Play again', () => {
    playAll();
    $('.level-done [data-restart]').click();
    expect(level.game.round).toBe(0);
    expect(pots().every((p) => !p.dataset.color)).toBe(true);
    expect($('.level-done').hidden).toBe(true);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
