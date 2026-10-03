// Where the car drives on Rainbow road's roundabout, and which way it faces.
import { describe, expect, it } from 'vitest';
import { CENTER, EXITS, RADIUS, START, carTransform, poseAt, route, turnToward } from '../public/game/rainbow-road-route.js';

const close = (a, b) => expect(a).toBeCloseTo(b, 5);
const ring = (r) => r.pieces[1];

describe('route', () => {
  it('goes up the road, around the ring, and out of the exit', () => {
    const r = route(1);
    expect(r.pieces.map((p) => p.kind)).toEqual(['line', 'arc', 'line']);
    close(r.length, r.pieces.reduce((s, p) => s + p.length, 0));
  });

  it('goes counterclockwise: a quarter of the ring to the right exit, half to the top, three quarters to the left', () => {
    const sweeps = Object.fromEntries(EXITS.map((e, i) => [e.id, ring(route(i)).sweep]));
    expect(sweeps).toEqual({ right: 90, top: 180, left: 270 });
  });

  it('refuses an exit that does not exist', () => {
    expect(() => route(3)).toThrow();
  });
});

describe('poseAt', () => {
  it('starts where the car waits, pointing up', () => {
    expect(poseAt(route(0), 0)).toEqual({ ...START, heading: 0 });
  });

  it('joins the ring at the bottom, heading right', () => {
    const r = route(2);
    const p = poseAt(r, r.pieces[0].length);
    close(p.x, CENTER.x);
    close(p.y, CENTER.y + RADIUS);
    close(p.heading, 0); // still on the road in, pointing up
    const onRing = poseAt(r, r.pieces[0].length + 0.001);
    expect(onRing.heading).toBeCloseTo(90, 2);
  });

  it('turns as it goes around the ring: up on the right side, left across the top', () => {
    const r = route(0); // all the way round to the left exit
    const base = r.pieces[0].length;
    const quarter = ring(r).length / 3;
    const right = poseAt(r, base + quarter);
    close(right.x, CENTER.x + RADIUS);
    close(right.y, CENTER.y);
    close(right.heading, 0);
    const top = poseAt(r, base + quarter * 2);
    close(top.x, CENTER.x);
    close(top.y, CENTER.y - RADIUS);
    close(((top.heading % 360) + 360) % 360, 270);
  });

  it('ends out past the edge of the picture at the chosen exit', () => {
    EXITS.forEach((exit, i) => {
      const r = route(i);
      const end = poseAt(r, r.length + 100);
      close(end.x, exit.end.x);
      close(end.y, exit.end.y);
    });
  });

  it('points out of the exit when leaving: left, up or right', () => {
    const headings = EXITS.map((_, i) => {
      const r = route(i);
      return ((poseAt(r, r.length - 1).heading % 360) + 360) % 360;
    });
    headings.forEach((h, i) => close(h, [270, 0, 90][i]));
  });
});

describe('turnToward', () => {
  it('turns by no more than the step', () => {
    expect(turnToward(0, 90, 10)).toBe(10);
    expect(turnToward(0, -90, 10)).toBe(-10);
  });

  it('arrives once close enough', () => {
    expect(turnToward(85, 90, 10)).toBe(90);
  });

  it('turns the short way round', () => {
    expect(turnToward(350, 10, 5)).toBe(355);
    expect(turnToward(10, 350, 5)).toBe(5);
  });
});

describe('carTransform', () => {
  it('moves and turns the car', () => {
    expect(carTransform({ x: 300, y: 420, heading: 0 })).toBe('translate(300 420) rotate(0)');
    expect(carTransform({ x: 385.04, y: 250, heading: -45.06 })).toBe('translate(385 250) rotate(-45.1)');
  });
});
