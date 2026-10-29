// Draws Level 16 (Rainbow puzzle) on rainbow-puzzle.html and handles the
// taps and drags. Tap a piece, then the spot where it goes, or drag it
// there. The rules live in rainbow-puzzle.js.
import { stripePath } from './components.js'; // and the shared page pieces (header, helper, ...)
import { COLORS, colorById } from './colors.js';
import { wiggle } from './page-helpers.js';
import { coneSvg, faceSvg } from './ice-cream-page.js';
import { SCENE_ART } from './spot-the-difference-page.js';
import { SCENES } from './spot-the-difference.js';
import {
  PUZZLES, currentPuzzle, isDone, isLastPuzzle, isPuzzleDone, message, newGame, nextPuzzle, pieceCount, place,
} from './rainbow-puzzle.js';

const SKY = '#DDF2FF';
const GRASS = '#8FD19E';
const cloud = (x, y, s = 1) => `
  <g fill="#fff" transform="translate(${x} ${y}) scale(${s})">
    <circle cx="0" cy="0" r="22" /><circle cx="28" cy="-12" r="28" /><circle cx="58" cy="0" r="21" /><rect x="-14" y="0" width="90" height="20" rx="10" />
  </g>`;
const flower = (x, y, fill) => `
  <path d="M${x} ${y + 6}v24" stroke="#2E8A6E" stroke-width="4" stroke-linecap="round" />
  ${Array.from({ length: 5 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    return `<circle cx="${(x + 9 * Math.cos(a)).toFixed(1)}" cy="${(y + 9 * Math.sin(a)).toFixed(1)}" r="8" fill="${fill}" />`;
  }).join('')}
  <circle cx="${x}" cy="${y}" r="6" fill="#7A4A22" />`;
// An inner picture (an <svg> string) put at x, y, w × h in a bigger one.
const at = (svg, x, y, w, h) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
const hex = (id) => colorById(id).hex;

// The pictures, each in its own box (`width` × `height`).
export const PICTURES = {
  // A big rainbow from cloud to cloud, with the sun and flowers.
  rainbow: {
    label: 'a rainbow over the hills',
    width: 600,
    height: 400,
    art: `
      <rect width="600" height="400" fill="${SKY}" />
      <circle cx="520" cy="74" r="40" fill="#FFD23F" />
      ${COLORS.map((c, i) => `<path d="${stripePath(i, { cx: 300, base: 330, outer: 250, inner: 112 })}" fill="${c.hex}" />`).join('')}
      <path d="M0 316Q150 290 300 312T600 306V400H0Z" fill="${GRASS}" />
      <path d="M0 360Q200 340 360 358T600 350V400H0Z" fill="#7CC59A" />
      ${cloud(28, 318, 1.1)}${cloud(500, 318, 1.1)}
      ${flower(250, 352, hex('red'))}${flower(300, 362, hex('yellow'))}${flower(350, 352, hex('purple'))}
      <path d="M96 120q10-10 20 0q10-10 20 0" fill="none" stroke="#1B2A4A" stroke-width="4" stroke-linecap="round" />`,
  },
  // Three customers from the Ice cream shop with their cones.
  'ice-cream': {
    label: 'a bunny, a unicorn and a puppy with ice cream cones',
    width: 600,
    height: 400,
    art: `
      <rect width="600" height="400" fill="${SKY}" />
      ${COLORS.map((c, i) => `<path d="${stripePath(i, { cx: 300, base: 330, outer: 290, inner: 200 })}" fill="${c.hex}" opacity="0.8" />`).join('')}
      ${cloud(40, 70, 0.8)}${cloud(470, 50, 0.8)}
      <rect y="320" width="600" height="80" fill="#F4A6C4" />
      <rect y="320" width="600" height="14" fill="#E68AB0" />
      ${[['bunny', 110, ['green', 'yellow', 'red']], ['unicorn', 300, ['purple', 'blue', 'green']], ['puppy', 490, ['orange', 'red', 'yellow']]]
        .map(([id, x, scoops]) => `
          ${at(faceSvg(id, { happy: true }), x - 75, 96, 150, 150)}
          ${at(coneSvg(scoops, { sprinkles: true, fit: true }), x - 40, 196, 80, 136)}`).join('')}`,
  },
  // The park from Spot the difference.
  park: {
    label: 'a park with a balloon, a kite and a slide',
    width: 640,
    height: 320,
    art: (() => {
      const { things } = SCENES.find((s) => s.id === 'park');
      const { back, things: art } = SCENE_ART.park;
      return back + Object.entries(art).map(([id, t]) => t.draw(hex(things[id]))).join('');
    })(),
  },
};

// The part of a picture that's piece `i` of `puzzle`, as an <svg>.
export function pieceSvg(puzzle, i) {
  const { width, height, art } = PICTURES[puzzle.id];
  const w = width / puzzle.cols;
  const h = height / puzzle.rows;
  const x = (i % puzzle.cols) * w;
  const y = Math.floor(i / puzzle.cols) * h;
  return `<svg viewBox="${x} ${y} ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">${art}</svg>`;
}

