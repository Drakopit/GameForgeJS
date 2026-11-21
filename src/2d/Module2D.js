import { Input } from '../core/Input/Input.js';
import { HUDFrame } from './UI/HUDFrame.js';
import { ScreenUI } from "./Window/ScreenUI.js";

/** Optional Canvas 2D renderer and overlay factory, owned by one game. */
export function module2D({ contextAttributes = {}, telemetry = false } = {}) {
    return {
        id: "2d",
        setup(context) {
            const overlays = new Set();
            if (telemetry) {
                let enabled = false, previous, frameMs = 0;
                const frames = new WeakMap();
                const toggle = () => { enabled = !enabled; };
                const stats = { toggle, get visible() { return enabled; } };
                const input = context.services.get('input') ?? (context.canvas ? null : Input.instance);
                const presentation = input?.presentation;
                if (presentation) presentation.telemetry = stats;
                context.services.set('telemetry', stats);
                const removeInput = context.events.on('gui', () => {
                    if (input?.keysDown.F2) toggle();
                });
                const removeDraw = context.events.on('PostUpdate', timestamp => {
                    if (previous !== undefined && timestamp > previous) {
                        const delta = timestamp - previous;
                        frameMs = frameMs ? frameMs * 0.9 + delta * 0.1 : delta;
                    }
                    previous = timestamp;
                    if (!enabled) return;
                    const level = context.game.currentLevel;
                    const screen = level?.ui?.Screen ?? level?.screen;
                    if (!screen?.Context || screen.inputModal || screen.Width < 80 || screen.Height < 45) return;
                    if (!frames.has(screen)) frames.set(screen, new HUDFrame({ screen }));
                    const frame = frames.get(screen);
                    const y = screen.Height - 37;
                    frame.Panel({ x: 8, y, width: Math.min(220, screen.Width - 16), height: 28 });
                    const fps = frameMs ? Math.round(1000 / frameMs) : 0;
                    frame.Text(`${fps} FPS / ${frameMs.toFixed(1)} ms / ${level.entities.length} entities`,
                        17, y + 18, { size: 12, maxWidth: screen.Width - 34 });
                });
                context.onDispose(() => {
                    removeInput();
                    removeDraw();
                    if (presentation?.telemetry === stats) presentation.telemetry = null;
                    context.services.delete('telemetry');
                });
            }
            context.onDispose(() => {
                for (const overlay of overlays) overlay.Dispose();
                overlays.clear();
                context.services.delete("createUI");
                context.services.delete("renderer2d");
            });
            context.services.set("createUI", (id, width, height, zIndex) => {
                const overlay = new ScreenUI(id, width, height, zIndex, { config: context.config });
                const dispose = overlay.Dispose.bind(overlay);
                overlay.Dispose = () => { dispose(); overlays.delete(overlay); };
                overlays.add(overlay);
                return overlay;
            });
            if (context.canvas) {
                const renderer = context.canvas.getContext("2d", contextAttributes);
                if (!renderer) throw new Error("module2D requires a canvas supporting Canvas 2D.");
                context.services.set("renderer2d", renderer);
            }
        },
    };
}
