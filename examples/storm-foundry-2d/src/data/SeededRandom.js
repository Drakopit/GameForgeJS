// @ts-check
/** Reproducible scenery and effect sampling; Reset restores the same seed. */
export class SeededRandom {
    /** @param {number} seed */
    constructor(seed) { this.seed = seed; }
    Next() {
        this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0;
        return this.seed / 4294967296;
    }
    /** @param {number} min @param {number} max */
    Range(min, max) { return min + this.Next() * (max - min); }
}
