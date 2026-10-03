// Draws Level 8 (Fix the rainbow) on fix-the-rainbow.html and handles the
// taps. The rules live in fix-the-rainbow.js.
import './components.js'; // the shared page pieces (header, helper, ...)
import { colorById } from './colors.js';
import { isFixed, message, newRainbow, tapStripe } from './fix-the-rainbow.js';
import { ORDINALS, onTap } from './page-helpers.js';

export function start(doc = document, { random = Math.random } = {}) {
  const picture = doc.querySelector('.fix-rainbow');
  const stripes = [...doc.querySelectorAll('.fix-stripe')];
  const highlight = doc.querySelector('.fix-highlight');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let rainbow;

  function draw(result) {
    const fixed = isFixed(rainbow);
    stripes.forEach((stripe, i) => {
      const color = colorById(rainbow.order[i]);
      stripe.setAttribute('fill', color.hex);
      stripe.classList.toggle('is-selected', rainbow.selected === i);
      stripe.setAttribute('aria-label', `${ORDINALS[i]} stripe, ${color.name.toLowerCase()}`);
      stripe.setAttribute('aria-pressed', String(rainbow.selected === i));
      stripe.setAttribute('tabindex', fixed ? '-1' : '0');
    });
    const picked = rainbow.selected === null ? null : stripes[rainbow.selected];
    highlight.toggleAttribute('hidden', !picked); // an SVG element has no .hidden property
    highlight.setAttribute('d', picked ? picked.getAttribute('d') : '');
    helper.textContent = message(rainbow, result);
    picture.classList.toggle('is-fixed', fixed);
    helperBox.hidden = fixed;
    done.hidden = !fixed;
    if (fixed) done.querySelector('h2').focus();
  }

  function tap(i) {
    const turn = tapStripe(rainbow, i);
    if (turn.result === 'used') return;
    rainbow = turn.rainbow;
    draw(turn.result);
  }

  stripes.forEach((stripe, i) => {
    onTap(stripe, () => tap(i));
  });

  function restart() {
    rainbow = newRainbow(random);
    draw();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current rainbow.
  return { get rainbow() { return rainbow; } };
}
