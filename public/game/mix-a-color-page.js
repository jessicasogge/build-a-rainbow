// Draws Level 1 (Mix a color) on mix-a-color.html and handles the taps.
// The rules live in mix-a-color.js.
import { color, isDone, isLast, message, newGame, nextQuestion, pick, question } from './mix-a-color.js';

export function start(doc = document, { random = Math.random } = {}) {
  const blobA = doc.querySelector('[data-blob="a"]');
  const blobB = doc.querySelector('[data-blob="b"]');
  const mystery = doc.querySelector('[data-blob="mystery"]');
  const progress = doc.querySelector('.progress-pill');
  const helperBox = doc.querySelector('.helper');
  const helper = doc.querySelector('.helper-text');
  const tray = doc.querySelector('.tray');
  const nextButton = doc.querySelector('#next');
  const done = doc.querySelector('.level-done');
  const restartButtons = doc.querySelectorAll('[data-restart]');

  let game;
  let choices = [];

  function paint(blob, id) {
    blob.querySelector('.blob').style.background = color(id).hex;
    blob.querySelector('.blob-name').textContent = color(id).name;
  }

  function shake(button) {
    button.classList.remove('is-wrong');
    void button.offsetWidth; // restart the animation if it's already running
    button.classList.add('is-wrong');
  }

  // Draws the answer buttons for the current question.
  function drawChoices() {
    tray.replaceChildren();
    choices = question(game).choices.map((id) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = 'swatch';
      button.dataset.color = id;
      const dot = doc.createElement('span');
      dot.className = 'swatch-dot';
      dot.style.background = color(id).hex;
      button.append(dot, color(id).name);
      button.addEventListener('click', () => {
        const turn = pick(game, id);
        game = turn.game;
        if (turn.result === 'wrong') shake(button);
        draw(turn.result);
      });
      tray.append(button);
      return button;
    });
  }

  function draw(result) {
    const q = question(game);
    paint(blobA, q.a);
    paint(blobB, q.b);
    progress.textContent = `Question ${game.index + 1} of ${game.questions.length}`;

    mystery.classList.toggle('is-solved', game.solved);
    mystery.querySelector('.blob').style.background = game.solved ? color(q.makes).hex : '';
    mystery.querySelector('.blob-mark').hidden = game.solved;
    mystery.querySelector('.blob-name').textContent = game.solved ? color(q.makes).name : 'Mystery';

    for (const button of choices) button.disabled = game.solved;
    helper.textContent = message(game, result);

    const finished = isDone(game);
    nextButton.hidden = !game.solved || isLast(game);
    tray.hidden = game.solved;
    helperBox.hidden = finished;
    done.hidden = !finished;
    if (finished) done.querySelector('h2').focus();
    else if (game.solved) nextButton.focus();
  }

  function restart() {
    game = newGame(random);
    drawChoices();
    draw();
  }

  nextButton.addEventListener('click', () => {
    game = nextQuestion(game);
    drawChoices();
    draw();
  });
  restartButtons.forEach((button) => button.addEventListener('click', restart));
  restart();

  // For tests: the current game.
  return { get game() { return game; } };
}
