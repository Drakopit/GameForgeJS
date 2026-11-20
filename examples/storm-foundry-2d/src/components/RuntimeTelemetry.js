// @ts-check
import { Component } from 'gameforgejs/core';

/** Measures engine-provided frame deltas; no clock, timer or second RAF. */
export class RuntimeTelemetry extends Component {
    constructor() { super(); this.fps = 60; this.deltaMs = 0; this.frames = 0; this.elapsed = 0; }
    /** @param {number} dt */
    OnUpdate(dt) {
        this.deltaMs = dt * 1000; this.frames++; this.elapsed += dt;
        if (this.elapsed >= 0.5) { this.fps = this.frames / this.elapsed; this.frames = 0; this.elapsed = 0; }
    }
}
