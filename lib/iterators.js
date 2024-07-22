/**
 * @file iterators
 * @description Make iterables out of non-iterables.
 */

export default function iteratinator(value) {
  if (typeof value === "number") {
    return new Array(value).fill(0);
  }
}
