# Build a Rainbow 🌈

A browser game for young elementary-age kids: eight rainbow levels where you mix colors, build and paint rainbows, drive a rainbow road and more. Works on computers, tablets and phones.

There's an opening screen, a level picker, and eight levels:

1. **Mix a color:** two paint colors are shown; pick the color they make. Three questions, one for each pair of primary colors (red + yellow, yellow + blue, red + blue).
2. **Color order:** red starts filled in on top; tap the rest of the colors in rainbow order to fill in each stripe. A wrong pick wiggles and the helper says to try another color.
3. **Memory rainbow:** look at the whole rainbow, tap Ready, then build it again from memory, with no outline showing which stripe is next.
4. **Sun and rain:** turn the sun, rain, snow and clouds on and off until there's a rainbow. It needs sunshine and raindrops at the same time, with no snow and no thick clouds hiding the sun.
5. **Paint a rainbow:** pick from ten paints and tap any stripe to paint it, in any colors you like. Once every stripe is painted, tap Done.
6. **Rainbow road:** drive a little car through a roundabout six times. Each time, tap the exit in the color the helper names, and the car drives around the ring and out that way. The trip ends at a pot of gold at the end of the rainbow.
7. **Word scramble:** the letters of RAINBOW come mixed up. Tap them in order to spell the word; each right letter drops into the next box with a rainbow-colored border.
8. **Fix the rainbow:** the stripes come jumbled. Tap one stripe, then another, to swap them, until every color is back in its place.

## Running it locally

The game is plain HTML, CSS and JavaScript in [`public/`](public/), with no build step. To run it with the included dev server:

```sh
npm install
npm run dev
```

Then open http://localhost:3001.

To run the tests:

```sh
npm test
```

## How the code is organized

Each level is three files, plus a test for each part:

- `public/<level>.html`: the page.
- `public/game/<level>.js`: just the rules. It doesn't touch the page, so the tests can play it directly.
- `public/game/<level>-page.js`: draws the level and handles the taps.

Shared by every level:

- `public/game/colors.js`: the six rainbow colors.
- `public/game/shuffle.js`: the shuffle every level uses to mix things up.
- `public/game/page-helpers.js`: the wrong-answer wiggle and tapping drawn shapes.
- `public/game/components.js`: the pieces every page repeats, written once: `<level-header>`, `<helper-bubble>`, `<level-done>` and `<rainbow-stripes>`.
- `public/styles.css`: one stylesheet, in sections: the title screen, the level picker, what all levels share, then one section per level.

## Fonts

Fredoka and Nunito, both under the SIL Open Font License. The license files are in [`public/fonts/`](public/fonts/).

## Credits

Made by Jessica Sogge.
Idea and design by Caitlin Sogge.
