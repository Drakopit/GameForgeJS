/**
 * Returns walkable cardinal neighbors for a grid coordinate.
 * @param {number[][]} grid - Grid whose zero entries can be walked.
 * @param {Object} node - Current `{x, y}` coordinate.
 * @returns {Object[]} Adjacent walkable coordinates.
 */
export function getNeighbors(grid: number[][], node: any): any[];
/**
 * Encodes a coordinate for pathfinding maps.
 * @param {Object} node - Coordinate containing `x` and `y`.
 * @returns {string} Stable coordinate key.
 */
export function key(node: any): string;
/**
 * Reconstructs a discovered route from predecessor entries.
 * @param {Object} cameFrom - Coordinate-keyed predecessor map.
 * @param {Object} current - Goal coordinate.
 * @returns {Object[]} Ordered route.
 */
export function reconstructPath(cameFrom: any, current: any): any[];
