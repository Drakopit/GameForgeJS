const Directions = Object.freeze([{ col: 0, row: -1 }, { col: 1, row: 0 }, { col: 0, row: 1 }, { col: -1, row: 0 }]);
/**
 * Height-aware cardinal grid. Null cells are gaps; h is measured in elevation levels.
 * Pure navigation data, independent of scenes, rendering or a particular tactical game.
 * @param {(number|null)[][]} heights Rectangular row-major elevation map.
 */
export class HeightGrid {
    constructor(heights) {
        if (!heights?.length || !heights[0]?.length || !heights.every(row => row.length === heights[0].length && row.every(h => h === null || Number.isFinite(h))))
            throw new RangeError('Expected a rectangular finite height grid.');
        this.heights = heights.map(row => [...row]);
        this.rows = heights.length;
        this.cols = heights[0].length;
    }
    Key(tile) { return `${tile.col},${tile.row}`; }
    Get(col, row) {
        const h = this.heights[row]?.[col];
        return h === undefined || h === null ? null : { col, row, h };
    }
    /** Dijkstra range includes real paths, occupancy and optional one-gap jumps. */
    Reachable(start, { move = 3, climb = 1, jump = 1, occupied = new Set() } = {}) {
        if (![move, climb, jump].every(v => Number.isFinite(v) && v >= 0))
            throw new RangeError('Movement budgets must be nonnegative.');
        const origin = this.Get(start.col, start.row), result = new Map();
        if (!origin)
            return result;
        const queue = [{ ...origin, cost: 0, path: [] }];
        result.set(this.Key(origin), queue[0]);
        while (queue.length) {
            queue.sort((a, b) => a.cost - b.cost);
            const current = queue.shift();
            for (const direction of Directions) {
                const adjacent = this.Get(current.col + direction.col, current.row + direction.row);
                const length = adjacent ? 1 : 2;
                const tile = adjacent ?? this.Get(current.col + direction.col * 2, current.row + direction.row * 2);
                if (!tile || occupied.has(this.Key(tile)))
                    continue;
                const delta = tile.h - current.h, cost = current.cost + length;
                if (cost > move || delta > (length === 1 ? climb : jump) || -delta > jump)
                    continue;
                if (length === 2 && jump < 1)
                    continue;
                const previous = result.get(this.Key(tile));
                if (previous && previous.cost <= cost)
                    continue;
                const next = { ...tile, cost, path: [...current.path, tile] };
                result.set(this.Key(tile), next);
                queue.push(next);
            }
        }
        return result;
    }
    /** Terrain blocks a center-to-center ray at eye height; endpoints are excluded. */
    CanSee(from, to, eyeHeight = 1) {
        const a = this.Get(from.col, from.row), b = this.Get(to.col, to.row);
        if (!a || !b)
            return false;
        const samples = Math.max(Math.abs(b.col - a.col), Math.abs(b.row - a.row)) * 4;
        for (let i = 1; i < samples; i++) {
            const t = i / samples, col = Math.floor(a.col + 0.5 + (b.col - a.col) * t), row = Math.floor(a.row + 0.5 + (b.row - a.row) * t);
            if ((col === a.col && row === a.row) || (col === b.col && row === b.row))
                continue;
            const tile = this.Get(col, row), height = a.h + (b.h - a.h) * t + eyeHeight;
            if (tile && tile.h >= height)
                return false;
        }
        return true;
    }
}
