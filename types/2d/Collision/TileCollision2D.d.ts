/**
 * Tile-map collision queries and axis-separated movement for rectangular actors.
 */
export class TileCollision2D {
    static RectFromTile(tileX: any, tileY: any, tileSize: any): {
        x: number;
        y: number;
        width: any;
        height: any;
    };
    static IntersectsTile(rect: any, tileX: any, tileY: any, tileSize: any): boolean;
    static QuerySolidTiles(rect: any, { tileSize, worldWidth, worldHeight, getTile, isSolid, padding, }?: {
        worldWidth?: number;
        worldHeight?: number;
        isSolid?: (tile: any) => boolean;
        padding?: number;
    }): {
        x: number;
        y: number;
        tile: any;
        rect: {
            x: number;
            y: number;
            width: any;
            height: any;
        };
    }[];
    /**
     * Moves a velocity-bearing rectangle and resolves nearby solid tiles.
     * @param {Object} rect - Mutable rectangle with optional `vx` and `vy`.
     * @param {Object} [options={}] - Grid query and movement settings.
     * @returns {Object} Collision sides and grounded status.
     */
    static Move(rect: any, { delta, tileSize, worldWidth, worldHeight, getTile, isSolid, }?: any): any;
    static ResolveAxis(rect: any, axis: any, options?: {}): void;
}
