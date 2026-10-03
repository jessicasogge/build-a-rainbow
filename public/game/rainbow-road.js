// Level 6, Rainbow road: drive a little car through a roundabout with three
// colored exits. The helper says which color road to take; tap it to drive
// on. There are six turns, one for each rainbow color, and the trip ends at a
// pot of gold at the end of the rainbow.
//
// This file is only the rules. It doesn't touch the page, so the tests can
// play it directly. rainbow-road-page.js draws it and handles the taps.
import { COLOR_IDS, colorById } from './colors.js';
import { shuffle } from './shuffle.js';

export const ROADS_PER_TURN = 3;

const colorName = (id) => colorById(id).name;

// A new trip: one turn per rainbow color, in a random order. Each turn has
// three roads: the color to take, and two others, in a random order.
// `random` is there so tests can pass their own.
export function newTrip(random = Math.random) {
  const turns = shuffle(COLOR_IDS, random).map((target) => {
    const others = shuffle(COLOR_IDS.filter((id) => id !== target), random).slice(0, ROADS_PER_TURN - 1);
    return { target, roads: shuffle([target, ...others], random) };
  });
  return { turns, index: 0 };
}

// The turn the car is at now (null once the trip is over).
export function turn(trip) {
  return trip.turns[trip.index] ?? null;
}

export function isDone(trip) {
  return trip.index >= trip.turns.length;
}

// Tap a road. Returns the new trip and what happened:
//   'right' – that's the road to take; the car drives on to the next turn
//   'done'  – right, and it was the last turn; the car reaches the pot of gold
//   'wrong' – not that road; the car stays put
//   'used'  – the trip is already over; nothing changes
export function pick(trip, id) {
  colorName(id); // unknown colors are a mistake in the page, not a wrong road
  if (isDone(trip)) return { trip, result: 'used' };
  if (!turn(trip).roads.includes(id)) throw new Error(`There's no ${id} road at this turn`);
  if (id !== turn(trip).target) return { trip, result: 'wrong' };
  const next = { ...trip, index: trip.index + 1 };
  return { trip: next, result: isDone(next) ? 'done' : 'right' };
}

// What the helper says. Short, so a new reader can manage it.
// `picked` is the road that was just tapped, for a wrong pick.
export function message(trip, result, picked) {
  if (isDone(trip)) return 'You made it to the end of the rainbow!';
  const target = colorName(turn(trip).target).toLowerCase();
  if (result === 'wrong') return `That's the ${colorName(picked).toLowerCase()} road. Find the ${target} one!`;
  if (result === 'right') return `Vroom! Now take the ${target} road!`;
  return `Take the ${target} road!`;
}
