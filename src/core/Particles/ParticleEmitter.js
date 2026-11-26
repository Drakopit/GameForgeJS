// @ts-check
import { Component } from "../Component.js";
import { SceneComponents } from "../Scene/SceneComponents.js";
import { TargetPosition } from "../Scene/Targets.js";

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
    constructor(settings = {}, { target = null, renderer = null, name = "" } = {}) {
        super();
        this.name = name;
        this.target = target;
        /** Particles not emitted because `maxParticles` were alive. */
        this.dropped = 0;
        this.Configure(settings);
        // Created after Configure, so the renderer sees the emitter's capacity.
        /** @type {any} */
        this.renderer = typeof renderer === "function" ? renderer(this) : renderer;
    }

    /** Applies new settings (editor changes); live particles keep flying. @param {Record<string, any>} settings */
    Configure(settings) {
        const previous = this.count ?? 0;
        this.settings = SceneComponents.Resolve("ParticleEmitter", settings);
        const capacity = Math.max(1, Math.floor(this.settings.maxParticles));
        if (capacity !== this.capacity) {
            const keep = Math.min(previous, capacity);
            const old = this.data;
            this.capacity = capacity;
            // Per particle: position xyz, velocity xyz, age, life.
            this.data = new Float32Array(capacity * 8);
            if (old) this.data.set(old.subarray(0, keep * 8));
            this.count = keep;
        }
        this.random = this.settings.seed > 0 ? seededRandom(this.settings.seed) : Math.random;
        this.direction = normalize(this.settings.direction);
        this.time ??= 0;
        this.carry ??= 0;
        this.playing ??= false;
    }

    OnStart(context) {
        this.renderer?.OnStart?.(context);
        if (this.settings.playOnStart) this.Play();
    }

    /** Starts (or restarts) emitting; the burst fires now. */
    Play() {
        this.playing = true;
        this.time = 0;
        this.carry = 0;
        if (this.settings.burst > 0) this.Emit(this.settings.burst);
    }

    /** Stops emitting; `clear` also removes the live particles. @param {{clear?: boolean}} [options] */
    Stop({ clear = false } = {}) {
        this.playing = false;
        if (clear) this.count = 0;
    }

    /** Where the emitter is (its target's world position, or the origin). */
    Origin() {
        return TargetPosition(this.target) ?? [0, 0, 0];
    }

    /** Emits `count` particles now (dropped past maxParticles). @param {number} count */
    Emit(count) {
        const s = this.settings, origin = this.settings.space === "world" ? this.Origin() : [0, 0, 0];
        for (let n = 0; n < count; n++) {
            if (this.count >= this.capacity) { this.dropped += count - n; return; }
            const i = this.count++ * 8, d = this.data, r = this.random;
            const offset = this.ShapeOffset();
            const speed = lerp(s.speed[0], s.speed[1], r());
            const v = coneDirection(this.direction, (s.spread * Math.PI) / 180, r);
            d[i] = origin[0] + offset[0]; d[i + 1] = origin[1] + offset[1]; d[i + 2] = (origin[2] ?? 0) + offset[2];
            d[i + 3] = v[0] * speed; d[i + 4] = v[1] * speed; d[i + 5] = v[2] * speed;
            d[i + 6] = 0;
            d[i + 7] = Math.max(0.01, lerp(s.lifetime[0], s.lifetime[1], r()));
        }
    }

    ShapeOffset() {
        const s = this.settings, r = this.random;
        if (s.shape === "box") return [(r() - 0.5) * s.shapeSize[0], (r() - 0.5) * s.shapeSize[1], (r() - 0.5) * s.shapeSize[2]];
        if (s.shape === "sphere") {
            const v = coneDirection([0, 1, 0], Math.PI, r), radius = s.shapeSize[0] * Math.cbrt(r());
            return [v[0] * radius, v[1] * radius, v[2] * radius];
        }
        return [0, 0, 0];
    }

    /** @param {number} dt */
    OnUpdate(dt = 1 / 60) {
        if (!Number.isFinite(dt) || dt < 0) return;
        const s = this.settings;
        if (this.playing) {
            this.time += dt;
            if (!s.loop && this.time >= s.duration) this.playing = false;
            else {
                if (s.loop && this.time >= s.duration) {
                    this.time %= s.duration;
                    if (s.burst > 0) this.Emit(s.burst);
                }
                this.carry += s.rate * dt;
                const whole = Math.floor(this.carry);
                this.carry -= whole;
                if (whole > 0) this.Emit(whole);
            }
        }
        const d = this.data, g = s.gravity;
        for (let p = this.count - 1; p >= 0; p--) {
            const i = p * 8;
            d[i + 6] += dt;
            if (d[i + 6] >= d[i + 7]) {
                // Swap-remove: the last particle takes this slot.
                const last = --this.count * 8;
                if (last !== i) d.copyWithin(i, last, last + 8);
                continue;
            }
            d[i + 3] += g[0] * dt; d[i + 4] += g[1] * dt; d[i + 5] += (g[2] ?? 0) * dt;
            d[i] += d[i + 3] * dt; d[i + 1] += d[i + 4] * dt; d[i + 2] += d[i + 5] * dt;
        }
        this.renderer?.OnUpdate?.(dt);
    }

    OnDrawn() {
        this.renderer?.OnDrawn?.();
    }

    ToJSON() {
        return structuredClone(this.settings);
    }

    /**
     * Calls `visit` for every live particle with its drawn position (local-space particles follow
     * the origin), colour and size.
     * @param {(x: number, y: number, z: number, color: number[], size: number) => void} visit
     */
    ForEach(visit) {
        const s = this.settings, d = this.data;
        const shift = s.space === "local" ? this.Origin() : [0, 0, 0];
        const color = [0, 0, 0, 0];
        for (let p = 0; p < this.count; p++) {
            const i = p * 8, t = d[i + 6] / d[i + 7];
            SampleGradient(s.colorOverLife, t, color);
            visit(d[i] + shift[0], d[i + 1] + shift[1], d[i + 2] + (shift[2] ?? 0), color, SampleCurve(s.sizeOverLife, t));
        }
    }

    OnDestroy() {
        this.count = 0;
        this.renderer?.OnDestroy?.();
        this.renderer = null;
        this.target = null;
    }
}

