import { TileCollision2D } from '../../2d/Collision/TileCollision2D.js';
import { ValidateBody } from './ValidateBody.js';

/**
 * TileCollision2D adapter for solid rectangular tiles. Positions and velocities
 * use pixels and seconds. Substeps prevent fast actors skipping a whole tile.
 * Slopes, one-way platforms and moving platforms are outside this adapter.
 */
export class TilePlatformerWorld {
    constructor(options = {}) {
        if (!(Number.isFinite(options.tileSize) && options.tileSize > 0) || typeof options.getTile !== 'function') {
            throw new TypeError('TilePlatformerWorld requires a positive tileSize and getTile(x, y).');
        }
        for (const key of ['worldWidth', 'worldHeight']) {
            if (options[key] !== undefined && options[key] !== Infinity && !(Number.isInteger(options[key]) && options[key] > 0)) {
                throw new RangeError(`${key} must be a positive tile count or Infinity.`);
            }
        }
        this.options = { ...options };
    }

    Move(body, dt) {
        ValidateBody(body);
        if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Movement delta must be finite and nonnegative.');
        const result = { left: false, right: false, top: false, bottom: false, grounded: Boolean(body.grounded) };
        if (dt === 0) return result;
        const distance = Math.max(Math.abs(body.vx), Math.abs(body.vy)) * dt;
        const maxStepDistance = this.options.tileSize / 2;
        const steps = Math.max(1, Math.ceil(distance / maxStepDistance));
        if (steps > 512) throw new RangeError('Movement exceeds the tile adapter substep budget; use a fixed timestep and bounded velocities.');
        for (let step = 0; step < steps; step++) {
            const contact = TileCollision2D.Move(body, { ...this.options, delta: dt / steps });
            for (const side of ['left', 'right', 'top', 'bottom']) {
                result[side] ||= contact[side];
            }
            result.grounded = contact.grounded;
        }
        // A landing can zero vy before the last substep. Query support at the
        // final position so later zero-velocity steps do not erase grounded.
        const foot = { x: body.x, y: body.y + body.height, width: body.width, height: 0.01 };
        result.grounded = body.vy >= 0 && TileCollision2D.QuerySolidTiles(foot, this.options).some(({ rect }) =>
            body.x < rect.x + rect.width && body.x + body.width > rect.x
            && Math.abs(foot.y - rect.y) < 0.01);
        body.grounded = result.grounded;
        if (result.grounded) body.vy = 0;
        const rightEdge = (this.options.worldWidth ?? Infinity) * this.options.tileSize - body.width;
        if (Number.isFinite(rightEdge) && body.x <= 0 && body.vx < 0) {
            body.vx = 0;
            result.left = true;
        }
        if (body.x >= rightEdge && body.vx > 0) {
            body.vx = 0;
            result.right = true;
        }
        return result;
    }
}

