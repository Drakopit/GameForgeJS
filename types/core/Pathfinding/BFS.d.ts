/**
 * Finds a shortest path on an unweighted grid using breadth-first search.
 * @param {number[][]} grid - Grid whose zero entries can be walked.
 * @param {Object} start - Starting coordinate containing x and y.
 * @param {Object} goal - Destination coordinate containing x and y.
 * @returns {Object[]|null} Ordered path or null when unreachable.
 */
export function bfs(grid: number[][], start: any, goal: any): any[] | null;
