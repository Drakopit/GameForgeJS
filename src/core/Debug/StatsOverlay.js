import { FrameStats } from "./FrameStats.js";

const PANEL_CSS = `
position:fixed;top:8px;right:8px;z-index:2147483646;min-width:212px;padding:8px 10px 6px;
background:rgba(10,12,18,.82);color:#e6edf3;border:1px solid rgba(255,255,255,.14);border-radius:6px;
font:11px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace;pointer-events:none;user-select:none;
backdrop-filter:blur(4px);box-shadow:0 4px 18px rgba(0,0,0,.35);white-space:pre;`;

/** Tells the page that embeds this game (if any) about the HUD; postMessage works across origins. */
function notifyHost(detail) {
    if (typeof window === "undefined" || window.parent === window) return;
    try { window.parent.postMessage({ source: "gameforge-play", type: "stats", ...detail }, "*"); } catch { /* detached frame */ }
}
const format = (value, digits = 0) => (value === null || value === undefined ? "—" : Number(value).toLocaleString("en-US", { maximumFractionDigits: digits, minimumFractionDigits: digits }));

/**
 * "Stats for Nerds" HUD: FPS and frame time (with a frame-time graph), draw calls, triangles,
 * vertices, entities, bodies, shader and texture binds, and JS heap.
 *
 * `StatsOverlay.Install()` adds a toggle key (F3 by default) to the page; the editor's Play
 * mode toggles the same overlay inside the running game. The overlay commits FrameStats once
 * per animation frame and repaints its text a few times per second.
 */
export class StatsOverlay {
    static #instance = null;

    /** The page-wide overlay (created on first use). */
    static get instance() {
        StatsOverlay.#instance ??= new StatsOverlay();
        return StatsOverlay.#instance;
    }

    /**
     * Binds the toggle key once per page and exposes `globalThis.__gameforgeStats` so hosts
     * (the editor's Play mode) can toggle it. Inside a frame it also talks to the embedding page
     * with `postMessage`, which works across origins (the desktop editor's local preview):
     * it announces `{ source: "gameforge-play", type: "stats", ready: true, visible }`, reports every
     * toggle the same way, and obeys `{ source: "gameforge-editor", action: "stats", visible }`.
     * Returns a cleanup function.
     * @param {{ key?: string, visible?: boolean }} [options]
     */
    static Install({ key = "F3", visible = false } = {}) {
        const overlay = StatsOverlay.instance;
        overlay.installs += 1;
        if (overlay.installs === 1 && typeof window !== "undefined") {
            overlay.onKey = event => {
                if (event.code !== key && event.key !== key) return;
                event.preventDefault();
                overlay.Toggle();
            };
            window.addEventListener("keydown", overlay.onKey);
            overlay.onHostMessage = event => {
                const data = event.data;
                if (event.source !== window.parent || data?.source !== "gameforge-editor" || data.action !== "stats") return;
                if (data.visible) overlay.Show();
                else overlay.Hide();
                notifyHost({ visible: overlay.visible });
            };
            overlay.onToggle = event => notifyHost({ visible: Boolean(event.detail?.visible) });
            window.addEventListener("message", overlay.onHostMessage);
            window.addEventListener("gameforge:stats", overlay.onToggle);
            globalThis.__gameforgeStats = {
                toggle: () => overlay.Toggle(),
                show: () => overlay.Show(),
                hide: () => overlay.Hide(),
                get visible() { return overlay.visible; },
                snapshot: () => overlay.stats.Snapshot(),
            };
        }
        // A host (the editor's Play) may ask for the HUD before the game has started.
        if (visible || globalThis.__gameforgeStatsWanted === true) overlay.Show();
        if (overlay.installs === 1) notifyHost({ ready: true, visible: overlay.visible });
        return () => {
            overlay.installs = Math.max(0, overlay.installs - 1);
            if (overlay.installs) return;
            overlay.Hide();
            if (overlay.onKey) window.removeEventListener("keydown", overlay.onKey);
            if (overlay.onHostMessage) window.removeEventListener("message", overlay.onHostMessage);
            if (overlay.onToggle) window.removeEventListener("gameforge:stats", overlay.onToggle);
            overlay.onKey = overlay.onHostMessage = overlay.onToggle = null;
            if (globalThis.__gameforgeStats) delete globalThis.__gameforgeStats;
        };
    }

