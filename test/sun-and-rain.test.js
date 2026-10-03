// The rules of Level 4, Sun and rain.
import { describe, expect, it } from 'vitest';
import { WEATHER, hasRainbow, message, newSky, toggle } from '../public/game/sun-and-rain.js';

const sky = (...on) => on.reduce(toggle, newSky());

describe('weather', () => {
  it('is sun, rain and snow', () => {
    expect(WEATHER.map((w) => w.id)).toEqual(['sun', 'rain', 'snow']);
  });

  it('starts cloudy, with nothing on', () => {
    expect(newSky()).toEqual({ sun: false, rain: false, snow: false });
  });

  it('turns on and off', () => {
    expect(sky('sun').sun).toBe(true);
    expect(sky('sun', 'sun').sun).toBe(false);
  });

  it('refuses weather that does not exist', () => {
    expect(() => toggle(newSky(), 'wind')).toThrow();
  });
});

describe('hasRainbow', () => {
  it('needs sun and rain together', () => {
    expect(hasRainbow(sky('sun', 'rain'))).toBe(true);
  });

  it.each([
    ['nothing', []],
    ['only sun', ['sun']],
    ['only rain', ['rain']],
    ['only snow', ['snow']],
    ['sun and snow', ['sun', 'snow']],
    ['sun, rain and snow', ['sun', 'rain', 'snow']],
  ])('is not there with %s', (_, on) => {
    expect(hasRainbow(sky(...on))).toBe(false);
  });
});

describe('message', () => {
  it.each([
    [[], 'Tap the weather to make a rainbow!'],
    [['sun'], 'Sunny! But a rainbow needs raindrops too.'],
    [['rain'], 'Rainy! But a rainbow needs sunshine too.'],
    [['snow'], "Snowflakes don't make rainbows. Try rain!"],
    [['sun', 'rain', 'snow'], "Snowflakes don't make rainbows. Try rain!"],
    [['sun', 'rain'], 'Sun and rain make a rainbow!'],
  ])('with %j says "%s"', (on, words) => {
    expect(message(sky(...on))).toBe(words);
  });
});
