import { StandardMaterial } from './StandardMaterial.js';
const Presets = Object.freeze({
    water: { albedoColor: '#327d92', roughness: 0.16, metallic: 0.12, reflection: 0.8, surface: 1 },
    metal: { albedoColor: '#b9b9ac', roughness: 0.22, metallic: 0.92, reflection: 0.75, surface: 2 },
    stone: { albedoColor: '#9d9987', roughness: 0.86, metallic: 0, reflection: 0.08, surface: 3 },
    wood: { albedoColor: '#96683f', roughness: 0.67, metallic: 0, reflection: 0.12, surface: 4 },
});
/**
 * Standard shader surface presets with analytic environment lighting and
 * optional sampling of the scene horizontal planar reflection.
 * @param {Object} [options] Standard material overrides plus preset, scale and wetness.
 */
export class SurfaceMaterial extends StandardMaterial {
    constructor({ preset = 'stone', scale = 1, wetness = 0, reflection, planarReflection = false, waterDepth = 0, ...options } = {}) {
        const definition = Presets[preset];
        if (!definition)
            throw new RangeError(`Unknown surface preset: ${preset}`);
        super({ ...definition, ...options, name: options.name ?? `${preset} surface` });
        this.preset = preset;
        this.surface = definition.surface;
        this.surfaceScale = scale;
        this.wetness = wetness;
        this.planarReflection = Boolean(planarReflection);
        if (!Number.isFinite(waterDepth) || waterDepth < 0) throw new RangeError('Invalid water depth.');
        this.waterDepth = waterDepth;
        this.reflection = reflection ?? definition.reflection;
        if (!Number.isFinite(scale) || scale <= 0 || ![wetness, this.reflection].every(v => Number.isFinite(v) && v >= 0 && v <= 1))
            throw new RangeError('Invalid surface parameters.');
        this.time = 0;
        this.ripples = [];
        this.rippleUniforms = new Float32Array(32);
    }
    /** Advance from the engine lifecycle, once per shared material per frame. */
    Advance(dt) {
        if (!Number.isFinite(dt) || dt < 0)
            throw new RangeError('Surface delta must be nonnegative.');
        this.time += dt;
        this.ripples = this.ripples.filter(r => this.time - r.start < 3);
        this.rippleUniforms.fill(0);
        this.ripples.forEach((r, i) => this.rippleUniforms.set([r.x, r.z, this.time - r.start, r.strength], i * 4));
    }
    /** Bounded, world-space impact ring; x/z match the water mesh world position. */
    AddRipple(point, strength = 0.2) {
        if (![point.x, point.z, strength].every(Number.isFinite) || strength < 0)
            throw new RangeError('Invalid ripple.');
        if (this.ripples.length === 8)
            this.ripples.shift();
        this.ripples.push({ x: point.x, z: point.z, start: this.time, strength: Math.min(1, strength) });
    }
}