/**
 * Colour of a gradient ([[t, [r, g, b, a]], …], t ascending) at t (0..1).
 * @param {any[]} stops @param {number} t @param {number[]} [out]
 */
export function SampleGradient(stops, t, out = [0, 0, 0, 0]) {
    if (!Array.isArray(stops) || !stops.length) { out[0] = out[1] = out[2] = out[3] = 1; return out; }
    let a = stops[0], b = stops[stops.length - 1];
    for (let k = 0; k < stops.length - 1; k++) if (t >= stops[k][0] && t <= stops[k + 1][0]) { a = stops[k]; b = stops[k + 1]; break; }
    const span = b[0] - a[0], f = span > 0 ? Math.min(1, Math.max(0, (t - a[0]) / span)) : 0;
    for (let c = 0; c < 4; c++) out[c] = lerp(a[1][c] ?? 1, b[1][c] ?? 1, f);
    return out;
}

/** Value of a curve ([[t, value], …], t ascending) at t (0..1). @param {any[]} points @param {number} t */
export function SampleCurve(points, t) {
    if (!Array.isArray(points) || !points.length) return 1;
    if (t <= points[0][0]) return points[0][1];
    for (let k = 0; k < points.length - 1; k++) {
        const [t0, v0] = points[k], [t1, v1] = points[k + 1];
        if (t <= t1) return lerp(v0, v1, t1 > t0 ? (t - t0) / (t1 - t0) : 0);
    }
    return points[points.length - 1][1];
}

/** @param {number} a @param {number} b @param {number} t */
function lerp(a, b, t) { return a + (b - a) * t; }

/** @param {number[]} v */
function normalize(v) {
    const length = Math.hypot(v[0], v[1], v[2] ?? 0);
    return length > 0 ? [v[0] / length, v[1] / length, (v[2] ?? 0) / length] : [0, 1, 0];
}

/** A random unit vector within `angle` radians of `axis` (uniform over the cap). */
function coneDirection(axis, angle, random) {
    const cosAngle = Math.cos(angle);
    const z = cosAngle + (1 - cosAngle) * random();
    const phi = random() * Math.PI * 2;
    const ring = Math.sqrt(Math.max(0, 1 - z * z));
    const local = [ring * Math.cos(phi), ring * Math.sin(phi), z];
    // Basis around the axis.
    const helper = Math.abs(axis[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const u = normalize(cross(helper, axis)), w = cross(axis, u);
    return [
        u[0] * local[0] + w[0] * local[1] + axis[0] * local[2],
        u[1] * local[0] + w[1] * local[1] + axis[1] * local[2],
        u[2] * local[0] + w[2] * local[1] + axis[2] * local[2],
    ];
}

function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

/** Deterministic random numbers (mulberry32) for a fixed `seed`. @param {number} seed */
function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
