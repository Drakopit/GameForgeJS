// @ts-check
/** Authored presets are copied into one mutable live-tuning model. */
export class FoundrySettings {
    /** @param {import('./FoundryTypes.js').ShowcaseData} data */
    constructor(data) {
        if (!data || !Array.isArray(data.presets) || data.presets.length === 0) throw new TypeError('Foundry presets are required.');
        if (!Number.isInteger(data.seed) || !data.limits || [data.limits.rain, data.limits.particles,
            data.limits.splashes, data.limits.ripples, data.limits.props].some(value =>
            !Number.isInteger(value) || value < 1 || value > 20000) || data.limits.props > 64 || data.limits.ripples > 512) {
            throw new RangeError('Invalid Foundry simulation budgets.');
        }
        /** @type {import('./FoundryTypes.js').NumericSetting[]} */
        const numeric = ['rainRate', 'wind', 'propGravity', 'restitution', 'spawnRate', 'speed', 'spread', 'lifetime',
            'gravity', 'drag', 'size', 'endSize', 'hue', 'endHue', 'glow', 'vignette', 'scanlines', 'chroma', 'grade', 'shake'];
        for (const preset of data.presets) {
            if (numeric.some(key => !Number.isFinite(preset[key])) || preset.lifetime <= 0 || preset.drag < 0
                || preset.size < 0 || preset.endSize < 0 || preset.restitution < 0 || preset.restitution > 1) {
                throw new RangeError('Invalid Foundry preset values.');
            }
        }
        this.data = data;
        this.current = { ...data.presets[0] };
        this.presetIndex = 0;
        this.debug = false;
        this.telemetry = false;
        this.reducedMotion = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    }
    /** @param {number} index */
    Apply(index) {
        this.presetIndex = (index + this.data.presets.length) % this.data.presets.length;
        Object.assign(this.current, this.data.presets[this.presetIndex]);
    }
}
