/**
 * @file makeRGB
 * @description Create RGB values out of an audio dataset and anticipated intensity.
 */

import shuffleArray from "./shuffle.js";

// TODO: make this do something useful?
function normalize(value, max = 256) {
  if (value <= max) {
    return value;
  }

  return Math.abs(max - (value % max));
}

export function makeRGBColors(index, height) {
  const red = Math.abs((index * height) / 10);
  const green = Math.abs(index * 4);
  const blue = Math.abs(height / 4 - 12);

  return { red, green, blue };

  return {
    red: normalize(red),
    green: normalize(green),
    blue: normalize(blue),
  };
}

export function makeRGBString(...colors) {
  return `rgb(${colors[0]} ${colors[1]} ${colors[2]})`;
}

export default function makeRGB(index, height, randomize = false) {
  const { red, green, blue } = makeRGBColors(index, height);

  if (!randomize) return makeRGBString(red, green, blue);

  return makeRGBString(...shuffleArray([red, green, blue]));
}
