// Pages the level picker on levels.html: as many cards as fit the screen,
// 4 on a small phone up to 8 on a computer, with arrows, page dots, swiping
// and the arrow keys to move between pages. The rules live in
// levels-paging.js.
import './components.js'; // the card pictures
import { MAX_PER_PAGE, cardsOn, clampPage, pageCount, pageOf, perPage } from './levels-paging.js';

// Remembers the page across visits to a level, for this tab only.
const STORE_KEY = 'build-a-rainbow:levels-first-card';
const SWIPE = 60; // how far a finger moves sideways to turn the page, in px
const ROOMY = 260; // rows at least this tall get the bigger cards, in px

// How many columns the grid has (styles.css sets --cols for the screen
// width), how many rows of cards fit on the screen below the header, and how
// much room there is for them. Measured with the cards at their smallest.
function measure(doc, grid, pager) {
  const win = doc.defaultView;
  const cols = Number(win.getComputedStyle(grid).getPropertyValue('--cols')) || 1;
  // The tallest card, since a long name can wrap onto two lines.
  const card = Math.max(0, ...[...grid.querySelectorAll('.level-card')].map((c) => c.offsetHeight));
  const gap = parseFloat(win.getComputedStyle(grid).rowGap) || 0;
  const top = grid.getBoundingClientRect().top + win.scrollY;
  const footer = doc.querySelector('.signature')?.offsetHeight ?? 0;
  const room = win.innerHeight - top - pager.offsetHeight - footer;
  const rows = card ? Math.floor((room + gap) / (card + gap)) : 1;
  return { cols, rows, card, room, gap };
}

function remembered(win) {
  try {
    return Number(win.sessionStorage.getItem(STORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function remember(win, first) {
  try {
    win.sessionStorage.setItem(STORE_KEY, String(first));
  } catch {
    // Private windows can refuse; the picker just starts on page 1.
  }
}

export function start(doc = document, { size: fixedSize } = {}) {
  const win = doc.defaultView;
  const grid = doc.querySelector('.level-grid');
  const cards = [...grid.querySelectorAll('.level-card')];
  const pager = doc.querySelector('.pager');
  const prev = pager.querySelector('[data-page="prev"]');
  const next = pager.querySelector('[data-page="next"]');
  const dots = pager.querySelector('.pager-dots');

  let size = fixedSize ?? MAX_PER_PAGE;
  let page = 0;
  // The first card of the page last picked. When the screen changes size,
  // the page with this card on it shows, so the same levels stay in view.
  let anchor = 0;

  function draw() {
    const shown = cardsOn(page, size, cards.length);
    cards.forEach((card, i) => { card.hidden = !shown.includes(i); });
    const pages = pageCount(cards.length, size);
    pager.hidden = pages === 1;
    prev.disabled = page === 0;
    next.disabled = page === pages - 1;
    dots.replaceChildren(...Array.from({ length: pages }, (_, i) => {
      const dot = doc.createElement('button');
      dot.type = 'button';
      dot.className = 'pager-dot';
      dot.setAttribute('aria-label', `Page ${i + 1} of ${pages}`);
      if (i === page) dot.setAttribute('aria-current', 'page');
      dot.addEventListener('click', () => goTo(i));
      return dot;
    }));
  }

  function goTo(target) {
    const to = clampPage(target, size, cards.length);
    if (to === page) return;
    page = to;
    anchor = page * size;
    remember(win, anchor);
    draw();
  }

  // Works out the page size for this screen, then shows the page with the
  // anchor card on it.
  function fit() {
    if (!fixedSize) {
      // Show every card and the pager at their smallest, so there's
      // something real to measure.
      cards.forEach((card) => { card.hidden = false; });
      pager.hidden = false;
      delete grid.dataset.roomy;
      grid.style.removeProperty('--row');
      const { cols, rows, card, room, gap } = measure(doc, grid, pager);
      size = perPage(cols, rows);

      // Share out the room between the rows a page has, so the cards fill
      // the screen instead of bunching up at the top. With room to spare,
      // the cards get bigger too.
      const rowsShown = Math.ceil(size / cols);
      const spare = 4; // so rounding never tips the page into scrolling
      const row = Math.max(card, Math.floor((room - spare + gap) / rowsShown - gap));
      if (card) grid.style.setProperty('--row', `${row}px`);
      if (cols > 1 && row >= ROOMY) grid.dataset.roomy = '';
    }
    page = clampPage(pageOf(anchor, size), size, cards.length);
    draw();
  }

  prev.addEventListener('click', () => goTo(page - 1));
  next.addEventListener('click', () => goTo(page + 1));

  doc.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') goTo(page - 1);
    if (event.key === 'ArrowRight') goTo(page + 1);
  });

  // A sideways swipe turns the page; the card it started on isn't opened.
  let swipe = null;
  grid.addEventListener('pointerdown', (event) => { swipe = { x: event.clientX, y: event.clientY, moved: false }; });
  grid.addEventListener('pointerup', (event) => {
    if (!swipe) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy)) {
      swipe.moved = true;
      goTo(page + (dx < 0 ? 1 : -1));
    }
  });
  grid.addEventListener('dragstart', (event) => event.preventDefault()); // a mouse swipe isn't a link drag
  grid.addEventListener('click', (event) => {
    if (swipe?.moved) event.preventDefault();
    swipe = null;
  }, true);

  let pending = 0;
  win.addEventListener('resize', () => {
    win.cancelAnimationFrame(pending);
    pending = win.requestAnimationFrame(fit);
  });

  anchor = remembered(win);
  fit();

  // For tests: the page showing and how many cards a page holds.
  return {
    get page() { return page; },
    get size() { return size; },
  };
}
