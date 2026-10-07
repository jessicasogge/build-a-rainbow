// Plays Level 4, Sun and rain, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { start } from '../public/game/sun-and-rain-page.js';

const html = readFileSync(join(process.cwd(), 'public/sun-and-rain.html'), 'utf8');

const $ = (sel) => document.querySelector(sel);
const tap = (id) => $(`[data-weather="${id}"]`).click();
const scene = () => $('.sky-scene');

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  start(document);
});

describe('sun and rain page', () => {
  it('is level 4 and starts with nothing on', () => {
    expect($('.level-title').textContent).toBe('Level 4 · Sun and rain');
    expect(scene().getAttribute('class')).toBe('sky-scene');
    expect(scene().getAttribute('aria-label')).toBe('A sky: grey, with one small cloud.');
    expect(document.querySelectorAll('[data-weather]')).toHaveLength(5);
    expect($('.helper-text').textContent).toBe('Tap the weather to make a rainbow!');
    expect($('.level-done').hidden).toBe(true);
  });

  it('shows the sun and presses its button', () => {
    tap('sun');
    expect(scene().classList.contains('has-sun')).toBe(true);
    expect($('[data-weather="sun"]').getAttribute('aria-pressed')).toBe('true');
    expect($('.helper-text').textContent).toBe('Sunny! But a rainbow needs raindrops too.');
  });

  it('turns the sun back off', () => {
    tap('sun');
    tap('sun');
    expect(scene().classList.contains('has-sun')).toBe(false);
    expect($('[data-weather="sun"]').getAttribute('aria-pressed')).toBe('false');
  });

  it('makes no rainbow with snow', () => {
    tap('sun');
    tap('snow');
    expect(scene().classList.contains('has-rainbow')).toBe(false);
    expect($('.helper-text').textContent).toBe("Snowflakes don't make rainbows. Try rain!");
  });

  it('makes no rainbow when thick clouds hide the sun', () => {
    tap('sun');
    tap('rain');
    tap('clouds');
    expect(scene().classList.contains('has-clouds')).toBe(true);
    expect(scene().classList.contains('has-rainbow')).toBe(false);
    expect($('[data-weather="clouds"]').getAttribute('aria-pressed')).toBe('true');
    expect($('.helper-text').textContent).toBe("Too many clouds! The sun can't shine through.");
    expect($('.level-done').hidden).toBe(true);
  });

  it('makes the rainbow once the clouds clear', () => {
    tap('clouds');
    tap('sun');
    tap('rain');
    tap('clouds');
    expect(scene().classList.contains('has-rainbow')).toBe(true);
  });

  it('blows wind across the sky', () => {
    tap('wind');
    expect(scene().classList.contains('has-wind')).toBe(true);
    expect($('[data-weather="wind"]').getAttribute('aria-pressed')).toBe('true');
    expect(scene().getAttribute('aria-label')).toBe('A sky: the wind is blowing.');
    expect($('.helper-text').textContent).toBe('Whoosh! Wind is fun, but a rainbow needs sun and rain.');
  });

  it('still makes a rainbow when it is windy', () => {
    tap('wind');
    tap('sun');
    tap('rain');
    expect(scene().classList.contains('has-rainbow')).toBe(true);
    expect(scene().getAttribute('aria-label')).toBe('A sky: the sun is out, it is raining, the wind is blowing, and there is a rainbow.');
    expect($('.level-done').hidden).toBe(false);
  });

  it('makes a rainbow with sun and rain, and celebrates', () => {
    tap('rain');
    tap('sun');
    expect(scene().classList.contains('has-rainbow')).toBe(true);
    expect(scene().getAttribute('aria-label')).toBe('A sky: the sun is out, it is raining, and there is a rainbow.');
    expect($('.weather-controls').hidden).toBe(true);
    expect($('.level-done').hidden).toBe(false);
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('goes back to a cloudy sky on Play again', () => {
    tap('rain');
    tap('sun');
    $('.level-done [data-restart]').click();
    expect(scene().getAttribute('class')).toBe('sky-scene');
    expect($('.weather-controls').hidden).toBe(false);
    expect($('.level-done').hidden).toBe(true);
  });

  it('has a way back to the levels', () => {
    expect($('header a.round-button').getAttribute('href')).toBe('./levels.html');
  });
});