export function start(doc = document, { random = Math.random } = {}) {
  const board = doc.querySelector('.puzzle-board');
  const tray = doc.querySelector('.puzzle-tray');
  const progress = doc.querySelector('.progress-pill');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const nextButton = doc.querySelector('#next');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let game;
  let picked = null; // the piece tapped, waiting for a spot
  let spots = [];
  let drag = null; // where a drag started, while one is going on

  // The board for a new puzzle: a faint picture to follow, and a spot for
  // each piece on top of it.
  function setUpPuzzle() {
    const puzzle = currentPuzzle(game);
    const { width, height, art, label } = PICTURES[puzzle.id];
    board.style.setProperty('--cols', puzzle.cols);
    board.style.setProperty('--rows', puzzle.rows);
    board.style.setProperty('--aspect', width / height);
    board.setAttribute('aria-label', `Puzzle of ${label}`);
    board.innerHTML = `<svg class="puzzle-guide" viewBox="0 0 ${width} ${height}" aria-hidden="true">${art}</svg>`;
    spots = Array.from({ length: pieceCount(puzzle) }, (_, i) => {
      const spot = doc.createElement('button');
      spot.type = 'button';
      spot.className = 'puzzle-spot';
      spot.dataset.spot = i;
      spot.addEventListener('click', () => {
        if (picked === null) {
          if (game.placed.includes(i)) return;
          draw('pick');
          [...tray.children].forEach(wiggle);
          return;
        }
        putIn(picked, i);
      });
      return spot;
    });
    board.append(...spots);
    picked = null;
    draw();
  }

  function draw(result, piece) {
    const puzzle = currentPuzzle(game);
    spots.forEach((spot, i) => {
      const filled = game.placed.includes(i);
      if (filled && !spot.firstChild) {
        spot.innerHTML = pieceSvg(puzzle, i);
        spot.classList.toggle('is-new', i === piece);
      }
      spot.classList.toggle('is-filled', filled);
      spot.setAttribute('aria-label', `Row ${Math.floor(i / puzzle.cols) + 1}, spot ${(i % puzzle.cols) + 1}${filled ? ', done' : ''}`);
    });

    // The tray: the pieces left, in their shuffled order.
    tray.replaceChildren(...game.tray.map((p, n) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'puzzle-piece';
      button.dataset.piece = p;
      button.setAttribute('aria-pressed', String(p === picked));
      button.setAttribute('aria-label', `Piece ${n + 1}`);
      button.innerHTML = pieceSvg(puzzle, p);
      button.addEventListener('click', () => {
        if (button.dataset.dragged) return; // a drag just ended, not a tap
        picked = picked === p ? null : p;
        draw();
        tray.querySelector(`[data-piece="${p}"]`).focus();
      });
      startDrag(button, p);
      return button;
    }));
    tray.style.setProperty('--aspect', PICTURES[puzzle.id].width / puzzle.cols / (PICTURES[puzzle.id].height / puzzle.rows));
    board.classList.toggle('is-picking', picked !== null);

    helper.textContent = message(game, result);
    progress.textContent = `Puzzle ${game.puzzle + 1} of ${PUZZLES.length}`;

    const finished = isDone(game);
    tray.hidden = isPuzzleDone(game);
    nextButton.hidden = !isPuzzleDone(game) || isLastPuzzle(game);
    board.classList.toggle('is-done', isPuzzleDone(game));
    board.classList.toggle('is-final', finished);
    helperBox.hidden = finished;
    done.hidden = !finished;
    if (finished) done.querySelector('h2').focus();
    else if (result === 'puzzle') nextButton.focus();
  }

  function putIn(piece, spot) {
    const turn = place(game, piece, spot);
    game = turn.game;
    if (turn.result === 'wrong') {
      draw('wrong');
      wiggle(spots[spot]);
      const button = tray.querySelector(`[data-piece="${piece}"]`);
      if (button) wiggle(button);
      return;
    }
    picked = null;
    draw(turn.result, piece);
  }

  // The empty spot under the point (x, y) on the screen, if any.
  const spotAt = (x, y) => spots.findIndex((spot) => {
    const r = spot.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  });

  // Dragging a piece from the tray onto the board.
  function startDrag(button, piece) {
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      drag = { button, piece, x: event.clientX, y: event.clientY, moved: false };
      button.setPointerCapture?.(event.pointerId);
    });
    button.addEventListener('pointermove', (event) => {
      if (drag?.button !== button) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 8) return; // still a tap
      drag.moved = true;
      button.classList.add('is-dragging');
      button.style.transform = `translate(${dx}px, ${dy}px)`;
      const over = spotAt(event.clientX, event.clientY);
      spots.forEach((s, i) => s.classList.toggle('is-over', i === over));
    });
    const end = (event, dropIt) => {
      if (drag?.button !== button) return;
      const { moved } = drag;
      drag = null;
      button.classList.remove('is-dragging');
      button.style.transform = '';
      spots.forEach((s) => s.classList.remove('is-over'));
      if (!moved) return;
      button.dataset.dragged = 'true'; // so the click that follows isn't a tap
      setTimeout(() => delete button.dataset.dragged, 0);
      const spot = dropIt ? spotAt(event.clientX, event.clientY) : -1;
      if (spot >= 0) putIn(piece, spot);
    };
    button.addEventListener('pointerup', (event) => end(event, true));
    button.addEventListener('pointercancel', (event) => end(event, false));
  }

  nextButton.addEventListener('click', () => {
    game = nextPuzzle(game, random);
    setUpPuzzle();
    tray.querySelector('button')?.focus();
  });

  function restart() {
    game = newGame(random);
    setUpPuzzle();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current game and the piece picked.
  return {
    get game() { return game; },
    get picked() { return picked; },
  };
}
