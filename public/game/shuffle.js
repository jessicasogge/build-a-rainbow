// Small helpers shared by the levels' rules. Nothing here touches the page.

// A shuffled copy of `list` (the Fisher–Yates shuffle). `random` is there so
// tests can pass their own and get the same order every time.
export function shuffle(list, random = Math.random) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Like shuffle, but shuffles again while `tooEasy(order)` is true. The levels
// use it so a puzzle never starts out already solved.
export function shuffleUntil(list, random, tooEasy) {
  let order;
  do order = shuffle(list, random);
  while (tooEasy(order));
  return order;
}

// True when two lists hold the same things in the same order.
export function sameOrder(a, b) {
  return a.length === b.length && a.every((item, i) => item === b[i]);
}
