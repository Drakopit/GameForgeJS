import { getNeighbors, key, reconstructPath } from './Structure.js';

/**
 * Finds a shortest path on an unweighted grid using breadth-first search.
 * @param {number[][]} grid - Grid whose zero entries can be walked.
 * @param {Object} start - Starting coordinate containing x and y.
 * @param {Object} goal - Destination coordinate containing x and y.
 * @returns {Object[]|null} Ordered path or null when unreachable.
 */

export function bfs(grid, start, goal) {
	const queue = [start];
	const visited = new Set();
	const cameFrom = {};

	visited.add(key(start));

	while (queue.length) {
		const current = queue.shift();

		if (current.x === goal.x && current.y === goal.y) {
			return reconstructPath(cameFrom, current);
		}

		for (let neighbor of getNeighbors(grid, current)) {
			if (!visited.has(key(neighbor))) {
				visited.add(key(neighbor));
				cameFrom[key(neighbor)] = current;
				queue.push(neighbor);
			}
		}
	}

	return null;
}