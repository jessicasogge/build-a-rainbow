// Draws Level 11 (Bubble pop) on bubble-pop.html: bubbles float up the sky
// and pop when tapped. The rules live in bubble-pop.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { colorById } from './colors.js';
import { wiggle } from './page-helpers.js';
import { POPS, ROUNDS, bubbleColor, isDone, message, newGame, pop, target } from './bubble-pop.js';

export const SPAWN_EVERY = 700; // a new bubble this often, in milliseconds
export const MAX_BUBBLES = 10; // no more than this many in the sky at once
const START_BUBBLES = 6; // already floating when the level starts
const POP_TIME = 350; // how long a pop takes to fade, in milliseconds
const LANES = 5; // bubbles rise in lanes across the sky, so they don't overlap
const ROWS = 3; // with less motion they sit still, each in its own slot of a 5 × 3 grid

export function start(doc = document, { random = Math.random } = {}) {
  const sky = doc.querySelector('.bubble-sky');
  const counter = doc.querySelector('.pop-count');
  const rainbow = doc.querySelector('rainbow-stripes');
  const progress = doc.querySelector('.progress-pill');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');
  const win = doc.defaultView;

  let game;
  let spawner = 0;
  let timers = [];
  let recentLanes = []; // the last lanes used, so the next bubble goes elsewhere

  const bubbles = () => [...sky.querySelectorAll('.bubble:not(.is-popped)')];
  const later = (fn, ms) => timers.push(win.setTimeout(fn, ms));

  // A new bubble at a random spot along the bottom. `head` starts it part
  // way up, so the sky isn't empty when the level begins.
  function spawn(head = 0) {
    if (isDone(game) || bubbles().length >= MAX_BUBBLES) return;
    // Always keep at least one bubble of the color called in the sky.
    const called = target(game);
    const color = bubbles().some((b) => b.dataset.color === called) ? bubbleColor(game, random) : called;
    const time = 7 + random() * 3; // seconds to float up

    // Sized to the sky: about a sixth of its width, so they fit on a phone.
    const width = sky.clientWidth || 360;
    const size = Math.round(Math.min(100, Math.max(52, width * 0.16)) * (0.85 + random() * 0.25));
    // A free slot, in a lane the last two bubbles didn't use.
    const taken = bubbles().map((b) => Number(b.dataset.slot));
    const open = [...Array(LANES * ROWS).keys()].filter((slot) => !taken.includes(slot));
    const fresh = open.filter((slot) => !recentLanes.includes(slot % LANES));
    const choices = fresh.length ? fresh : open;
    if (!choices.length) return;
    const slot = choices[Math.floor(random() * choices.length)];
    const lane = slot % LANES;
    recentLanes = [lane, ...recentLanes].slice(0, 2);
    // Lanes are at least a bubble wide, so bubbles in side-by-side lanes
    // never overlap; any room left over moves a bubble a little within its lane.
    const laneWidth = Math.max(size, width / LANES);
    const x = Math.min(lane * (width - size) / (LANES - 1) + random() * (laneWidth - size), width - size);
    const bubble = doc.createElement('button');
    bubble.type = 'button';
    bubble.className = 'bubble';
    bubble.dataset.color = color;
    bubble.dataset.slot = slot;
    bubble.setAttribute('aria-label', `${colorById(color).name} bubble`);
    bubble.style.setProperty('--color', colorById(color).hex);
    bubble.style.setProperty('--x', `${Math.round(x)}px`);
    bubble.style.setProperty('--y', `${4 + Math.floor(slot / LANES) * 32}%`);
    bubble.style.setProperty('--size', `${size}px`);
    bubble.style.setProperty('--time', `${time.toFixed(2)}s`);
    bubble.style.setProperty('--delay', `${(-head * time).toFixed(2)}s`);
    bubble.innerHTML = '<span class="bubble-ball"></span>';
    bubble.addEventListener('click', () => tap(bubble));
    sky.append(bubble);
    later(() => bubble.remove(), (1 - head) * time * 1000);
  }

  function tap(bubble) {
    if (bubble.classList.contains('is-popped') || isDone(game)) return;
    const color = bubble.dataset.color;
    const turn = pop(game, color);
    game = turn.game;
    if (turn.result === 'wrong') {
      wiggle(bubble.querySelector('.bubble-ball'));
    } else {
      bubble.classList.add('is-popped');
      bubble.disabled = true;
      later(() => bubble.remove(), POP_TIME);
    }
    draw(turn.result, color);
  }

  function draw(result, color) {
    helper.textContent = message(game, result, color);
    const finished = isDone(game);
    progress.textContent = `Color ${Math.min(game.round + 1, ROUNDS)} of ${ROUNDS}`;

    // A dot for each pop to go, filled in the color called as they're popped.
    if (!finished) {
      counter.style.setProperty('--target', colorById(target(game)).hex);
      [...counter.children].forEach((dot, i) => dot.classList.toggle('is-filled', i < game.popped));
      counter.setAttribute('aria-label', `${game.popped} of ${POPS} popped`);
    }

    sky.hidden = finished;
    counter.hidden = finished;
    helperBox.hidden = finished;
    rainbow.hidden = !finished;
    done.hidden = !finished;
    if (finished) {
      stop();
      done.querySelector('h2').focus();
    }
  }

  function stop() {
    win.clearInterval(spawner);
    timers.forEach((t) => win.clearTimeout(t));
    timers = [];
    sky.replaceChildren();
  }

  function restart() {
    stop();
    recentLanes = [];
    game = newGame(random);
    counter.replaceChildren(...Array.from({ length: POPS }, () => doc.createElement('span')));
    draw();
    for (let i = 0; i < START_BUBBLES; i++) spawn((i + 1) / (START_BUBBLES + 1));
    spawner = win.setInterval(() => spawn(), SPAWN_EVERY);
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current game.
  return { get game() { return game; } };
}
