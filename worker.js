import cache from "./lib/cache.js";
import makeRGB from "./lib/makeRGB.js";
import iteratinator from "./lib/iterators.js";

class BumpinThatController {
  #canvas;
  #ctx;
  #visualizerType;
  #bufferLength;

  get canvas() {
    return this.#canvas;
  }

  set canvas(value) {
    this.#canvas = value;
  }

  get ctx() {
    return this.#ctx;
  }

  set ctx(value) {
    this.#ctx = value;
  }

  get visualizerType() {
    return this.#visualizerType;
  }

  set visualizerType(value) {
    this.#visualizerType = value;
  }

  get bufferLength() {
    return this.#bufferLength;
  }

  set bufferLength(value) {
    this.#bufferLength = value;
  }

  get barWidth() {
    return cache(this, "_barWidth", () =>
      this.visualizerType === "split"
        ? this.canvas.width / 2 / this.bufferLength
        : this.canvas.width / this.bufferLength,
    );
  }

  clear = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  static resetVisualizerIfStopped(dataArray, callback) {
    const uniqueDataPoints = new Set(dataArray);

    if (uniqueDataPoints.size === 1 && uniqueDataPoints.has(0)) {
      callback();
      return true;
    }

    return false;
  }

  drawVisualizer({ dataArray }) {
    const isAtRest = BumpinThatController.resetVisualizerIfStopped(
      dataArray,
      this.clear,
    );
    if (isAtRest) return;

    const ctx = this.ctx;
    const barWidth = this.barWidth;
    const bufferLength = this.bufferLength;
    const iterator = iteratinator(bufferLength);

    let barHeight;
    let firstX = 0;
    let secondX = bufferLength * barWidth;

    this.clear();

    iterator.forEach((_number, i) => {
      barHeight = dataArray[i];

      const fill = makeRGB(i, barHeight);

      ctx.fillStyle = fill;
      ctx.fillRect(
        this.visualizerType === "split"
          ? this.canvas.width / 2 - firstX
          : firstX,
        this.canvas.height - barHeight,
        barWidth,
        barHeight,
      );

      firstX += barWidth;

      if (this.visualizerType === "split") {
        ctx.fillRect(
          secondX,
          this.canvas.height - barHeight,
          barWidth,
          barHeight,
        );

        secondX += barWidth;
      }
    });
  }
}

const Bumpin = new BumpinThatController();

onmessage = function (e) {
  const { bufferLength, dataArray, canvas, visualizerType } = e.data;

  Bumpin.bufferLength = bufferLength;
  Bumpin.visualizerType = visualizerType;

  if (canvas) {
    Bumpin.canvas = canvas;
    Bumpin.ctx = canvas.getContext("2d");
  } else {
    Bumpin.drawVisualizer({ dataArray });
  }
};
