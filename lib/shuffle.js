/**
 * @file shuffle
 * @description Shuffle an array.
 */

export default function shuffleArray(array, inPlace = false) {
  let arr = inPlace ? array : [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  if (!inPlace) return arr;
}
