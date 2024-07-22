/**
 * @file cache
 * @description cache results of a getter
 * @link https://www.jameskerr.blog/posts/cache-the-result-of-a-javascript-getter-method/
 */

export default function cache(self, prop, func) {
  const cache = self[prop];
  if (cache !== undefined) return cache;
  const result = func();
  self[prop] = result;
  return result;
}
