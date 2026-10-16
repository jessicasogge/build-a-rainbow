// The level picker's paging: how many cards a page holds, and which cards
// are on which page. Testable rules only; levels-page.js handles the page.

export const MIN_PER_PAGE = 4; // a small phone
export const MAX_PER_PAGE = 8; // a computer

// Cards per page for a grid `cols` wide with room for `rows` rows. Always
// whole rows, and between MIN_PER_PAGE and MAX_PER_PAGE (as near as whole
// rows allow: three columns hold 6, not 8).
export function perPage(cols, rows) {
  const c = Math.max(1, Math.floor(cols));
  const fewestRows = Math.ceil(MIN_PER_PAGE / c);
  const mostRows = Math.max(1, Math.floor(MAX_PER_PAGE / c));
  const r = Math.min(Math.max(Math.floor(rows), fewestRows), mostRows);
  return c * r;
}

export const pageCount = (cards, size) => Math.max(1, Math.ceil(cards / size));

// The page that shows card `index` (counting from 0).
export const pageOf = (index, size) => Math.floor(index / size);

// The cards (counting from 0) on `page`.
export function cardsOn(page, size, cards) {
  const first = page * size;
  return Array.from({ length: Math.max(0, Math.min(size, cards - first)) }, (_, i) => first + i);
}

// Keeps `page` within the pages there are.
export const clampPage = (page, size, cards) => Math.min(Math.max(0, page), pageCount(cards, size) - 1);
