/**
 * @file the-club web component.
 */

import { html, css, LitElement } from "https://esm.sh/lit";
import makeRGB from "./lib/makeRGB.js";
import iteratinator from "./lib/iterators.js";

export default class TheClub extends LitElement {
  constructor() {
    super();
    this.audioCtx = new AudioContext();
    this.audioSource = null;
    this.analyzer = null;
    this.bufferLength = null;
    this.dataArray = null;
    this.uploadedFile = null;
    this.initialized = false;

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
      display: revert;
    }

    *,
    *::after,
    *::before {
      box-sizing: border-box;
    }
  `;

  get audio() {
    if (this.querySelector("audio")) {
      return this.querySelector("audio");
    }

    return this.renderRoot.querySelector("#audio");
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

  handleFileUpload(event) {
    const { target } = event;

    if (target.files.length > 0) {
      this.uploadedFile = target.files[0];
      this.src = URL.createObjectURL(this.uploadedFile);
    }
  }

  renderDefaultSlotContent() {
    if (this.src) {
      return html`
        <audio
          id="audio"
          controls
          crossorigin
          src="${this.src}"
          @loadedmetadata=${this.setup}
        >
          Your browser doesn't support audio.
        </audio>
      `;
    }

    return html`<input
      type="file"
      accept="audio/*"
      id="upload"
      @change=${this.handleFileUpload}
    />`;
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

  setup() {
    if (this.initialized) return;

    this.setupAudioContext();
    this.setupAudioPlayer();
    TheClub.createStylesheet();
    this.initialized = true;
  }

  lightShow = () => {
    this.analyzer.getByteFrequencyData(this.dataArray);
    this.drawGradient({
      bufferLength: this.bufferLength,
      dataArray: this.dataArray,
    });
    window.requestAnimationFrame(this.lightShow);
  };

  handleAudioPlay = () => {
    this.lightShow();
  };

  updated(changedProperties) {
    if (changedProperties.has("src")) {
      this.setup();
    }
  }

  render() {
    return html`<slot @slotchange=${this.setup}
      >${this.renderDefaultSlotContent()}</slot
    >`;
  }
}
