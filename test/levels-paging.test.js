// The level picker's paging rules.
import { describe, expect, it } from 'vitest';
import { cardsOn, clampPage, pageCount, pageOf, perPage } from '../public/game/levels-paging.js';

describe('perPage', () => {
  it.each([
    // [columns, rows that fit, cards a page]
    [1, 2, 4], // a small phone still gets 4
    [1, 4, 4],
    [1, 6, 6], // a tall phone gets more
    [1, 20, 8], // never more than 8
    [2, 1, 4],
    [2, 3, 6], // a tablet
    [2, 9, 8],
    [3, 1, 6], // whole rows: 3 columns hold 6, not 4 or 8
    [3, 9, 6],
    [4, 1, 4],
    [4, 2, 8], // a computer
    [4, 9, 8],
  ])('%i columns with room for %i rows hold %i cards', (cols, rows, cards) => {
    expect(perPage(cols, rows)).toBe(cards);
  });
});

describe('pages', () => {
  it('counts the pages, with at least one', () => {
    expect(pageCount(9, 4)).toBe(3);
    expect(pageCount(9, 8)).toBe(2);
    expect(pageCount(8, 8)).toBe(1);
    expect(pageCount(0, 8)).toBe(1);
  });

  it('lists the cards on a page, with fewer on the last', () => {
    expect(cardsOn(0, 4, 9)).toEqual([0, 1, 2, 3]);
    expect(cardsOn(2, 4, 9)).toEqual([8]);
    expect(cardsOn(5, 4, 9)).toEqual([]);
  });

  it('finds the page a card is on', () => {
    expect(pageOf(0, 4)).toBe(0);
    expect(pageOf(8, 4)).toBe(2);
    expect(pageOf(8, 8)).toBe(1);
  });

  it('keeps a page within the pages there are', () => {
    expect(clampPage(-1, 4, 9)).toBe(0);
    expect(clampPage(7, 4, 9)).toBe(2);
    expect(clampPage(1, 8, 9)).toBe(1);
  });
});
