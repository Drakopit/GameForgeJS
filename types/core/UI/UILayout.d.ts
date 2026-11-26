/** Pure layout and binding helpers of the in-game UI (no DOM, no canvas). */
/**
 * Rectangle of an element inside its parent: `anchor` picks the corner, edge or centre the
 * `offset` is measured from (inwards for right / bottom anchors); `stretch` fills the parent
 * minus the offset on every side.
 * @param {string} anchor @param {number[]} offset @param {number[]} size @param {number[]} parent
 * @returns {{x: number, y: number, width: number, height: number}}
 */
export function LayoutRect(anchor: string, offset: number[], size: number[], parent: number[]): {
    x: number;
    y: number;
    width: number;
    height: number;
};
/**
 * `"HP {hp}/{max}"` with values from `data`. Unset keys are empty, or kept as written with
 * `keep` (the editor shows them so the binding stays visible).
 * @param {string} text @param {Record<string, any>} data @param {{keep?: boolean}} [options]
 */
export function FormatBinding(text: string, data: Record<string, any>, { keep }?: {
    keep?: boolean;
}): string;
/** A progress element's fill (0..1) from its `value` (number or "{binding}") and `max`. */
export function ProgressFraction(settings: any, data: any): number;
/** Scale of a canvas drawn at `reference` size inside `available` (fit keeps every element visible). */
export function CanvasScale(scaleMode: any, reference: any, available: any): number;
