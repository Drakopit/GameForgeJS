import { Component } from '../../core/Component.js';
/** Gradual rain wetting and evaporation over shared native surface materials. */
export class WetSurfaceResponse extends Component {
    constructor(rain, materials, { wetting = 0.18, drying = 0.025 } = {}) {
        super();
        if (![wetting, drying].every(v => Number.isFinite(v) && v >= 0))
            throw new RangeError('Wetness rates must be nonnegative.');
        this.rain = rain;
        this.materials = new Set(materials);
        this.wetting = wetting;
        this.drying = drying;
    }
    OnUpdate(dt) { for (const material of this.materials)
        material.wetness = Math.max(0, Math.min(1, material.wetness + (this.rain.enabled ? this.wetting : -this.drying) * dt)); }
    OnDestroy() { this.materials.clear(); }
}
