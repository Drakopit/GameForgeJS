/**
 * Height-aware cardinal grid. Null cells are gaps; h is measured in elevation levels.
 * Pure navigation data, independent of scenes, rendering or a particular tactical game.
 * @param {(number|null)[][]} heights Rectangular row-major elevation map.
 */
export class HeightGrid {
    constructor(heights: any);
    heights: any;
    rows: any;
    cols: any;
    Key(tile: any): string;
    Get(col: any, row: any): {
        col: any;
        row: any;
        h: any;
    };
    /** Dijkstra range includes real paths, occupancy and optional one-gap jumps. */
    Reachable(start: any, { move, climb, jump, occupied }?: {
        move?: number;
        climb?: number;
        jump?: number;
        occupied?: Set<any>;
    }): Map<any, any>;
    /** Terrain blocks a center-to-center ray at eye height; endpoints are excluded. */
    CanSee(from: any, to: any, eyeHeight?: number): boolean;
}
