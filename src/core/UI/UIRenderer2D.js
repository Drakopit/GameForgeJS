// @ts-check
/**
 * Draws a UICanvas with a CanvasRenderingContext2D — the game's UI screen (ScreenUI in 3D
 * levels, the 2D screen in 2D levels) or any 2D context (the editor's viewport overlay). It only
 * needs a context: no DOM elements are created, so the HUD is part of the game's frame and
 * pixel-identical everywhere.
 *
 * With `pointer`, it listens to pointer events on the context's canvas and feeds the canvas's
 * `Pointer` (hover, press, button actions).
 *
 * @example
 * const renderer = new UIRenderer2D(hud, { context: overlay.getContext("2d"), pointer: false });
 * renderer.Draw(); // every frame (UICanvas.OnGUI does it when the canvas is a level entity)
 */
export class UIRenderer2D {
    /**
     * @param {import("./UICanvas.js").UICanvas} canvas
     * @param {{screen?: {Context: CanvasRenderingContext2D, Canvas?: HTMLCanvasElement}|null, context?: CanvasRenderingContext2D|null, assets?: any, pointer?: boolean, placeholders?: boolean, clear?: boolean}} [options]
     *   `placeholders`: unset `{key}` bindings drawn as written (editor); `clear`: clear the
     *   context before drawing (only for a canvas the UI owns).
     */
    constructor(canvas, { screen = null, context = null, assets = null, pointer = true, placeholders = false, clear = false } = {}) {
        this.canvas = canvas;
        this.screen = screen;
        this.contextOption = context;
        this.assets = assets;
        this.pointer = pointer;
        this.placeholders = placeholders;
        this.clear = clear;
        /** @type {((event: any) => void)|null} */ this.handler = null;
    }

    /** @returns {CanvasRenderingContext2D|null} */
    get context() {
        return this.contextOption ?? this.screen?.Context ?? null;
    }

    OnStart(context) {
        this.assets ??= context?.assets ?? null;
        const element = this.context?.canvas;
        if (!this.pointer || !element || typeof element.addEventListener !== "function") return;
        const kinds = { pointermove: "move", pointerdown: "down", pointerup: "up" };
        this.handler = event => {
            const bounds = element.getBoundingClientRect();
            const x = (event.clientX - bounds.left) * (element.width / (bounds.width || element.width));
            const y = (event.clientY - bounds.top) * (element.height / (bounds.height || element.height));
            if (this.canvas.Pointer(kinds[event.type], x, y) && event.type !== "pointermove") event.preventDefault?.();
        };
        for (const type of Object.keys(kinds)) element.addEventListener(type, this.handler);
    }

    /** Lays the canvas out to the context's size and draws it. */
    Draw() {
        const ctx = this.context;
        if (!ctx) return;
        const width = ctx.canvas.width, height = ctx.canvas.height;
        if (this.clear) ctx.clearRect(0, 0, width, height);
        if (!this.canvas.settings.visible) return;
        const { scale } = this.canvas.Layout(width, height);
        ctx.save();
        // Screen space, whatever camera transform the game left on the context.
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.textBaseline = "middle";
        for (const element of this.canvas.Elements()) {
            if (element.shown) this.DrawElement(ctx, element, scale);
        }
        ctx.restore();
    }

    /** @param {CanvasRenderingContext2D} ctx @param {import("./UICanvas.js").UIElement} element @param {number} scale */
    DrawElement(ctx, element, scale) {
        const s = element.settings, r = element.rect;
        const radius = Math.min(s.radius * scale, r.width / 2, r.height / 2);
        const kind = s.kind;
        if (kind === "panel" || kind === "button" || kind === "progress" || (kind === "image" && !this.Image(s.image))) {
            let background = s.background;
            if (kind === "button") background = shade(background, element.pressed ? 0.75 : element.hover ? 1.15 : 1);
            fillRound(ctx, r.x, r.y, r.width, r.height, radius, background);
        }
        if (kind === "progress") {
            const fill = element.fraction * r.width;
            if (fill > 0) fillRound(ctx, r.x, r.y, fill, r.height, Math.min(radius, fill / 2), s.fill);
        } else if (kind === "image") {
            const image = this.Image(s.image);
            if (image) {
                // Contain: the whole image inside the rect, centred.
                const iw = image.naturalWidth || image.width, ih = image.naturalHeight || image.height;
                const k = Math.min(r.width / iw, r.height / ih);
                ctx.drawImage(image, r.x + (r.width - iw * k) / 2, r.y + (r.height - ih * k) / 2, iw * k, ih * k);
            }
        } else if (kind === "text" || kind === "button") {
            const text = element.Label({ keep: this.placeholders });
            if (!text) return;
            const padding = s.padding * scale;
            ctx.font = `${kind === "button" ? "600 " : ""}${s.fontSize * scale}px ${this.canvas.settings.fontFamily}`;
            ctx.fillStyle = css(s.color);
            const align = s.align === "center" ? "center" : s.align === "right" ? "right" : "left";
            ctx.textAlign = align;
            const x = align === "center" ? r.x + r.width / 2 : align === "right" ? r.x + r.width - padding : r.x + padding;
            ctx.save();
            ctx.beginPath();
            ctx.rect(r.x, r.y, r.width, r.height);
            ctx.clip();
            ctx.fillText(text, x, r.y + r.height / 2);
            ctx.restore();
        }
    }

    /** @param {string} name */
    Image(name) {
        return name ? this.assets?.images?.[name] ?? null : null;
    }

    OnDestroy() {
        const element = this.context?.canvas;
        if (this.handler && element) for (const type of ["pointermove", "pointerdown", "pointerup"]) element.removeEventListener(type, this.handler);
        this.handler = null;
    }
}

/** @param {number[]} color */
function css(color) {
    return `rgba(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)}, ${color[3] ?? 1})`;
}

/** @param {number[]} color @param {number} factor */
function shade(color, factor) {
    return [color[0] * factor, color[1] * factor, color[2] * factor, color[3] ?? 1].map((value, index) => (index < 3 ? Math.min(1, value) : value));
}

/** @param {CanvasRenderingContext2D} ctx @param {number[]} color */
function fillRound(ctx, x, y, width, height, radius, color) {
    if ((color[3] ?? 1) <= 0 || width <= 0 || height <= 0) return;
    ctx.fillStyle = css(color);
    ctx.beginPath();
    if (radius > 0 && typeof ctx.roundRect === "function") ctx.roundRect(x, y, width, height, radius);
    else ctx.rect(x, y, width, height);
    ctx.fill();
}
