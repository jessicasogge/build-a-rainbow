# Build a Rainbow 🌈

A browser game for young elementary-age kids: twelve rainbow levels where you mix colors, build and paint rainbows, sort colors, finish patterns, pop bubbles, play I spy, drive a rainbow road and more. Works on computers, tablets and phones.

There's an opening screen, a level picker, and twelve levels, from easiest to hardest:

1. **Paint a rainbow:** pick from ten paints and tap any stripe to paint it, in any colors you like. Once every stripe is painted, tap Done.
2. **Bubble pop:** rainbow bubbles float slowly up the sky, and the helper calls a color. Pop five bubbles of that color, then the next color is called. Three colors a game. A bubble of another color just boings away; there's no losing and no time limit.
3. **Color sort:** a strawberry, a frog, a banana and other everyday things come up one at a time. Drag each one into the basket of its color, or tap the basket. Six things a game, one of each color, picked from twelve.
4. **Sun and rain:** turn the sun, rain, snow, clouds and wind on and off until there's a rainbow. It needs sunshine and raindrops at the same time, with no snow and no thick clouds hiding the sun. Wind blows the rain sideways but doesn't stop a rainbow.
5. **Rainbow road:** drive a little car through a roundabout six times. Each time, tap the exit in the color the helper names, and the car drives around the ring and out that way. The trip ends at a pot of gold at the end of the rainbow.
6. **I spy:** twelve things hide in a rainbow meadow, two of each color: a red ladybug and a red apple, an orange fish and an orange pumpkin, and so on. The helper gives a clue with a color and a hint ("I spy something purple that flutters!"), so both are needed to find the right one. Six clues a game, one of each color.
7. **Color order:** red starts filled in on top; tap the rest of the colors in rainbow order to fill in each stripe. A wrong pick wiggles and the helper says to try another color.
8. **Memory rainbow:** twelve cards lie face down, two of each rainbow color. Turn over two at a time to find the pairs. A pair stays face up; two that don't match turn back over.
9. **Mix a color:** two paint colors are shown; pick the color they make. Three questions, one for each pair of primary colors (red + yellow, yellow + blue, red + blue).
10. **What comes next?:** six patterns of colors and shapes, each ending in a gap. Pick which of three choices comes next. They get harder: two colors taking turns, then patterns like red, red, yellow, then shapes, then color and shape together, and last the rainbow itself.
11. **Fix the rainbow:** the stripes come jumbled. Tap one stripe, then another, to swap them, until every color is back in its place.
12. **Word scramble:** the letters of RAINBOW come mixed up. Tap them in order to spell the word; each right letter drops into the next box with a rainbow-colored border. Then tap Next and do the same with SUNSHINE, then CLOUDS.

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

GitHub runs the tests on every pull request, and again before each deploy to the live site. If any test fails, the site isn't updated.

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
- `public/game/levels-page.js` and `levels-paging.js`: page the level picker, showing as many cards as fit the screen (4 on a small phone, up to 8 on a computer).
- `public/icon.svg`: the home screen icon. `apple-touch-icon.png` (180 × 180, for iPhones) and `icon-512.png` (for Android) are made from it, and `manifest.webmanifest` opens the game full screen when it's started from a home screen.
- `public/sitemap.xml`: every page, for search engines. A new page goes here too (a test checks).
- `public/styles.css`: one stylesheet, in sections: the title screen, the level picker, what all levels share, then one section per level.

## Fonts

Fredoka and Nunito, both under the SIL Open Font License. The license files are in [`public/fonts/`](public/fonts/).

## Credits

Made by Jessica Sogge.
Idea and design by Caitlin Sogge.
