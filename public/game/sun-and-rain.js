// Level 4: toggle weather for a rainbow—sun + rain, no thick clouds.
// Snow won't help; wind won't stop it.
// Testable rules only; sun-and-rain-page.js handles drawing and taps.

export const WEATHER = [
  { id: 'sun', name: 'Sun' },
  { id: 'rain', name: 'Rain' },
  { id: 'snow', name: 'Snow' },
  { id: 'clouds', name: 'Cloudy' },
  { id: 'wind', name: 'Windy' },
];

// The sky starts plain grey: one small cloud, and nothing turned on.
export function newSky() {
  return { sun: false, rain: false, snow: false, clouds: false, wind: false };
}

// Turn one kind of weather on, or off if it's already on.
export function toggle(sky, id) {
  if (!(id in sky)) throw new Error(`No weather called ${id}`);
  return { ...sky, [id]: !sky[id] };
}

export function hasRainbow(sky) {
  return sky.sun && sky.rain && !sky.snow && !sky.clouds;
}

// What the helper says. Short, so a new reader can manage it.
export function message(sky) {
  if (hasRainbow(sky)) return 'Sun and rain make a rainbow!';
  if (sky.snow) return "Snowflakes don't make rainbows. Try rain!";
  if (sky.clouds) return "Too many clouds! The sun can't shine through.";
  if (sky.sun) return 'Sunny! But a rainbow needs raindrops too.';
  if (sky.rain) return 'Rainy! But a rainbow needs sunshine too.';
  if (sky.wind) return 'Whoosh! Wind is fun, but a rainbow needs sun and rain.';
  return 'Tap the weather to make a rainbow!';
}
