import { getNeighbors, key, reconstructPath } from './Structure.js';

/**
 * Finds a grid path using depth-first search; the result need not be shortest.
 * @param {number[][]} grid - Grid whose zero entries can be walked.
 * @param {Object} start - Starting coordinate containing x and y.
 * @param {Object} goal - Destination coordinate containing x and y.
 * @returns {Object[]|null} Ordered path or null when unreachable.
 */

export function dfs(grid, start, goal) {
	const stack = [start];
	const visited = new Set();
	const cameFrom = {};

	visited.add(key(start));

	while (stack.length) {
		const current = stack.pop();

		if (current.x === goal.x && current.y === goal.y) {
			return reconstructPath(cameFrom, current);
		}

		for (let neighbor of getNeighbors(grid, current)) {
			if (!visited.has(key(neighbor))) {
				visited.add(key(neighbor));
				cameFrom[key(neighbor)] = current;
				stack.push(neighbor);
			}
		}
	}

	return null;
}