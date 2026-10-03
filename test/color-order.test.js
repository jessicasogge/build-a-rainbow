// The rules of Level 2, Color order.
import { describe, expect, it } from 'vitest';
import { COLORS } from '../public/game/colors.js';
import { isDone, message, newGame, nextColor, pick, shuffledColors } from '../public/game/color-order.js';

const ids = COLORS.map((c) => c.id);

describe('colors', () => {
  it('are the six rainbow stripes, outside to inside', () => {
    expect(ids).toEqual(['red', 'orange', 'yellow', 'green', 'blue', 'purple']);
  });

});

describe('shuffledColors', () => {
  it('has every color once', () => {
    expect(shuffledColors().map((c) => c.id).sort()).toEqual([...ids].sort());
  });

  it('is never already in rainbow order', () => {
    // Math.random() always 0.99 leaves the order unchanged, so it must reshuffle.
    let calls = 0;
    const random = () => (calls++ < 5 ? 0.99 : 0);
    expect(shuffledColors(random).map((c) => c.id)).not.toEqual(ids);
  });
});

describe('pick', () => {
  it('starts with red', () => {
    expect(nextColor(newGame()).id).toBe('red');
  });

  it('can start with red already in place, asking for orange', () => {
    const game = newGame(1);
    expect(game.filled).toBe(1);
    expect(nextColor(game).id).toBe('orange');
    expect(pick(game, 'red').result).toBe('used');
  });

  it('fills a stripe when the next color is picked', () => {
    const { game, result } = pick(newGame(), 'red');
    expect(result).toBe('right');
    expect(game.filled).toBe(1);
    expect(nextColor(game).id).toBe('orange');
  });

  it('changes nothing when the wrong color is picked', () => {
    const start = newGame();
    const { game, result } = pick(start, 'blue');
    expect(result).toBe('wrong');
    expect(game).toBe(start);
  });

  it('ignores a color that is already in', () => {
    const { game } = pick(newGame(), 'red');
    expect(pick(game, 'red').result).toBe('used');
  });

  it('finishes on purple', () => {
    let game = newGame();
    let result;
    for (const id of ids) ({ game, result } = pick(game, id));
    expect(result).toBe('done');
    expect(isDone(game)).toBe(true);
    expect(nextColor(game)).toBeNull();
  });

  it('refuses a color that does not exist', () => {
    expect(() => pick(newGame(), 'pink')).toThrow();
  });
});

describe('message', () => {
  it('asks for the top color first', () => {
    expect(message(newGame())).toBe('Which color goes on top?');
  });

  it('names the color just added', () => {
    const { game, result } = pick(newGame(), 'red');
    expect(message(game, result)).toBe('Red! What comes next?');
  });

  it('says red is already on top when a game starts with it', () => {
    expect(message(newGame(1))).toBe('Red goes on top. Which color comes next?');
  });

  it('is gentle about a wrong pick', () => {
    expect(message(newGame(), 'wrong')).toBe('Not that one yet. Try another color!');
  });
});
