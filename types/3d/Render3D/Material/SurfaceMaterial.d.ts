/**
 * Standard shader surface presets with analytic environment lighting and
 * optional sampling of the scene horizontal planar reflection.
 * @param {Object} [options] Standard material overrides plus preset, scale and wetness.
 */
export class SurfaceMaterial extends StandardMaterial {
    constructor({ preset, scale, wetness, reflection, planarReflection, waterDepth, ...options }?: {
        preset?: string;
        scale?: number;
        wetness?: number;
        planarReflection?: boolean;
        waterDepth?: number;
    });
    preset: string;
    surface: any;
    surfaceScale: number;
    wetness: number;
    planarReflection: boolean;
    waterDepth: number;
    reflection: any;
    time: number;
    ripples: any[];
    rippleUniforms: Float32Array<ArrayBuffer>;
    /** Advance from the engine lifecycle, once per shared material per frame. */
    Advance(dt: any): void;
    /** Bounded, world-space impact ring; x/z match the water mesh world position. */
    AddRipple(point: any, strength?: number): void;
}
import { StandardMaterial } from './StandardMaterial.js';
