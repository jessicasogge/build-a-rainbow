// The rules of Level 4, Sun and rain.
import { describe, expect, it } from 'vitest';
import { WEATHER, hasRainbow, message, newSky, toggle } from '../public/game/sun-and-rain.js';

const sky = (...on) => on.reduce(toggle, newSky());

describe('weather', () => {
  it('is sun, rain, snow and clouds', () => {
    expect(WEATHER.map((w) => w.id)).toEqual(['sun', 'rain', 'snow', 'clouds']);
    expect(WEATHER.map((w) => w.name)).toEqual(['Sun', 'Rain', 'Snow', 'Cloudy']);
  });

  it('starts with nothing on', () => {
    expect(newSky()).toEqual({ sun: false, rain: false, snow: false, clouds: false });
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
    ['only clouds', ['clouds']],
    ['sun, rain and clouds', ['sun', 'rain', 'clouds']],
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
    [['clouds'], "Too many clouds! The sun can't shine through."],
    [['sun', 'rain', 'clouds'], "Too many clouds! The sun can't shine through."],
    [['sun', 'rain'], 'Sun and rain make a rainbow!'],
  ])('with %j says "%s"', (on, words) => {
    expect(message(sky(...on))).toBe(words);
  });
});
