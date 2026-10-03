# Build a Rainbow 🌈

A browser game for elementary-age kids: put the colors in order and build a rainbow, one stripe at a time. Made for tablets, and works on computers and phones too.

So far there's the opening screen, the level picker, and level 1:

- **Color order:** tap the colors in rainbow order, red first, to fill in each stripe. A wrong pick wiggles and the helper says to try another color. The speaker button reads the helper's words out loud.

Levels 2 to 4 (Mix a color, Memory rainbow, Sun and rain) are still to come.

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
