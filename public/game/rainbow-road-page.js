// Draws Level 6 (Rainbow road) on rainbow-road.html and handles the taps.
// The rules live in rainbow-road.js.
import { COLORS } from './color-order.js';
import { colorName, fork, isDone, message, newTrip, pick } from './rainbow-road.js';

// Where each of the three roads ends at the top of the picture, for the car
// to drive to. Matches the road shapes in rainbow-road.html.
const ROAD_ENDS = [
  { x: -200, y: -300 },
  { x: 0, y: -330 },
  { x: 200, y: -300 },
];
const DRIVE_MS = 700;

const hex = (id) => COLORS.find((c) => c.id === id).hex;

export function start(doc = document, { random = Math.random, wait = (fn) => setTimeout(fn, DRIVE_MS) } = {}) {
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

  function drawFork() {
    const f = fork(trip);
    roads.forEach((road, i) => {
      const id = f.roads[i];
      road.dataset.color = id;
      road.querySelector('.road-surface').setAttribute('stroke', hex(id));
      road.querySelector('.road-label').textContent = colorName(id);
      road.setAttribute('aria-label', `${colorName(id)} road`);
      road.classList.remove('is-wrong');
    });
    progress.textContent = `Fork ${trip.index + 1} of ${trip.forks.length}`;
  }

  function draw(result, picked) {
    const finished = isDone(trip);
    if (!finished && result !== 'wrong') drawFork(); // a wrong pick keeps the same fork
    helper.textContent = message(trip, result, picked);
    scene.classList.toggle('is-done', finished);
    helperBox.hidden = finished;
    done.hidden = !finished;
    for (const road of roads) road.setAttribute('tabindex', finished ? '-1' : '0');
    if (finished) {
      progress.textContent = `Fork ${trip.forks.length} of ${trip.forks.length}`;
      done.querySelector('h2').focus();
    }
  }

  function wiggle(road) {
    road.classList.remove('is-wrong');
    void road.getBoundingClientRect(); // restart the animation if it's already running
    road.classList.add('is-wrong');
  }

  // The car drives up the road it took, then comes back to the bottom for
  // the next fork.
  function drive(i, then) {
    driving = true;
    car.classList.add('is-driving');
    car.style.transform = `translate(${ROAD_ENDS[i].x}px, ${ROAD_ENDS[i].y}px)`;
    wait(() => {
      car.classList.remove('is-driving');
      car.style.transform = '';
      driving = false;
      then();
    });
  }

  roads.forEach((road, i) => {
    const tap = () => {
      if (driving || isDone(trip)) return;
      const id = road.dataset.color;
      const turn = pick(trip, id);
      if (turn.result === 'wrong') {
        wiggle(road);
        draw('wrong', id);
        return;
      }
      trip = turn.trip;
      helper.textContent = 'Vroom!';
      drive(i, () => draw(turn.result));
    };
    road.addEventListener('click', tap);
    // The roads are drawn shapes, so Enter and Space pick them too.
    road.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        tap();
      }
    });
  });

  function restart() {
    trip = newTrip(random);
    driving = false;
    car.classList.remove('is-driving');
    car.style.transform = '';
    draw();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current trip.
  return { get trip() { return trip; } };
}
