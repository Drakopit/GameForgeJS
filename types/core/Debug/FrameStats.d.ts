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
    static "__#private@#global": any;
    /** The page-wide instance used by the engine and the overlay. */
    static get global(): any;
    static "__#private@#emptyCounters"(): {
        drawCalls: number;
        triangles: number;
        vertices: number;
        shaderBinds: number;
        textureBinds: number;
    };
    /** Frames after which a count nobody reports any more shows as unknown (about 1 s at 60 Hz). */
    static STALE_FRAMES: number;
    /**
     * Wraps the WebGL / WebGL2 / Canvas 2D prototypes of this realm once, reporting to `stats`.
     * Safe to call repeatedly; later calls only change the target.
     */
    static Instrument(stats?: any): void;
    constructor({ historySize }?: {
        historySize?: number;
    });
    enabled: boolean;
    current: {
        drawCalls: number;
        triangles: number;
        vertices: number;
        shaderBinds: number;
        textureBinds: number;
    };
    last: {
        drawCalls: number;
        triangles: number;
        vertices: number;
        shaderBinds: number;
        textureBinds: number;
    };
    observed: {};
    history: Float32Array<ArrayBuffer>;
    historyIndex: number;
    lastCommit: number;
    fps: number;
    frameMs: number;
    workMs: number;
    workLastMs: number;
    fpsFrames: number;
    fpsTime: number;
    lastImage: any;
    /** Starts measuring (instruments the rendering APIs on first use). */
    Enable(): this;
    Disable(): this;
    /** Forgets every sample (the HUD calls it when it opens, so old frames do not show). */
    Reset(): this;
    /** Records draw work: `count` calls producing `vertices` and `triangles`. */
    Draw(vertices?: number, triangles?: number, count?: number): void;
    BindShader(): void;
    BindTexture(): void;
    /**
     * Reports a value owned by an engine system for this frame (e.g. "entities", "bodies",
     * "meshes"). Several sources of the same kind in one frame add up; the same source reporting
     * again in that frame (a physics world stepping twice) replaces its own value.
     * @param {string} kind
     * @param {number} value
     * @param {*} [source] - Who reports it (the world, the renderer); one default source if omitted.
     */
    Observe(kind: string, value: number, source?: any): void;
    /**
     * Time the game spent updating and drawing a frame, in ms (reported by the loop). The HUD
     * shows a moving average (`workMs`); `workLastMs` is the last frame alone.
     */
    Work(ms: any): void;
    /** Closes the current frame: its counters become `last` and the frame time is sampled. */
    Commit(now?: number): void;
    /** Frame times (ms), oldest first. */
    FrameTimes(): any[];
    /** Everything the HUD shows, as plain numbers. */
    Snapshot(): {
        entities: any;
        bodies: any;
        meshes: any;
        observed: {
            [k: string]: any;
        };
        heapUsedMB: number;
        heapLimitMB: number;
        drawCalls: number;
        triangles: number;
        vertices: number;
        shaderBinds: number;
        textureBinds: number;
        fps: number;
        frameMs: number;
        worstMs: any;
        p95Ms: any;
        workMs: number;
        workLastMs: number;
    };
}
