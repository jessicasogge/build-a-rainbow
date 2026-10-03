// Level 4, Sun and rain: turn the weather on and off until there's a
// rainbow. A rainbow needs sunshine and raindrops at the same time, and
// snow doesn't make one.
//
// This file is only the rules. It doesn't touch the page, so the tests can
// play it directly. sun-and-rain-page.js draws it and handles the taps.

export const WEATHER = [
  { id: 'sun', name: 'Sun' },
  { id: 'rain', name: 'Rain' },
  { id: 'snow', name: 'Snow' },
];

// The sky starts cloudy: no sun, no rain, no snow.
export function newSky() {
  return { sun: false, rain: false, snow: false };
}

// Turn one kind of weather on, or off if it's already on.
export function toggle(sky, id) {
  if (!(id in sky)) throw new Error(`No weather called ${id}`);
  return { ...sky, [id]: !sky[id] };
}

export function hasRainbow(sky) {
  return sky.sun && sky.rain && !sky.snow;
}

// What the helper says. Short, so a new reader can manage it.
export function message(sky) {
  if (hasRainbow(sky)) return 'Sun and rain make a rainbow!';
  if (sky.snow) return "Snowflakes don't make rainbows. Try rain!";
  if (sky.sun) return 'Sunny! But a rainbow needs raindrops too.';
  if (sky.rain) return 'Rainy! But a rainbow needs sunshine too.';
  return 'Tap the weather to make a rainbow!';
}
