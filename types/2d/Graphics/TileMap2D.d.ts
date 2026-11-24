/**
 * A painted tile layer: the `TileMap` component of a `TileMap2D` scene node (what the editor's
 * tile palette paints), drawn on a 2D canvas, with cell queries and tile collision.
 *
 * The component holds the tileset and the painted cells:
 *   { sprite, tileWidth, tileHeight, tiles: { id: { x, y, width, height } },
 *     terrainRows: [[id | null, ...], ...], blockedTiles: ["col,row", ...], solidTiles: [id, ...] }
 * and the grid comes from the scene's `settings.world`: { cols, rows, cell, originX, originY }.
 *
 * @example
 * const map = TileMap2D.FromScene(sceneJson);
 * map.Draw(screen.Context, AssetManager.instance.GetImage(map.sprite), { view: camera.Rect() });
 * const hits = map.QuerySolid(player.Rect());
 */
export class TileMap2D {
    /**
     * Reads the first `TileMap2D` node of a 2D scene (a SceneDocument or its JSON).
     * @param {Object} scene
     * @param {string} [nodeId] - A specific TileMap2D node.
     * @returns {TileMap2D|null}
     */
    static FromScene(scene: any, nodeId?: string): TileMap2D | null;
    /**
     * @param {Object} [options]
     * @param {Object} [options.tilemap] - The `TileMap` component.
     * @param {Object} [options.world] - The grid (`settings.world` of the scene).
     */
    constructor({ tilemap, world }?: {
        tilemap?: any;
        world?: any;
    });
    tilemap: any;
    cell: number;
    originX: number;
    originY: number;
    rows: number;
    cols: number;
    blocked: Set<any>;
    solidIds: Set<any>;
    /** The image name (AssetManager) of the tileset. */
    get sprite(): any;
    /** Width and height of the painted area in world units. */
    get width(): number;
    get height(): number;
    /** The tile id painted at a cell, or null. */
    TileAt(col: any, row: any): any;
    /** Paints (or with null, erases) one cell. */
    SetTile(col: any, row: any, id: any): boolean;
    IsInside(col: any, row: any): boolean;
    /** The cell under a world point, or null outside the map. */
    CellAt(x: any, y: any): {
        col: number;
        row: number;
    };
    /** World rectangle of a cell. */
    CellRect(col: any, row: any): {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** Blocked by the editor's collision paint (Ctrl+click) or by a solid tile id. */
    IsBlocked(col: any, row: any): boolean;
    /**
     * Draws the painted cells.
     * @param {CanvasRenderingContext2D} context
     * @param {HTMLImageElement|ImageBitmap|null} image - The tileset image (`sprite`).
     * @param {Object} [options]
     * @param {{x:number,y:number,width:number,height:number}} [options.view] - World rectangle to draw (culling).
     */
    Draw(context: CanvasRenderingContext2D, image: HTMLImageElement | ImageBitmap | null, { view }?: {
        view?: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
    }): void;
    /**
     * Blocked cells overlapping a world rectangle (see TileCollision2D.QuerySolidTiles). A rectangle
     * that only touches a cell's edge (a 32px body flush against a wall on a 32px grid) does not overlap it.
     * @param {{x:number,y:number,width:number,height:number}} rect
     */
    QuerySolid(rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): {
        rect: {
            x: number;
            y: number;
            width: number;
            height: number;
        };
        x: number;
        y: number;
        tile: any;
    }[];
}
