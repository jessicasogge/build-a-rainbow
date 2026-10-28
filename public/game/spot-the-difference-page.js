// Draws Level 15 (Spot the difference) on spot-the-difference.html and
// handles the taps. The rules live in spot-the-difference.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { colorById } from './colors.js';
import { onTap, wiggle } from './page-helpers.js';
import {
  SCENES, colorOf, currentScene, isDone, isLastScene, isSceneDone, message, newGame, nextScene, tap, thingName,
} from './spot-the-difference.js';

// A tap this close to a thing's middle (in screen pixels) counts for it,
// even outside its tap area, like in I spy. If two are in reach, the
// closest wins.
export const REACH = 26;

const INK = '#1B2A4A';
const LEAF = '#3E9C77';
const STEM = '#2E8A6E';
const WOOD = '#9C6B3F';
const SKY = '<rect width="640" height="320" fill="#DDF2FF" />';
const sun = (x, y) => `<circle cx="${x}" cy="${y}" r="26" fill="#FFD23F" />`;
const cloud = (x, y) => `
  <g fill="#fff"><circle cx="${x}" cy="${y}" r="16" /><circle cx="${x + 20}" cy="${y - 8}" r="20" /><circle cx="${x + 42}" cy="${y}" r="15" /><rect x="${x - 10}" y="${y}" width="66" height="14" rx="7" /></g>`;
const petals = (x, y, r, fill, n = 5) => Array.from({ length: n }, (_, i) => {
  const a = (i * 2 * Math.PI) / n - Math.PI / 2;
  return `<circle cx="${(x + r * Math.cos(a)).toFixed(1)}" cy="${(y + r * Math.sin(a)).toFixed(1)}" r="${r * 0.85}" fill="${fill}" />`;
}).join('');
const birdAt = (x, y) => (fill) => `
  <ellipse cx="${x}" cy="${y}" rx="18" ry="13" fill="${fill}" />
  <path d="M${x - 4} ${y - 2}q8-16 18-6q-8 8-18 6z" fill="#fff" opacity="0.5" />
  <circle cx="${x + 10}" cy="${y - 4}" r="2.5" fill="${INK}" />
  <path d="M${x + 17} ${y - 3}l8 3l-8 3z" fill="#F77F00" />`;

