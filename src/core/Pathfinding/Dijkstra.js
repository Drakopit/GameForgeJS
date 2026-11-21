import { getNeighbors, key, reconstructPath } from './Structure.js';

/**
 * Finds a shortest grid path using Dijkstra search with unit-cost edges.
 * @param {number[][]} grid - Grid whose zero entries can be walked.
 * @param {Object} start - Starting coordinate containing x and y.
 * @param {Object} goal - Destination coordinate containing x and y.
 * @returns {Object[]|null} Ordered path or null when unreachable.
 */

export function dijkstra(grid, start, goal) {
	const distances = {};
	const cameFrom = {};
	const visited = new Set();
	const queue = [start];

	distances[key(start)] = 0;

	while (queue.length) {
		queue.sort((a, b) => distances[key(a)] - distances[key(b)]);
		const current = queue.shift();

		if (current.x === goal.x && current.y === goal.y) {
			return reconstructPath(cameFrom, current);
		}

		visited.add(key(current));

		for (let neighbor of getNeighbors(grid, current)) {
			if (visited.has(key(neighbor))) continue;

			const newDist = distances[key(current)] + 1;

			if (
				distances[key(neighbor)] === undefined ||
				newDist < distances[key(neighbor)]
			) {
				distances[key(neighbor)] = newDist;
				cameFrom[key(neighbor)] = current;
				queue.push(neighbor);
			}
		}
	}

	return null;
}