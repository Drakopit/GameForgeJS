import { TileCollision2D } from "../Collision/TileCollision2D.js";

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
     * @param {Object} [options]
     * @param {Object} [options.tilemap] - The `TileMap` component.
     * @param {Object} [options.world] - The grid (`settings.world` of the scene).
     */
    constructor({ tilemap = {}, world = {} } = {}) {
        this.tilemap = tilemap;
        const cell = Number(world.cell ?? tilemap.tileWidth ?? 32);
        this.cell = cell > 0 ? cell : 32;
        this.originX = Number(world.originX ?? 0);
        this.originY = Number(world.originY ?? 0);
        const rows = tilemap.terrainRows ?? tilemap.terrain ?? [];
        this.rows = Math.max(1, Math.floor(Number(world.rows ?? rows.length) || 1));
        this.cols = Math.max(1, Math.floor(Number(world.cols ?? rows[0]?.length) || 1));
        this.blocked = new Set(tilemap.blockedTiles ?? []);
        this.solidIds = new Set(tilemap.solidTiles ?? []);
    }

    /**
     * Reads the first `TileMap2D` node of a 2D scene (a SceneDocument or its JSON).
     * @param {Object} scene
     * @param {string} [nodeId] - A specific TileMap2D node.
     * @returns {TileMap2D|null}
     */
    static FromScene(scene, nodeId) {
        const data = scene?.data ?? scene ?? {};
        const node = (data.nodes ?? []).find(item => item.type === "TileMap2D" && (!nodeId || item.id === nodeId));
        if (!node) return null;
        return new TileMap2D({ tilemap: node.components?.TileMap ?? {}, world: data.settings?.world ?? {} });
    }

    /** The image name (AssetManager) of the tileset. */
    get sprite() { return this.tilemap.sprite ?? null; }

    /** Width and height of the painted area in world units. */
    get width() { return this.cols * this.cell; }
    get height() { return this.rows * this.cell; }

    /** The tile id painted at a cell, or null. */
    TileAt(col, row) {
        const rows = this.tilemap.terrainRows ?? this.tilemap.terrain;
        return rows?.[row]?.[col] ?? null;
    }

    /** Paints (or with null, erases) one cell. */
    SetTile(col, row, id) {
        if (!this.IsInside(col, row)) return false;
        const key = this.tilemap.terrainRows ? "terrainRows" : this.tilemap.terrain ? "terrain" : "terrainRows";
        this.tilemap[key] ??= [];
        const rows = this.tilemap[key];
        rows[row] ??= Array.from({ length: this.cols }, () => null);
        rows[row][col] = id ?? null;
        return true;
    }

    IsInside(col, row) {
        return col >= 0 && row >= 0 && col < this.cols && row < this.rows;
    }

    /** The cell under a world point, or null outside the map. */
    CellAt(x, y) {
        const col = Math.floor((x - this.originX) / this.cell);
        const row = Math.floor((y - this.originY) / this.cell);
        return this.IsInside(col, row) ? { col, row } : null;
    }

    /** World rectangle of a cell. */
    CellRect(col, row) {
        return { x: this.originX + col * this.cell, y: this.originY + row * this.cell, width: this.cell, height: this.cell };
    }

    /** Blocked by the editor's collision paint (Ctrl+click) or by a solid tile id. */
    IsBlocked(col, row) {
        if (this.blocked.has(`${col},${row}`)) return true;
        const id = this.TileAt(col, row);
        return Boolean(id) && this.solidIds.has(id);
    }

    /**
     * Draws the painted cells.
     * @param {CanvasRenderingContext2D} context
     * @param {HTMLImageElement|ImageBitmap|null} image - The tileset image (`sprite`).
     * @param {Object} [options]
     * @param {{x:number,y:number,width:number,height:number}} [options.view] - World rectangle to draw (culling).
     */
    Draw(context, image, { view = null } = {}) {
        if (!context || !image || (image.complete === false) || !(image.naturalWidth ?? image.width)) return;
        const tiles = this.tilemap.tiles ?? {};
        let firstCol = 0, lastCol = this.cols - 1, firstRow = 0, lastRow = this.rows - 1;
        if (view) {
            firstCol = Math.max(0, Math.floor((view.x - this.originX) / this.cell));
            firstRow = Math.max(0, Math.floor((view.y - this.originY) / this.cell));
            lastCol = Math.min(this.cols - 1, Math.floor((view.x + view.width - this.originX) / this.cell));
            lastRow = Math.min(this.rows - 1, Math.floor((view.y + view.height - this.originY) / this.cell));
        }
        const tileWidth = this.tilemap.tileWidth ?? this.cell;
        const tileHeight = this.tilemap.tileHeight ?? this.cell;
        for (let row = firstRow; row <= lastRow; row++) {
            for (let col = firstCol; col <= lastCol; col++) {
                const tile = tiles[this.TileAt(col, row)];
                if (!tile) continue;
                context.drawImage(image, tile.x ?? 0, tile.y ?? 0, tile.width ?? tileWidth, tile.height ?? tileHeight,
                    this.originX + col * this.cell, this.originY + row * this.cell, this.cell, this.cell);
            }
        }
    }

    /**
     * Blocked cells overlapping a world rectangle (see TileCollision2D.QuerySolidTiles).
     * @param {{x:number,y:number,width:number,height:number}} rect
     */
    QuerySolid(rect) {
        const local = { ...rect, x: rect.x - this.originX, y: rect.y - this.originY };
        return TileCollision2D.QuerySolidTiles(local, {
            tileSize: this.cell, worldWidth: this.cols, worldHeight: this.rows,
            getTile: (col, row) => ({ col, row }),
            isSolid: (_, col, row) => this.IsBlocked(col, row),
            padding: 0,
        }).map(hit => ({ ...hit, rect: this.CellRect(hit.x, hit.y) }));
    }
}
