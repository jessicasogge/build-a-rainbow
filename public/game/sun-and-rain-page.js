// Draws Level 4 (Sun and rain) on sun-and-rain.html and handles the taps.
// The rules live in sun-and-rain.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { hasRainbow, message, newSky, toggle } from './sun-and-rain.js';

export function start(doc = document) {
  const scene = doc.querySelector('.sky-scene');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const controls = doc.querySelector('.weather-controls');
  const toggles = [...doc.querySelectorAll('[data-weather]')];
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let sky;

  function draw() {
    // The scene shows each kind of weather that's on, via classes on the
    // picture: .has-sun, .has-rain, .has-snow, .has-clouds and .has-rainbow.
    for (const id of Object.keys(sky)) scene.classList.toggle(`has-${id}`, sky[id]);
    const rainbow = hasRainbow(sky);
    scene.classList.toggle('has-rainbow', rainbow);
    scene.setAttribute('aria-label', describe(sky, rainbow));

    for (const button of toggles) {
      button.setAttribute('aria-pressed', String(sky[button.dataset.weather]));
    }
    helper.textContent = message(sky);

    controls.hidden = rainbow;
    helperBox.hidden = rainbow;
    done.hidden = !rainbow;
    if (rainbow) done.querySelector('h2').focus();
  }

  function restart() {
    sky = newSky();
    draw();
  }

  for (const button of toggles) {
    button.addEventListener('click', () => {
      sky = toggle(sky, button.dataset.weather);
      draw();
    });
  }
  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current sky.
  return { get sky() { return sky; } };
}

// The picture in words, for screen readers.
function describe(sky, rainbow) {
  const parts = [];
  if (sky.sun) parts.push('the sun is out');
  if (sky.rain) parts.push('it is raining');
  if (sky.snow) parts.push('it is snowing');
  if (sky.clouds) parts.push('thick clouds cover the sky');
  const weather = parts.length ? parts.join(', ') : 'grey, with one small cloud';
  return `A sky: ${weather}${rainbow ? ', and there is a rainbow' : ''}.`;
}