    constructor(stats = FrameStats.global) {
        this.stats = stats;
        this.visible = false;
        this.installs = 0;
        this.onKey = null;
        this.element = null;
        this.text = null;
        this.graph = null;
        this.frameId = null;
        this.lastPaint = 0;
        this.tick = now => this.#frame(now);
    }

    Toggle() {
        if (this.visible) this.Hide();
        else this.Show();
        return this.visible;
    }

    Show() {
        if (this.visible || typeof document === "undefined") return;
        this.visible = true;
        this.stats.Reset().Enable();
        if (!this.element) this.#build();
        (document.body ?? document.documentElement).appendChild(this.element);
        this.frameId = requestAnimationFrame(this.tick);
        globalThis.dispatchEvent?.(new CustomEvent("gameforge:stats", { detail: { visible: true } }));
    }

    Hide() {
        if (!this.visible) return;
        this.visible = false;
        this.stats.Disable();
        if (this.frameId !== null) cancelAnimationFrame(this.frameId);
        this.frameId = null;
        this.stats.lastCommit = null;
        this.element?.remove();
        globalThis.dispatchEvent?.(new CustomEvent("gameforge:stats", { detail: { visible: false } }));
    }

    #build() {
        const element = document.createElement("div");
        element.setAttribute("data-gameforge-stats", "");
        element.setAttribute("aria-hidden", "true");
        element.style.cssText = PANEL_CSS;
        const title = document.createElement("div");
        title.textContent = "Stats for Nerds";
        title.style.cssText = "font-weight:700;color:#7cc4ff;margin-bottom:3px;letter-spacing:.3px;";
        const graph = document.createElement("canvas");
        graph.width = 200;
        graph.height = 34;
        graph.style.cssText = "display:block;width:200px;height:34px;margin:2px 0 4px;background:rgba(255,255,255,.04);border-radius:3px;";
        const text = document.createElement("div");
        element.append(title, graph, text);
        this.element = element;
        this.text = text;
        this.graph = graph;
    }

    #frame(now) {
        this.frameId = null;
        if (!this.visible) return;
        // Wrapped draws from this callback onward belong to the next frame.
        this.stats.Commit(now);
        if (now - this.lastPaint > 250) {
            this.lastPaint = now;
            this.#paint();
        }
        this.frameId = requestAnimationFrame(this.tick);
    }

    #paint() {
        const s = this.stats.Snapshot();
        const heap = s.heapUsedMB === null ? "n/a (browser)" : `${format(s.heapUsedMB, 1)} / ${format(s.heapLimitMB, 0)} MB`;
        const rows = [
            ["FPS", `${format(s.fps, 1)}`],
            ["Frame", `${format(s.frameMs, 2)} ms  (p95 ${format(s.p95Ms, 1)}, max ${format(s.worstMs, 1)})`],
            ["Update+draw", `${format(s.workMs, 2)} ms avg  (last ${format(s.workLastMs, 1)})`],
            ["Draw calls", format(s.drawCalls)],
            ["Triangles", format(s.triangles)],
            ["Vertices", format(s.vertices)],
            ["Entities", format(s.entities)],
            // Only a physics world (PhysicsWorld3D) reports bodies; 2D games have none.
            ["Bodies", s.bodies === null ? "— (no physics world)" : format(s.bodies)],
            ["Meshes", format(s.meshes)],
            ["Shader binds", format(s.shaderBinds)],
            ["Texture binds", format(s.textureBinds)],
            ["JS heap", heap],
        ];
        this.text.textContent = rows.map(([label, value]) => `${label.padEnd(13)} ${value}`).join("\n");
        this.#drawGraph();
    }

    #drawGraph() {
        const context = this.graph.getContext("2d");
        if (!context) return;
        // Our own drawing must not count as game work.
        const enabled = this.stats.enabled;
        this.stats.enabled = false;
        const { width, height } = this.graph;
        const times = this.stats.FrameTimes();
        context.clearRect(0, 0, width, height);
        const budget = 1000 / 60;
        const scale = height / (budget * 2.5);
        context.fillStyle = "rgba(124,196,255,.18)";
        context.fillRect(0, height - budget * scale, width, 1);
        const step = width / Math.max(1, this.stats.history.length);
        times.forEach((ms, index) => {
            const bar = Math.min(height, ms * scale);
            context.fillStyle = ms > budget * 2 ? "#ff6b6b" : ms > budget * 1.15 ? "#f5c542" : "#4ade80";
            context.fillRect(width - (times.length - index) * step, height - bar, Math.max(1, step - 0.5), bar);
        });
        this.stats.enabled = enabled;
    }
}
