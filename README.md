# Build a Rainbow 🌈

A browser game for young elementary-age kids: put the colors in order and build a rainbow, one stripe at a time. Works on computers, tablets and phones too.

There's an opening screen, a level picker, and four levels:

1. **Mix a color:** two paint colors are shown; pick the color they make. Three questions, one for each pair of primary colors (red + yellow, yellow + blue, red + blue).
2. **Color order:** tap the colors in rainbow order, red first, to fill in each stripe. A wrong pick wiggles and the helper says to try another color.
3. **Memory rainbow:** look at the whole rainbow, tap Ready, then build it again from memory, with no outline showing which stripe is next.
4. **Sun and rain:** turn the sun, rain and snow on and off until there's a rainbow. It needs sunshine and raindrops at the same time, and no snow.

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

## Fonts

Fredoka and Nunito, both under the SIL Open Font License. The license files are in [`public/fonts/`](public/fonts/).
