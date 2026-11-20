// @ts-check
/** @typedef {{key: import('../data/FoundryTypes.js').NumericSetting, label: string, min: number, max: number, step: number}} RangeControl */
/** @typedef {{toggle: 'reflection'|'additive'|'debug'|'telemetry'|'reducedMotion', label: string}} ToggleControl */
/** @type {{name: string, controls: (RangeControl|ToggleControl)[]}[]} */
export const ControlGroups = [
    { name: 'WEATHER', controls: [
        { key: 'rainRate', label: 'Rain / second', min: 0, max: 2200, step: 50 },
        { key: 'wind', label: 'Wind force', min: -250, max: 250, step: 10 },
        { key: 'propGravity', label: 'Body gravity', min: 0, max: 1200, step: 50 },
        { key: 'restitution', label: 'Body restitution', min: 0, max: 1, step: 0.05 },
        { toggle: 'reflection', label: 'Planar reflection' }, { toggle: 'debug', label: 'Physics / composition inspector' },
        { toggle: 'telemetry', label: 'Runtime telemetry' }, { toggle: 'reducedMotion', label: 'Reduced motion' },
    ] },
    { name: 'EMITTER', controls: [
        { key: 'spawnRate', label: 'Particles / second', min: 0, max: 900, step: 25 },
        { key: 'speed', label: 'Launch velocity', min: 10, max: 400, step: 10 },
        { key: 'spread', label: 'Spread / radians', min: 0, max: 3.14, step: 0.1 },
        { key: 'lifetime', label: 'Lifetime / seconds', min: 0.2, max: 4, step: 0.1 },
        { key: 'gravity', label: 'Gravity', min: -300, max: 600, step: 25 },
        { key: 'drag', label: 'Drag', min: 0, max: 3, step: 0.1 },
    ] },
    { name: 'CURVES', controls: [
        { key: 'size', label: 'Birth size', min: 0.5, max: 8, step: 0.25 },
        { key: 'endSize', label: 'End size', min: 0, max: 8, step: 0.25 },
        { key: 'hue', label: 'Birth color / hue', min: 0, max: 360, step: 10 },
        { key: 'endHue', label: 'End color / hue', min: 0, max: 360, step: 10 },
        { toggle: 'additive', label: 'Additive blend (off: normal)' },
    ] },
    { name: 'LENS', controls: [
        { key: 'glow', label: 'Glow / bloom simulation', min: 0, max: 1, step: 0.05 },
        { key: 'vignette', label: 'Vignette', min: 0, max: 1, step: 0.05 },
        { key: 'chroma', label: 'Chromatic ghosts', min: 0, max: 1, step: 0.05 },
        { key: 'scanlines', label: 'Scanlines', min: 0, max: 0.6, step: 0.05 },
        { key: 'grade', label: 'Cool color grade', min: 0, max: 1, step: 0.05 },
        { key: 'shake', label: 'Trauma / shake strength', min: 0, max: 1, step: 0.05 },
    ] },
];
