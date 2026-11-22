/**
 * Finds a shortest grid path using a Manhattan-distance A-star search.
 * @param {number[][]} grid - Grid whose zero entries can be walked.
 * @param {Object} start - Starting `{x, y}` coordinate.
 * @param {Object} goal - Destination `{x, y}` coordinate.
 * @returns {Object[]|null} Ordered path or `null` when unreachable.
 */
export function aStar(grid: number[][], start: any, goal: any): any[] | null;
