/**
 * "Stats for Nerds" HUD: FPS and frame time (with a frame-time graph), draw calls, triangles,
 * vertices, entities, bodies, shader and texture binds, and JS heap.
 *
 * `StatsOverlay.Install()` adds a toggle key (F3 by default) to the page; the editor's Play
 * mode toggles the same overlay inside the running game. The overlay commits FrameStats once
 * per animation frame and repaints its text a few times per second.
 */
export class StatsOverlay {
    static "__#private@#instance": any;
    /** The page-wide overlay (created on first use). */
    static get instance(): any;
    /**
     * Binds the toggle key once per page and exposes `globalThis.__gameforgeStats` so hosts
     * (the editor's Play mode) can toggle it. Returns a cleanup function.
     * @param {{ key?: string, visible?: boolean }} [options]
     */
    static Install({ key, visible }?: {
        key?: string;
        visible?: boolean;
    }): () => void;
    constructor(stats?: any);
    stats: any;
    visible: boolean;
    installs: number;
    onKey: any;
    element: HTMLDivElement;
    text: HTMLDivElement;
    graph: HTMLCanvasElement;
    frameId: number;
    lastPaint: number;
    tick: (now: any) => void;
    Toggle(): boolean;
    Show(): void;
    Hide(): void;
    #private;
}
