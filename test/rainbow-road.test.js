// The rules of Level 6, Rainbow road.
import { describe, expect, it } from 'vitest';
import { COLORS } from '../public/game/color-order.js';
import { ROADS_PER_FORK, fork, isDone, message, newTrip, pick } from '../public/game/rainbow-road.js';

const ids = COLORS.map((c) => c.id);
const right = (trip) => pick(trip, fork(trip).target);
const wrongId = (trip) => fork(trip).roads.find((id) => id !== fork(trip).target);

describe('newTrip', () => {
  it('has one fork for each rainbow color', () => {
    const trip = newTrip();
    expect(trip.forks.map((f) => f.target).sort()).toEqual([...ids].sort());
    expect(trip.index).toBe(0);
  });

  it('gives every fork three different roads, including the one to take', () => {
    for (const f of newTrip().forks) {
      expect(f.roads).toHaveLength(ROADS_PER_FORK);
      expect(new Set(f.roads).size).toBe(ROADS_PER_FORK);
      expect(f.roads).toContain(f.target);
    }
  });

  it('shuffles with the random numbers it is given', () => {
    const a = newTrip(() => 0);
    const b = newTrip(() => 0);
    expect(a).toEqual(b);
  });
});

describe('pick', () => {
  it('drives on with the right road', () => {
    const { trip, result } = right(newTrip());
    expect(result).toBe('right');
    expect(trip.index).toBe(1);
  });

  it('stays put with the wrong road', () => {
    const start = newTrip();
    const { trip, result } = pick(start, wrongId(start));
    expect(result).toBe('wrong');
    expect(trip).toBe(start);
  });

  it('reaches the end after six right roads', () => {
    let trip = newTrip();
    const results = [];
    for (let i = 0; i < ids.length; i++) {
      let result;
      ({ trip, result } = right(trip));
      results.push(result);
    }
    expect(results).toEqual(['right', 'right', 'right', 'right', 'right', 'done']);
    expect(isDone(trip)).toBe(true);
    expect(fork(trip)).toBeNull();
    expect(pick(trip, 'red').result).toBe('used');
  });

  it('refuses a road that is not at this fork, or a color that does not exist', () => {
    const trip = newTrip();
    const missing = ids.find((id) => !fork(trip).roads.includes(id));
    expect(() => pick(trip, missing)).toThrow();
    expect(() => pick(trip, 'pink')).toThrow();
  });
});

describe('message', () => {
  const trip = { forks: [{ target: 'yellow', roads: ['blue', 'yellow', 'red'] }, { target: 'green', roads: ['green', 'red', 'blue'] }], index: 0 };

  it('says which road to take', () => {
    expect(message(trip)).toBe('Take the yellow road!');
  });

  it('names the wrong road and the right color', () => {
    expect(message(trip, 'wrong', 'blue')).toBe("That's the blue road. Find the yellow one!");
  });

  it('cheers and gives the next color after a right road', () => {
    const { trip: next, result } = pick(trip, 'yellow');
    expect(message(next, result)).toBe('Vroom! Now take the green road!');
  });

  it('celebrates at the end', () => {
    expect(message({ ...trip, index: 2 })).toBe('You made it to the end of the rainbow!');
  });
});
