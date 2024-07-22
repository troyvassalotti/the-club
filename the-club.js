/**
 * @file the-club web component.
 * @link https://blog.logrocket.com/audio-visualizer-from-scratch-javascript/
 */

import { html, css, LitElement } from "https://esm.sh/lit";
import makeRGB from "./lib/makeRGB.js";
import iteratinator from "./lib/iterators.js";

export default class TheClub extends LitElement {
  constructor() {
    super();
    this.worker = new Worker(new URL("./worker.js", import.meta.url), {
      type: "module",
    });
    this.audioCtx = new AudioContext();
    this.audioSource = null;
    this.analyzer = null;
    this.bufferLength = null;
    this.dataArray = null;

    this.visualizerType = "standard";
    this.randomizeColors = false;
    this.fftSize;
  }

  static tagName = "the-club";

  static register() {
    if (!window.customElements.get(this.tagName)) {
      window.customElements.define(this.tagName, this);
    }
  }

  static properties = {
    /** URL for the audio source. */
    src: { type: String },
    /**
     * @attribute visualizertype
     * @type {'split' | 'standard'} */
    visualizerType: { type: String },
    /**
     * @attribute randomizecolors
     * @type {boolean}
     */
    randomizeColors: { type: Boolean },
    /**
     * fftSize property of the audio AnalyzerNode.
     * @type {number}
     * @link https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
     */
    fftSize: { type: Number },
  };

  static styles = css`
    :host {
      all: unset;
      box-sizing: border-box;
      display: block;
    }

    *,
    *::after,
    *::before {
      box-sizing: border-box;
      margin: 0px;
      padding: 0px;
    }

    canvas {
      block-size: 100%;
      display: block;
      inline-size: 100%;
      inset: 0;
      pointer-events: none;
      position: fixed;
    }
  `;

  get canvas() {
    return this.renderRoot.querySelector("#canvas");
  }

  get audio() {
    if (this.querySelector("audio")) {
      return this.querySelector("audio");
    }

    return this.renderRoot.querySelector("#audio");
  }

  static makeCanvasWidth() {
    return window.innerWidth;
  }

  static makeCanvasHeight() {
    return window.innerHeight;
  }

  static resetBodyClass() {
    document.body.classList.remove("is-bumpin-that-beat");
  }

  static resetGradientIfStopped(dataArray) {
    const uniqueDataPoints = new Set(dataArray);

    if (uniqueDataPoints.size === 1 && uniqueDataPoints.has(0)) {
      this.resetBodyClass();
      return true;
    }

    return false;
  }

  static createStylesheet() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`
      .is-bumpin-that-beat {
        background-image: var(--the-club-background) !important;
      }
    `);

    document.adoptedStyleSheets.push(sheet);
  }

  static applyGradientStyles(gradients) {
    document.body.classList.add("is-bumpin-that-beat");
    document.body.style.setProperty(
      "--the-club-background",
      `radial-gradient(circle at top right, ${gradients.join(",")})`,
    );
  }

  drawGradient({ bufferLength, dataArray }) {
    const isAtRest = TheClub.resetGradientIfStopped(dataArray);
    if (isAtRest) return;

    const iterator = iteratinator(bufferLength);
    let gradients = [];

    iterator.forEach((_number, i) => {
      let barHeight = dataArray[i];
      let fill = makeRGB(i, barHeight, this.randomizeColors);
      gradients.push(fill);
    });

    TheClub.applyGradientStyles(gradients);
  }

  setupWorker() {
    const canvas = this.canvas.transferControlToOffscreen();
    this.worker.postMessage({ canvas }, [canvas]);
  }

  setupAudioContext() {
    this.audioSource = this.audioCtx.createMediaElementSource(this.audio);
    this.analyzer = this.audioCtx.createAnalyser();
    this.audioSource.connect(this.analyzer);
    this.analyzer.connect(this.audioCtx.destination);
    if (this.fftSize) this.analyzer.fftSize = this.fftSize;
    this.bufferLength = this.analyzer.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
  }

  setupAudioPlayer() {
    this.audio?.addEventListener("play", this.handleAudioPlay);
  }

  init() {
    this.setupWorker();
    this.setupAudioContext();
    this.setupAudioPlayer();
    TheClub.createStylesheet();
  }

  visualize = () => {
    this.analyzer.getByteFrequencyData(this.dataArray);
    this.worker.postMessage(
      {
        bufferLength: this.bufferLength,
        dataArray: this.dataArray,
        visualizerType: this.visualizerType,
      },
      {},
    );
    window.requestAnimationFrame(this.visualize);
  };

  lightShow = () => {
    this.analyzer.getByteFrequencyData(this.dataArray);
    this.drawGradient({
      bufferLength: this.bufferLength,
      dataArray: this.dataArray,
    });
    window.requestAnimationFrame(this.lightShow);
  };

  handleAudioPlay = () => {
    this.visualize();
    this.lightShow();
  };

  firstUpdated() {
    this.init();
  }

  disconnectedCallback() {
    this.worker.terminate();
    super.disconnectedCallback();
  }

  render() {
    return html`
      <slot>
        <audio id="audio" controls crossorigin src="${this.src}">
          Your browser doesn't support audio.
        </audio>
      </slot>
      <canvas
        part="canvas"
        id="canvas"
        width="${TheClub.makeCanvasWidth()}"
        height="${TheClub.makeCanvasHeight()}"
        >Your browser doesn't support canvas.</canvas
      >
    `;
  }
}
