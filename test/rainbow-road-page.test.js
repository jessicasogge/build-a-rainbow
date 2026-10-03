// Plays Level 6, Rainbow road, on the real page, in a pretend browser.
// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { COLORS } from '../public/game/color-order.js';
import { fork } from '../public/game/rainbow-road.js';
import { start } from '../public/game/rainbow-road-page.js';
import { poseAt } from '../public/game/rainbow-road-route.js';

const html = readFileSync(join(process.cwd(), 'public/rainbow-road.html'), 'utf8');

let level;
let pending; // the car's drive, held until the test lets it finish
const $ = (sel) => document.querySelector(sel);
const roads = () => [...document.querySelectorAll('.road')];
const road = (id) => roads().find((r) => r.dataset.color === id);
const tap = (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
const target = () => fork(level.trip).target;
const wrong = () => roads().map((r) => r.dataset.color).find((id) => id !== target());
const arrive = () => { const fn = pending; pending = null; fn(); };
const driveRight = () => { tap(road(target())); arrive(); };

beforeEach(() => {
  document.documentElement.innerHTML = new DOMParser().parseFromString(html, 'text/html').documentElement.innerHTML;
  pending = null;
  // Show the car halfway along its route, then hold the end of the drive
  // until the test lets it arrive.
  level = start(document, {
    animate: (r, show, done) => {
      show(poseAt(r, r.length / 2));
      pending = done;
    },
  });
});

describe('rainbow road page', () => {
  it('is level 6 and starts at the first of six turns', () => {
    expect($('.level-title').textContent).toBe('Level 6 · Rainbow road');
    expect($('.progress-pill').textContent).toBe('Turn 1 of 6');
    expect(roads()).toHaveLength(3);
  });

  it('colors and labels each road, and asks for one of them', () => {
    for (const r of roads()) {
      const color = COLORS.find((c) => c.id === r.dataset.color);
      expect(r.querySelector('.road-surface').getAttribute('stroke')).toBe(color.hex);
      expect(r.querySelector('.road-label').textContent).toBe(color.name);
      expect(r.getAttribute('aria-label')).toBe(`${color.name} road`);
    }
    const name = COLORS.find((c) => c.id === target()).name.toLowerCase();
    expect($('.helper-text').textContent).toBe(`Take the ${name} road!`);
  });

  it('wiggles a wrong road and stays at the same turn', () => {
    const id = wrong();
    tap(road(id));
    expect(road(id).classList.contains('is-wrong')).toBe(true);
    expect($('.progress-pill').textContent).toBe('Turn 1 of 6');
    expect(pending).toBeNull();
  });

  it('has three exits off a roundabout: left, top and right', () => {
    expect(roads().map((r) => r.dataset.exit)).toEqual(['left', 'top', 'right']);
    expect($('.roundabout .island')).not.toBeNull();
  });

  it('drives the car around the roundabout, then parks it for the next turn', () => {
    const parked = $('.car').getAttribute('transform');
    expect(parked).toBe('translate(300 420) rotate(0)');
    tap(road(target()));
    expect($('.car').classList.contains('is-driving')).toBe(true);
    expect($('.car').getAttribute('transform')).not.toBe(parked);
    arrive();
    expect($('.car').classList.contains('is-driving')).toBe(false);
    expect($('.car').getAttribute('transform')).toBe(parked);
    expect($('.progress-pill').textContent).toBe('Turn 2 of 6');
    expect($('.helper-text').textContent).toMatch(/^Vroom! Now take the \w+ road!$/);
  });

  it('ignores taps while the car is driving', () => {
    tap(road(target()));
    const index = level.trip.index;
    for (const r of roads()) tap(r);
    expect(level.trip.index).toBe(index);
  });

  it('works with the keyboard too', () => {
    road(target()).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    arrive();
    expect($('.progress-pill').textContent).toBe('Turn 2 of 6');
  });

  it('reaches the pot of gold after six forks', () => {
    for (let i = 0; i < 6; i++) driveRight();
    expect($('.road-scene').classList.contains('is-done')).toBe(true);
    expect($('.level-done').hidden).toBe(false);
    expect($('.helper').hidden).toBe(true);
    expect(document.activeElement).toBe($('.level-done h2'));
  });

  it('forgets a drive that was still going when Start over was tapped', () => {
    tap(road(target()));
    const oldArrival = pending;
    $('header [data-restart]').click();
    oldArrival();
    expect($('.progress-pill').textContent).toBe('Turn 1 of 6');
    expect($('.car').getAttribute('transform')).toBe('translate(300 420) rotate(0)');
    expect(level.trip.index).toBe(0);
  });

  it('starts a new trip on Drive again', () => {
    for (let i = 0; i < 6; i++) driveRight();
    $('.level-done [data-restart]').click();
    expect($('.road-scene').classList.contains('is-done')).toBe(false);
    expect($('.progress-pill').textContent).toBe('Turn 1 of 6');
    expect($('.level-done').hidden).toBe(true);
  });
});