// Each picture: what doesn't change, then where each thing is (its middle
// and tap-area size) and how it's drawn in a color.
export const SCENE_ART = {
  park: {
    label: 'a park',
    back: `${SKY}${sun(570, 50)}${cloud(90, 50)}
      <path d="M0 214Q160 194 320 210T640 206V320H0Z" fill="#8FD19E" />
      <rect x="52" y="140" width="16" height="84" rx="6" fill="${WOOD}" />
      <g fill="${LEAF}"><circle cx="60" cy="122" r="34" /><circle cx="34" cy="140" r="20" /><circle cx="86" cy="140" r="22" /></g>`,
    things: {
      balloon: { x: 200, y: 86, r: 34, draw: (fill) => `
        <path d="M200 106q-6 40 10 84" fill="none" stroke="${INK}" stroke-width="2" />
        <ellipse cx="200" cy="80" rx="21" ry="26" fill="${fill}" />
        <path d="M195 108h10l-5-6z" fill="${fill}" />
        <ellipse cx="192" cy="70" rx="5" ry="8" fill="#fff" opacity="0.45" />` },
      kite: { x: 330, y: 62, r: 34, draw: (fill) => `
        <path d="M330 94q-10 14 0 26q10 12 0 24" fill="none" stroke="${INK}" stroke-width="2" />
        <path d="M330 30L354 62L330 94L306 62Z" fill="${fill}" />
        <path d="M330 30V94M306 62H354" stroke="#fff" stroke-width="2" opacity="0.6" />` },
      bird: { x: 440, y: 76, r: 28, draw: birdAt(440, 76) },
      slide: { x: 500, y: 182, r: 46, draw: (fill) => `
        <path d="M534 136V246M554 136V246M534 166h20M534 196h20M534 226h20" stroke="#9AA8B8" stroke-width="5" stroke-linecap="round" />
        <path d="M534 136h-10L460 238h22z" fill="${fill}" stroke="${fill}" stroke-width="6" stroke-linejoin="round" />` },
      bench: { x: 360, y: 236, r: 38, draw: (fill) => `
        <path d="M334 238v22M386 238v22" stroke="#6B7A8C" stroke-width="5" stroke-linecap="round" />
        <rect x="326" y="208" width="68" height="12" rx="5" fill="${fill}" />
        <rect x="324" y="230" width="72" height="12" rx="5" fill="${fill}" />` },
      ball: { x: 270, y: 276, r: 30, draw: (fill) => `
        <circle cx="270" cy="276" r="19" fill="${fill}" />
        <path d="M253 270q17 8 34 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" />` },
      flower: { x: 130, y: 258, r: 30, draw: (fill) => `
        <path d="M130 266v34" stroke="${STEM}" stroke-width="4" stroke-linecap="round" />
        ${petals(130, 254, 10, fill)}<circle cx="130" cy="254" r="7" fill="#7A4A22" />` },
    },
  },
  garden: {
    label: 'a garden',
    back: `${SKY}${sun(600, 44)}${cloud(250, 40)}
      <path d="M0 230Q200 214 400 228T640 222V320H0Z" fill="#8FD19E" />
      <rect x="62" y="114" width="156" height="120" fill="#FFF6D6" stroke="#E2C98F" stroke-width="3" />
      <rect x="176" y="140" width="30" height="30" rx="4" fill="#BFE6FF" stroke="${WOOD}" stroke-width="4" />
      <rect x="566" y="140" width="16" height="96" rx="6" fill="${WOOD}" />
      <g fill="${LEAF}"><circle cx="574" cy="122" r="36" /><circle cx="546" cy="142" r="22" /><circle cx="604" cy="142" r="22" /></g>`,
    things: {
      roof: { x: 140, y: 86, r: 42, draw: (fill) => `
        <path d="M48 120L140 52L232 120Z" fill="${fill}" stroke="${fill}" stroke-width="6" stroke-linejoin="round" />` },
      door: { x: 120, y: 200, r: 32, draw: (fill) => `
        <rect x="100" y="166" width="40" height="68" rx="6" fill="${fill}" />
        <circle cx="131" cy="202" r="3.5" fill="#FFD23F" />` },
      bird: { x: 420, y: 70, r: 28, draw: birdAt(420, 70) },
      butterfly: { x: 320, y: 112, r: 30, draw: (fill) => `
        <ellipse cx="308" cy="104" rx="13" ry="11" fill="${fill}" /><ellipse cx="332" cy="104" rx="13" ry="11" fill="${fill}" />
        <ellipse cx="310" cy="122" rx="9" ry="8" fill="${fill}" /><ellipse cx="330" cy="122" rx="9" ry="8" fill="${fill}" />
        <rect x="317" y="96" width="6" height="32" rx="3" fill="${INK}" />` },
      can: { x: 290, y: 258, r: 34, draw: (fill) => `
        <path d="M304 246l30-18" stroke="${fill}" stroke-width="7" stroke-linecap="round" />
        <path d="M262 238q14-18 30 0" fill="none" stroke="${fill}" stroke-width="5" />
        <rect x="264" y="240" width="44" height="40" rx="8" fill="${fill}" />` },
      tulip: { x: 400, y: 252, r: 30, draw: (fill) => `
        <path d="M400 262v40M400 290q-12-4-14-14" fill="none" stroke="${STEM}" stroke-width="4" stroke-linecap="round" />
        <path d="M386 242l6 8l8-12l8 12l6-8v14q0 12-14 12t-14-12z" fill="${fill}" />` },
      daisy: { x: 490, y: 262, r: 30, draw: (fill) => `
        <path d="M490 272v32" stroke="${STEM}" stroke-width="4" stroke-linecap="round" />
        ${petals(490, 258, 10, fill, 6)}<circle cx="490" cy="258" r="7" fill="#FFD23F" />` },
      snail: { x: 590, y: 284, r: 30, draw: (fill) => `
        <path d="M568 300h46q8 0 6-8l-6-6" fill="#F3D3A8" stroke="#E2B88A" stroke-width="2" />
        <path d="M610 286l4-12M616 288l8-10" stroke="#E2B88A" stroke-width="2.5" stroke-linecap="round" />
        <circle cx="588" cy="284" r="17" fill="${fill}" />
        <path d="M588 284m-4 0a4 4 0 1 1 8 0a9 9 0 0 1-17 2a13 13 0 0 1 22-8" fill="none" stroke="#fff" stroke-width="2.5" opacity="0.7" />` },
    },
  },
  beach: {
    label: 'a beach',
    back: `${SKY}${sun(590, 46)}${cloud(300, 42)}
      <rect y="110" width="640" height="90" fill="#8ECAE6" />
      <path d="M40 130q12-5 24 0M210 150q12-5 24 0M380 128q12-5 24 0M560 160q12-5 24 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.7" />
      <path d="M0 196Q160 182 320 194T640 190V320H0Z" fill="#F6DFA4" />
      <path d="M440 140h76l-10 14h-56z" fill="${WOOD}" />`,
    things: {
      sail: { x: 484, y: 106, r: 36, draw: (fill) => `
        <path d="M476 62V140" stroke="${INK}" stroke-width="3" />
        <path d="M480 66L480 134L516 134Z" fill="${fill}" />
        <path d="M472 74L472 134L446 134Z" fill="${fill}" opacity="0.75" />` },
      fish: { x: 280, y: 166, r: 30, draw: (fill) => `
        <path d="M300 166l16-12v24z" fill="${fill}" />
        <ellipse cx="280" cy="166" rx="22" ry="13" fill="${fill}" />
        <circle cx="270" cy="162" r="2.5" fill="${INK}" />` },
      umbrella: { x: 110, y: 130, r: 42, draw: (fill) => `
        <path d="M110 112V262" stroke="${WOOD}" stroke-width="5" stroke-linecap="round" />
        <path d="M60 138a50 42 0 0 1 100 0q-12-8-25 0q-12-8-25 0q-12-8-25 0q-12-8-25 0z" fill="${fill}" />
        <path d="M110 96v42M88 102q-6 18-3 36M132 102q6 18 3 36" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.6" />` },
      towel: { x: 200, y: 272, r: 38, draw: (fill) => `
        <rect x="160" y="252" width="80" height="40" rx="5" fill="${fill}" transform="rotate(-6 200 272)" />
        <path d="M172 252v40M228 252v40" stroke="#fff" stroke-width="5" opacity="0.7" transform="rotate(-6 200 272)" />` },
      starfish: { x: 300, y: 296, r: 26, draw: (fill) => `
        <path d="M300 278l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill="${fill}" stroke="${fill}" stroke-width="4" stroke-linejoin="round" />` },
      bucket: { x: 380, y: 254, r: 32, draw: (fill) => `
        <path d="M362 236q18-26 36 0" fill="none" stroke="${INK}" stroke-width="2.5" />
        <path d="M358 236h44l-6 40h-32z" fill="${fill}" />
        <rect x="355" y="232" width="50" height="8" rx="4" fill="${fill}" />` },
      ball: { x: 470, y: 246, r: 28, draw: (fill) => `
        <circle cx="470" cy="246" r="20" fill="#fff" />
        <path d="M470 226a20 20 0 0 1 17 30l-17-10z" fill="${fill}" />
        <path d="M470 266a20 20 0 0 1-17-30l17 10z" fill="${fill}" />
        <circle cx="470" cy="246" r="20" fill="none" stroke="#E2C98F" stroke-width="2" />` },
      crab: { x: 570, y: 276, r: 32, draw: (fill) => `
        <path d="M548 280l-12 10M550 286l-10 14M592 280l12 10M590 286l10 14" stroke="${fill}" stroke-width="4" stroke-linecap="round" />
        <path d="M552 266l-14-16M588 266l14-16" stroke="${fill}" stroke-width="4" stroke-linecap="round" />
        <circle cx="536" cy="246" r="8" fill="${fill}" /><circle cx="604" cy="246" r="8" fill="${fill}" />
        <ellipse cx="570" cy="278" rx="24" ry="15" fill="${fill}" />
        <path d="M562 266v-10M578 266v-10" stroke="${fill}" stroke-width="3" />
        <circle cx="562" cy="254" r="4" fill="#fff" /><circle cx="578" cy="254" r="4" fill="#fff" />
        <circle cx="562" cy="254" r="2" fill="${INK}" /><circle cx="578" cy="254" r="2" fill="${INK}" />` },
    },
  },
};

