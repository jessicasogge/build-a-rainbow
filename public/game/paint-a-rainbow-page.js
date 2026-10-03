// Draws Level 5 (Paint a rainbow) on paint-a-rainbow.html and handles the
// taps. The rules live in paint-a-rainbow.js.
import { PAINTS, chooseBrush, isFinished, message, newPainting, paintColor, paintStripe } from './paint-a-rainbow.js';

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

export function start(doc = document) {
  const rainbow = doc.querySelector('.paint-rainbow');
  const stripes = [...doc.querySelectorAll('.paint-stripe')];
  const palette = doc.querySelector('.palette');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const doneButton = doc.querySelector('#done');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let painting;
  let finishedShown = false;

  // One button per paint. The one on the brush is pressed.
  const paints = PAINTS.map((paint) => {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'paint';
    button.dataset.paint = paint.id;
    button.setAttribute('aria-label', paint.name);
    button.style.setProperty('--paint', paint.hex);
    button.addEventListener('click', () => {
      painting = chooseBrush(painting, paint.id);
      draw();
    });
    palette.append(button);
    return button;
  });

  function draw() {
    stripes.forEach((stripe, i) => {
      const id = painting.stripes[i];
      stripe.setAttribute('fill', id ? paintColor(id).hex : '#ffffff');
      stripe.classList.toggle('is-painted', Boolean(id));
      const where = `${ORDINALS[i]} stripe`;
      stripe.setAttribute('aria-label', id ? `${where}, ${paintColor(id).name.toLowerCase()}` : `${where}, not painted yet`);
    });
    for (const button of paints) {
      button.setAttribute('aria-pressed', String(button.dataset.paint === painting.brush));
    }
    helper.textContent = message(painting);
    doneButton.hidden = !isFinished(painting) || finishedShown;

    palette.hidden = finishedShown;
    helperBox.hidden = finishedShown;
    done.hidden = !finishedShown;
    rainbow.classList.toggle('is-finished', finishedShown);
    for (const stripe of stripes) stripe.setAttribute('tabindex', finishedShown ? '-1' : '0');
  }

  function paint(i) {
    if (finishedShown) return;
    painting = paintStripe(painting, i);
    draw();
  }

  stripes.forEach((stripe, i) => {
    stripe.addEventListener('click', () => paint(i));
    // The stripes are drawn shapes, so Enter and Space paint them too.
    stripe.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        paint(i);
      }
    });
  });

  doneButton.addEventListener('click', () => {
    finishedShown = true;
    draw();
    done.querySelector('h2').focus();
  });

  function restart() {
    painting = newPainting();
    finishedShown = false;
    draw();
  }

  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current painting.
  return { get painting() { return painting; } };
}
