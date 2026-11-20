// @ts-check
/** @typedef {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} PaintContext */
/**
 * @typedef {Object} FxSettings
 * @property {string} name
 * @property {string} label
 * @property {number} rainRate
 * @property {number} wind
 * @property {number} propGravity
 * @property {number} restitution
 * @property {number} spawnRate
 * @property {number} speed
 * @property {number} spread
 * @property {number} lifetime
 * @property {number} gravity
 * @property {number} drag
 * @property {number} size
 * @property {number} endSize
 * @property {number} hue
 * @property {number} endHue
 * @property {boolean} additive
 * @property {number} glow
 * @property {number} vignette
 * @property {number} scanlines
 * @property {number} chroma
 * @property {number} grade
 * @property {number} shake
 * @property {boolean} reflection
 */
/** @typedef {Exclude<keyof FxSettings, 'name'|'label'|'additive'|'reflection'>} NumericSetting */
/** @typedef {{seed: number, limits: {rain: number, particles: number, splashes: number, ripples: number, props: number}, presets: FxSettings[]}} ShowcaseData */
/** @typedef {{config: object, assets: {jsons: Record<string, unknown>}, services: Map<string, unknown>}} FoundryContext */
/** @typedef {{actor: import('../entities/FoundryProp.js').FoundryProp, point: import('gameforgejs/core').Vector2D, speed: number, surface: boolean}} Impact */
export {};
