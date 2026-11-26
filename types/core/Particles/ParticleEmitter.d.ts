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
 * `ParticleRenderer2D` (canvas) and `ParticleRenderer3D` (one batched mesh) draw it, in the
 * editor's viewport as in Play. Units are the scene's (world units in 3D, pixels in 2D).
 *
 * @example
 * const sparks = level.AddEntity(new ParticleEmitter({ rate: 40, blend: "additive" }, { origin: () => [0, 1, 0] }));
 * sparks.Emit(20); // an extra burst
 */
export class ParticleEmitter extends Component {
    /**
     * @param {Record<string, any>} [settings] - `ParticleEmitter` component values.
     * @param {{origin?: (() => number[])|null, name?: string}} [options] - `origin`: where the
     *   emitter is (the node's world position), read every frame.
     */
    constructor(settings?: Record<string, any>, { origin, name }?: {
        origin?: (() => number[]) | null;
        name?: string;
    });
    name: string;
    origin: () => number[];
    /** Particles not emitted because `maxParticles` were alive. */
    dropped: number;
    /** Applies new settings (editor changes); live particles keep flying. @param {Record<string, any>} settings */
    Configure(settings: Record<string, any>): void;
    settings: any;
    capacity: any;
    data: Float32Array<ArrayBuffer>;
    count: number;
    random: () => number;
    direction: number[];
    /** Starts (or restarts) emitting; the burst fires now. */
    Play(): void;
    playing: boolean;
    time: number;
    carry: number;
    /** Stops emitting; `clear` also removes the live particles. @param {{clear?: boolean}} [options] */
    Stop({ clear }?: {
        clear?: boolean;
    }): void;
    /** Where new particles start: the origin, or 0 in local space. */
    Origin(): number[];
    /** Emits `count` particles now (dropped past maxParticles). @param {number} count */
    Emit(count: number): void;
    ShapeOffset(): number[];
    /** @param {number} dt */
    OnUpdate(dt?: number): void;
    /**
     * Calls `visit` for every live particle with its drawn position (local-space particles follow
     * the origin), colour and size.
     * @param {(x: number, y: number, z: number, color: number[], size: number) => void} visit
     */
    ForEach(visit: (x: number, y: number, z: number, color: number[], size: number) => void): void;
}
import { Component } from "../Component.js";
