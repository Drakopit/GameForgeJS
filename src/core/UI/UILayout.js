// @ts-check
/** Pure layout and binding helpers of the in-game UI (no DOM, no canvas). */

/**
 * Rectangle of an element inside its parent: `anchor` picks the corner, edge or centre the
 * `offset` is measured from (inwards for right / bottom anchors); `stretch` fills the parent
 * minus the offset on every side.
 * @param {string} anchor @param {number[]} offset @param {number[]} size @param {number[]} parent
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function LayoutRect(anchor, offset, size, parent) {
    const [ox, oy] = offset, [pw, ph] = parent;
    if (anchor === "stretch") return { x: ox, y: oy, width: Math.max(0, pw - ox * 2), height: Math.max(0, ph - oy * 2) };
    const [width, height] = size;
    const [vertical, horizontal] = anchor === "center" ? ["center", "center"]
        : anchor.includes("-") ? anchor.split("-")
        : ["top", "bottom"].includes(anchor) ? [anchor, "center"] : ["center", anchor];
    const x = horizontal === "left" ? ox : horizontal === "right" ? pw - width - ox : (pw - width) / 2 + ox;
    const y = vertical === "top" ? oy : vertical === "bottom" ? ph - height - oy : (ph - height) / 2 + oy;
    return { x, y, width, height };
}

/**
 * `"HP {hp}/{max}"` with values from `data`. Unset keys are empty, or kept as written with
 * `keep` (the editor shows them so the binding stays visible).
 * @param {string} text @param {Record<string, any>} data @param {{keep?: boolean}} [options]
 */
export function FormatBinding(text, data, { keep = false } = {}) {
    return String(text ?? "").replace(/\{([\w.]+)\}/g, (match, key) => (key in data ? String(data[key]) : keep ? match : ""));
}

/** A progress element's fill (0..1) from its `value` (number or "{binding}") and `max`. */
export function ProgressFraction(settings, data) {
    const raw = typeof settings.value === "number" ? settings.value : Number(FormatBinding(settings.value, data));
    const max = Number(settings.max) || 0;
    return max > 0 && Number.isFinite(raw) ? Math.min(1, Math.max(0, raw / max)) : 0;
}

/** Scale of a canvas drawn at `reference` size inside `available` (fit keeps every element visible). */
export function CanvasScale(scaleMode, reference, available) {
    if (scaleMode !== "fit") return 1;
    return Math.max(0.01, Math.min(available[0] / reference[0], available[1] / reference[1]));
}
