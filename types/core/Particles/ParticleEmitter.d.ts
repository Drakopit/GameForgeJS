/**
 * Colour of a gradient ([[t, [r, g, b, a]], …], t ascending) at t (0..1).
 * @param {any[]} stops @param {number} t @param {number[]} [out]
 */
export function SampleGradient(stops: any[], t: number, out?: number[]): number[];
/** Value of a curve ([[t, value], …], t ascending) at t (0..1). @param {any[]} points @param {number} t */
export function SampleCurve(points: any[], t: number): any;
/**
 * Bounded particle simulation shared by 2D and 3D: emission (rate, bursts, shape, cone),
 * motion (speed, gravity) and colour / size over each particle's life. It only simulates;
 * its `renderer` (`ParticleRenderer2D` on a canvas, `ParticleRenderer3D` as one batched mesh)
 * draws it and follows its lifecycle, so an emitter is one level entity. Units are the scene's
 * (world units in 3D, pixels in 2D). The scene's `ParticleEmitter` component is exactly `settings`.
 *
 * @example
 * // Code first: Particles3D / Particles2D pick the renderer
 * const sparks = level.AddEntity(Particles3D(level.scene, { rate: 40, blend: "additive" }, { target: torch }));
 * sparks.Emit(20); // an extra burst
 */
export class ParticleEmitter extends Component {
    /**
     * @param {Record<string, any>} [settings] - `ParticleEmitter` component values.
     * @param {{target?: any, renderer?: ((emitter: ParticleEmitter) => any)|any, name?: string}} [options]
     *   `target`: where the emitter is, read every frame (a node, Transform3D, 2D object, [x, y, z]
     *   or a function; see Targets.js); `renderer`: draws the particles (a renderer or a factory).
     */
    constructor(settings?: Record<string, any>, { target, renderer, name }?: {
        target?: any;
        renderer?: ((emitter: ParticleEmitter) => any) | any;
        name?: string;
    });
    name: string;
    target: any;
    /** Particles not emitted because `maxParticles` were alive. */
    dropped: number;
    /** @type {any} */
    renderer: any;
    /** Applies new settings (editor changes); live particles keep flying. @param {Record<string, any>} settings */
    Configure(settings: Record<string, any>): void;
    settings: any;
    capacity: any;
    data: Float32Array<ArrayBuffer>;
    count: number;
    random: () => number;
    direction: number[];
    OnStart(context: any): void;
    /** Starts (or restarts) emitting; the burst fires now. */
    Play(): void;
    playing: boolean;
    time: number;
    carry: number;
    /** Stops emitting; `clear` also removes the live particles. @param {{clear?: boolean}} [options] */
    Stop({ clear }?: {
        clear?: boolean;
    }): void;
    /** Where the emitter is (its target's world position, or the origin). */
    Origin(): number[];
    /** Emits `count` particles now (dropped past maxParticles). @param {number} count */
    Emit(count: number): void;
    ShapeOffset(): number[];
    /** @param {number} dt */
    OnUpdate(dt?: number): void;
    ToJSON(): any;
    /**
     * Calls `visit` for every live particle with its drawn position (local-space particles follow
     * the origin), colour and size.
     * @param {(x: number, y: number, z: number, color: number[], size: number) => void} visit
     */
    ForEach(visit: (x: number, y: number, z: number, color: number[], size: number) => void): void;
}
import { Component } from "../Component.js";
