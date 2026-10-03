// Small helpers shared by the level pages (the *-page.js files).

export const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

// Make something wiggle, the gentle "not that one" for a wrong answer. Works
// for buttons and for drawn shapes. If it's already wiggling, it starts over.
export function wiggle(el) {
  el.classList.remove('is-wrong');
  void el.getBoundingClientRect(); // lets the animation restart
  el.classList.add('is-wrong');
}

// Run `fn` when a drawn shape that acts as a button (a stripe or a road) is
// tapped, or picked with Enter or Space from the keyboard.
export function onTap(el, fn) {
  el.addEventListener('click', fn);
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fn();
    }
  });
}
