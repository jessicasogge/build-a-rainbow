// The rules of Level 1, Mix a color.
import { describe, expect, it } from 'vitest';
import { CHOICES, MIXES, isDone, message, newGame, nextQuestion, pick, question } from '../public/game/mix-a-color.js';

// Plays the current question right.
const answer = (game) => pick(game, question(game).makes);

describe('mixes', () => {
  it('are the three pairs of primary colors', () => {
    expect(MIXES).toEqual([
      { a: 'red', b: 'yellow', makes: 'orange' },
      { a: 'yellow', b: 'blue', makes: 'green' },
      { a: 'red', b: 'blue', makes: 'purple' },
    ]);
  });

  it('offer orange, green and purple as answers', () => {
    expect(CHOICES).toEqual(['orange', 'green', 'purple']);
  });
});

describe('newGame', () => {
  it('asks every mix once, each with all three answer choices', () => {
    const game = newGame();
    expect(game.questions.map((q) => q.makes).sort()).toEqual([...CHOICES].sort());
    for (const q of game.questions) expect([...q.choices].sort()).toEqual([...CHOICES].sort());
  });

  it('shuffles with the random numbers it is given', () => {
    const game = newGame(() => 0);
    expect(game.questions.map((q) => q.makes)).toEqual(['green', 'purple', 'orange']);
  });
});

describe('pick', () => {
  it('solves the question with the right color', () => {
    const { game, result } = answer(newGame());
    expect(result).toBe('right');
    expect(game.solved).toBe(true);
  });

  it('changes nothing with the wrong color', () => {
    const start = newGame();
    const wrong = CHOICES.find((id) => id !== question(start).makes);
    const { game, result } = pick(start, wrong);
    expect(result).toBe('wrong');
    expect(game).toBe(start);
  });

  it('ignores taps once the question is answered', () => {
    const { game } = answer(newGame());
    expect(pick(game, question(game).makes).result).toBe('used');
  });

  it('refuses a color that does not exist', () => {
    expect(() => pick(newGame(), 'pink')).toThrow();
  });
});

describe('a whole game', () => {
  it('goes through three questions and then is done', () => {
    let game = newGame();
    const results = [];
    for (let i = 0; i < 3; i++) {
      let result;
      ({ game, result } = answer(game));
      results.push(result);
      game = nextQuestion(game);
    }
    expect(results).toEqual(['right', 'right', 'done']);
    expect(isDone(game)).toBe(true);
  });

  it('does not skip a question that is not answered yet', () => {
    const game = newGame();
    expect(nextQuestion(game)).toBe(game);
  });
});

describe('message', () => {
  it('asks the question', () => {
    expect(message(newGame())).toBe('What color do they make?');
  });

  it('says the mix once it is answered', () => {
    const start = { questions: [{ ...MIXES[0], choices: CHOICES }], index: 0, solved: false };
    const { game, result } = answer(start);
    expect(message(game, result)).toBe('Red and yellow make orange!');
  });

  it('is gentle about a wrong pick', () => {
    expect(message(newGame(), 'wrong')).toBe('Not quite. Try another color!');
  });
});
