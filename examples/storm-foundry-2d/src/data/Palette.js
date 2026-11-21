// @ts-check
/** @param {number} hue @returns {{r: number, g: number, b: number}} */
export function HueColor(hue) {
    const channel = (/** @type {number} */ offset) => {
        const phase = (offset + hue / 30) % 12;
        return Math.round(255 * (0.58 - 0.42 * Math.max(-1, Math.min(phase - 3, 9 - phase, 1))));
    };
    return { r: channel(0), g: channel(8), b: channel(4) };
}
