// Draws Level 6 (Rainbow road) on rainbow-road.html and handles the taps.
// The rules live in rainbow-road.js; where the car drives on the roundabout
// lives in rainbow-road-route.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { colorById } from './colors.js';
import { onTap, wiggle } from './page-helpers.js';
import { isDone, message, newTrip, pick, turn } from './rainbow-road.js';
import { START, carTransform, poseAt, route, turnToward } from './rainbow-road-route.js';

const SPEED = 0.5; // picture units per millisecond
const TURN_RATE = 0.5; // the most the car turns, in degrees per millisecond

const PARKED = { ...START, heading: 0 };

// Drives the car along a route one animation frame at a time, calling
// `show` with each pose, then `done` at the end. The car's heading follows
// the road but turns at a limited rate, so it swings smoothly into and out of
// the ring. With reduced motion on, it skips straight to the end.
function animateDrive(r, show, done) {
  const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    show(poseAt(r, r.length));
    setTimeout(done, 250);
    return;
  }
  let heading = 0;
  let begun = null;
  let last = null;
  const frame = (now) => {
    begun ??= now;
    const step = last === null ? 0 : now - last;
    last = now;
    const distance = (now - begun) * SPEED;
    const pose = poseAt(r, distance);
    heading = turnToward(heading, pose.heading, TURN_RATE * step);
    show({ ...pose, heading });
    if (distance >= r.length) done();
    else requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

export function start(doc = document, { random = Math.random, animate = animateDrive } = {}) {
  const scene = doc.querySelector('.road-scene');
  const roads = [...doc.querySelectorAll('.road')];
  const car = doc.querySelector('.car');
  const progress = doc.querySelector('.progress-pill');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let trip;
  let driving = false;
  let tripNumber = 0; // so a drive from before Start over can't finish later

  function drawTurn() {
    const t = turn(trip);
    roads.forEach((road, i) => {
      const color = colorById(t.roads[i]);
      road.dataset.color = color.id;
      road.querySelector('.road-surface').setAttribute('stroke', color.hex);
      road.querySelector('.road-label').textContent = color.name;
      road.setAttribute('aria-label', `${color.name} road`);
      road.classList.remove('is-wrong');
    });
    progress.textContent = `Turn ${trip.index + 1} of ${trip.turns.length}`;
  }

  function draw(result, picked) {
    const finished = isDone(trip);
    if (!finished && result !== 'wrong') drawTurn(); // a wrong pick keeps the same turn
    helper.textContent = message(trip, result, picked);
    scene.classList.toggle('is-done', finished);
    helperBox.hidden = finished;
    done.hidden = !finished;
    for (const road of roads) road.setAttribute('tabindex', finished ? '-1' : '0');
    if (finished) {
      progress.textContent = `Turn ${trip.turns.length} of ${trip.turns.length}`;
      done.querySelector('h2').focus();
    }
  }

  function park() {
    car.setAttribute('transform', carTransform(PARKED));
  }

  // The car drives up into the roundabout, around the ring and out of the
  // exit it took, then pulls up at the bottom again for the next one.
  function drive(exitIndex, then) {
    const thisTrip = tripNumber;
    const stale = () => thisTrip !== tripNumber;
    driving = true;
    car.classList.add('is-driving');
    const show = (pose) => { if (!stale()) car.setAttribute('transform', carTransform(pose)); };
    animate(route(exitIndex), show, () => {
      if (stale()) return;
      car.classList.remove('is-driving');
      park();
      driving = false;
      then();
    });
  }

  roads.forEach((road, i) => {
    const tap = () => {
      if (driving || isDone(trip)) return;
      const id = road.dataset.color;
      const move = pick(trip, id);
      if (move.result === 'wrong') {
        wiggle(road);
        draw('wrong', id);
        return;
      }
      trip = move.trip;
      helper.textContent = 'Vroom!';
      drive(i, () => draw(move.result));
    };
    onTap(road, tap);
  });

  function restart() {
    tripNumber += 1;
    trip = newTrip(random);
    driving = false;
    car.classList.remove('is-driving');
    park();
    draw();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current trip.
  return { get trip() { return trip; } };
}
