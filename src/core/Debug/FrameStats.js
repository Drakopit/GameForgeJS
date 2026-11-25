/**
 * Per-frame rendering and simulation counters ("Stats for Nerds").
 *
 * When enabled, the WebGL and Canvas 2D prototypes are wrapped once, so every renderer in the
 * page (Render3D, legacy 3D, 2D canvases) is measured without knowing about this class:
 * draw calls, triangles, vertices, shader (program) binds and texture binds. Engine systems
 * report counts they own with `Observe` (entities from the game loop, bodies from physics
 * worlds, visible meshes from the 3D renderer). Disabled, the wrappers cost one flag check.
 *
 * An observed count is per source: a physics world stepping three times in one catch-up frame
 * still reports its bodies once, while two worlds add up. A count no source has reported for
 * about a second (its level is gone) shows as unknown again instead of a stale number.
 *
 * A frame is committed by `Commit()` once per animation frame (StatsOverlay does it), so the
 * snapshot always shows the last complete frame.
 */
export class FrameStats {
    static #global = null;

    /** The page-wide instance used by the engine and the overlay. */
    static get global() {
        FrameStats.#global ??= new FrameStats();
        return FrameStats.#global;
    }

    constructor({ historySize = 120 } = {}) {
        this.enabled = false;
        this.current = FrameStats.#emptyCounters();
        this.last = FrameStats.#emptyCounters();
        this.observed = {};
        this.history = new Float32Array(historySize);
        this.historyIndex = 0;
        this.lastCommit = null;
        this.fps = 0;
        this.frameMs = 0;
        this.workMs = 0;
        this.workLastMs = 0;
        this.fpsFrames = 0;
        this.fpsTime = 0;
        this.lastImage = null;
    }