// One copy of the picture. `second` is the copy with the changes.
function pictureSvg(game, second) {
  const scene = currentScene(game);
  const art = SCENE_ART[scene.id];
  const things = Object.entries(art.things).map(([id, t]) => {
    const color = colorOf(game, id, second);
    return `
      <g class="spot-thing" data-thing="${id}" role="button" tabindex="0" aria-label="${colorById(color).name.toLowerCase()} ${thingName(id)}">
        <circle class="spot-hit" cx="${t.x}" cy="${t.y}" r="${t.r}" />
        ${t.draw(colorById(color).hex)}
      </g>`;
  }).join('');
  return `<svg class="spot-picture" viewBox="0 0 640 320" role="group" aria-label="${second ? 'Second' : 'First'} picture of ${art.label}">${art.back}${things}</svg>`;
}

export function start(doc = document) {
  const pictures = doc.querySelector('.spot-pictures');
  const progress = doc.querySelector('.progress-pill');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const nextButton = doc.querySelector('#next');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let game;
  let things = [];

  function choose(id) {
    const turn = tap(game, id);
    game = turn.game;
    if (turn.result === 'same') things.filter((t) => t.dataset.thing === id).forEach(wiggle);
    draw(turn.result, id);
  }

  // Draws both copies of a new picture and hooks up the taps.
  function drawScene() {
    pictures.innerHTML = pictureSvg(game, false) + pictureSvg(game, true);
    things = [...pictures.querySelectorAll('.spot-thing')];
    things.forEach((t) => onTap(t, () => choose(t.dataset.thing)));
    // A tap near a thing, but not on it, counts for the closest.
    pictures.querySelectorAll('.spot-picture').forEach((svg) => svg.addEventListener('click', (event) => {
      if (event.target.closest('.spot-thing')) return; // that thing has it
      let nearest = null;
      let best = Infinity;
      for (const t of svg.querySelectorAll('.spot-thing')) {
        const r = t.querySelector('.spot-hit').getBoundingClientRect();
        const d = Math.hypot(event.clientX - (r.left + r.width / 2), event.clientY - (r.top + r.height / 2));
        if (d <= Math.max(r.width / 2, REACH) && d < best) {
          best = d;
          nearest = t;
        }
      }
      if (nearest) choose(nearest.dataset.thing);
    }));
    draw();
  }

  function draw(result, id) {
    things.forEach((t) => t.classList.toggle('is-found', game.found.includes(t.dataset.thing)));
    helper.textContent = message(game, result, id);
    progress.textContent = `Picture ${game.scene + 1} of ${SCENES.length}`;

    const finished = isDone(game);
    nextButton.hidden = !isSceneDone(game) || isLastScene(game);
    pictures.classList.toggle('is-solved', isSceneDone(game));
    pictures.classList.toggle('is-done', finished);
    helperBox.hidden = finished;
    done.hidden = !finished;
    if (finished) done.querySelector('h2').focus();
    else if (result === 'scene') nextButton.focus();
  }

  nextButton.addEventListener('click', () => {
    game = nextScene(game);
    drawScene();
  });

  function restart() {
    game = newGame();
    drawScene();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current game.
  return { get game() { return game; } };
}
