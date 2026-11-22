/**
 * TileCollision2D adapter for solid rectangular tiles. Positions and velocities
 * use pixels and seconds. Substeps prevent fast actors skipping a whole tile.
 * Slopes, one-way platforms and moving platforms are outside this adapter.
 */
export class TilePlatformerWorld {
    constructor(options?: {});
    options: {};
    Move(body: any, dt: any): {
        left: boolean;
        right: boolean;
        top: boolean;
        bottom: boolean;
        grounded: boolean;
    };
}