    static #emptyCounters() {
        return { drawCalls: 0, triangles: 0, vertices: 0, shaderBinds: 0, textureBinds: 0 };
    }

    /** Starts measuring (instruments the rendering APIs on first use). */
    Enable() {
        this.enabled = true;
        FrameStats.Instrument(this);
        return this;
    }

    Disable() {
        this.enabled = false;
        return this;
    }

    /** Forgets every sample (the HUD calls it when it opens, so old frames do not show). */
    Reset() {
        this.current = FrameStats.#emptyCounters();
        this.last = FrameStats.#emptyCounters();
        this.observed = {};
        this.history.fill(0);
        this.historyIndex = 0;
        this.lastCommit = null;
        this.fps = this.frameMs = this.workMs = this.workLastMs = 0;
        this.fpsFrames = this.fpsTime = 0;
        this.lastImage = null;
        return this;
    }

    /** Records draw work: `count` calls producing `vertices` and `triangles`. */
    Draw(vertices = 0, triangles = 0, count = 1) {
        if (!this.enabled) return;
        this.current.drawCalls += count;
        this.current.vertices += vertices;
        this.current.triangles += triangles;
    }

    BindShader() { if (this.enabled) this.current.shaderBinds += 1; }
    BindTexture() { if (this.enabled) this.current.textureBinds += 1; }

    /** Frames after which a count nobody reports any more shows as unknown (about 1 s at 60 Hz). */
    static STALE_FRAMES = 60;

    /**
     * Reports a value owned by an engine system for this frame (e.g. "entities", "bodies",
     * "meshes"). Several sources of the same kind in one frame add up; the same source reporting
     * again in that frame (a physics world stepping twice) replaces its own value.
     * @param {string} kind
     * @param {number} value
     * @param {*} [source] - Who reports it (the world, the renderer); one default source if omitted.
     */
    Observe(kind, value, source = "default") {
        if (!this.enabled || !Number.isFinite(value)) return;
        const entry = this.observed[kind] ??= { sources: new Map(), frame: -1, shown: null };
        if (entry.frame !== this.historyIndex) entry.sources.clear();
        entry.sources.set(source, value);
        entry.frame = this.historyIndex;
    }

    /**
     * Time the game spent updating and drawing a frame, in ms (reported by the loop). The HUD
     * shows a moving average (`workMs`); `workLastMs` is the last frame alone.
     */
    Work(ms) {
        if (!this.enabled || !Number.isFinite(ms)) return;
        this.workLastMs = ms;
        this.workMs = this.workMs ? this.workMs + (ms - this.workMs) * 0.1 : ms;
    }

    /** Closes the current frame: its counters become `last` and the frame time is sampled. */
    Commit(now = globalThis.performance?.now?.() ?? Date.now()) {
        if (this.lastCommit !== null) {
            const delta = Math.max(0, now - this.lastCommit);
            this.frameMs = delta;
            this.history[this.historyIndex % this.history.length] = delta;
            this.fpsFrames += 1;
            this.fpsTime += delta;
            if (this.fpsTime >= 500) {
                this.fps = (this.fpsFrames * 1000) / this.fpsTime;
                this.fpsFrames = 0;
                this.fpsTime = 0;
            }
        }
        this.lastCommit = now;
        this.last = this.current;
        this.current = FrameStats.#emptyCounters();
        for (const entry of Object.values(this.observed)) {
            if (entry.frame === this.historyIndex) entry.shown = [...entry.sources.values()].reduce((sum, value) => sum + value, 0);
            else if (this.historyIndex - entry.frame > FrameStats.STALE_FRAMES) entry.shown = null;
        }
        this.historyIndex += 1;
        this.lastImage = null;
    }

    /** Frame times (ms), oldest first. */
    FrameTimes() {
        const size = this.history.length;
        const count = Math.min(size, Math.max(0, this.historyIndex - 1));
        const out = new Array(count);
        for (let i = 0; i < count; i++) out[i] = this.history[(this.historyIndex - count + i + size) % size];
        return out;
    }

    /** Everything the HUD shows, as plain numbers. */
    Snapshot() {
        const times = this.FrameTimes();
        const sorted = [...times].sort((a, b) => a - b);
        const memory = globalThis.performance?.memory;
        const observed = Object.fromEntries(Object.entries(this.observed).map(([kind, entry]) => [kind, entry.shown]));
        return {
            fps: this.fps,
            frameMs: this.frameMs,
            worstMs: sorted.at(-1) ?? 0,
            p95Ms: sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))] : 0,
            workMs: this.workMs,
            workLastMs: this.workLastMs,
            ...this.last,
            entities: observed.entities ?? null,
            bodies: observed.bodies ?? null,
            meshes: observed.meshes ?? null,
            observed,
            heapUsedMB: memory ? memory.usedJSHeapSize / 1048576 : null,
            heapLimitMB: memory ? memory.jsHeapSizeLimit / 1048576 : null,
        };
    }

    /**
     * Wraps the WebGL / WebGL2 / Canvas 2D prototypes of this realm once, reporting to `stats`.
     * Safe to call repeatedly; later calls only change the target.
     */
    static Instrument(stats = FrameStats.global) {
        const realm = globalThis;
        if (realm.__gameforgeFrameStats) {
            realm.__gameforgeFrameStats.target = stats;
            return;
        }
        const hook = { target: stats };
        realm.__gameforgeFrameStats = hook;
        const TRIANGLES = 4, TRIANGLE_STRIP = 5, TRIANGLE_FAN = 6;
        const triangles = (mode, count) => (mode === TRIANGLES ? Math.floor(count / 3) : mode === TRIANGLE_STRIP || mode === TRIANGLE_FAN ? Math.max(0, count - 2) : 0);
        const wrap = (proto, name, before) => {
            const original = proto?.[name];
            if (typeof original !== "function" || original.__gfStats) return;
            const wrapped = function (...args) {
                if (hook.target.enabled) before.apply(this, args);
                return original.apply(this, args);
            };
            wrapped.__gfStats = true;
            proto[name] = wrapped;
        };
        for (const GL of [realm.WebGLRenderingContext, realm.WebGL2RenderingContext]) {
            const proto = GL?.prototype;
            if (!proto) continue;
            wrap(proto, "drawArrays", (mode, first, count) => hook.target.Draw(count, triangles(mode, count)));
            wrap(proto, "drawElements", (mode, count) => hook.target.Draw(count, triangles(mode, count)));
            wrap(proto, "drawArraysInstanced", (mode, first, count, instances) => hook.target.Draw(count * instances, triangles(mode, count) * instances));
            wrap(proto, "drawElementsInstanced", (mode, count, type, offset, instances) => hook.target.Draw(count * instances, triangles(mode, count) * instances));
            wrap(proto, "useProgram", program => { if (program) hook.target.BindShader(); });
            wrap(proto, "bindTexture", (target, texture) => { if (texture) hook.target.BindTexture(); });
        }
        const canvas2d = realm.CanvasRenderingContext2D?.prototype;
        if (canvas2d) {
            // A 2D sprite is one textured quad: 4 vertices, 2 triangles. A new source image counts as a texture bind.
            wrap(canvas2d, "drawImage", image => {
                hook.target.Draw(4, 2);
                if (image !== hook.target.lastImage) {
                    hook.target.lastImage = image;
                    hook.target.BindTexture();
                }
            });
            for (const name of ["fillRect", "strokeRect"]) wrap(canvas2d, name, () => hook.target.Draw(4, 2));
            for (const name of ["fill", "stroke", "fillText", "strokeText"]) wrap(canvas2d, name, () => hook.target.Draw(0, 0));
        }
    }
}
