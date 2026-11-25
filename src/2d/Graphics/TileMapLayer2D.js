import { GameObject } from "../Objects/GameObject.js";
import { TileMap2D } from "./TileMap2D.js";

/**
 * An entity that draws a painted tile layer (a scene's `TileMap2D` node) in the level, under
 * the entities added after it, and blocks movement on its solid cells.
 *
 * @example
 * // In a level's OnStart, before the other entities:
 * for (const layer of TileMapLayer2D.FromScene(scene, { screen: this.screen, assets: context.assets })) this.AddEntity(layer);
 * // In a component or entity that moves:
 * const next = TileMapLayer2D.Move(this.level, { x, y, width, height }, dx, dy);
 */
export class TileMapLayer2D extends GameObject {
    /**
     * @param {Object} options
     * @param {TileMap2D} options.map - The tile layer.
     * @param {{Context: CanvasRenderingContext2D}} [options.screen] - Where to draw (a Screen).
     * @param {{GetImage(name: string): any}} [options.assets] - Looks up the tileset image by `map.sprite`.
     * @param {any} [options.image] - The tileset image, instead of `assets`.
     * @param {() => ({x:number,y:number,width:number,height:number})|null} [options.view] - Visible world rectangle (culling).
     */
    constructor({ map, screen = null, assets = null, image = null, view = null } = {}) {
        super();
        this.name = map?.nodeId ?? "TileMap";
        this.Tag = "TileMap";
        this.map = map;
        this.screen = screen;
        this.assets = assets;
        this.image = image;
        this.view = view;
        this.size.x = map?.width ?? 0;
        this.size.y = map?.height ?? 0;
    }

    /**
     * One layer per `TileMap2D` node of a 2D scene, in node order.
     * @param {Object} scene - A SceneDocument or its JSON.
     * @param {Object} [options] - Passed to each layer (screen, assets, view).
     * @returns {TileMapLayer2D[]}
     */
    static FromScene(scene, options = {}) {
        return TileMap2D.AllFromScene(scene).map(map => new TileMapLayer2D({ ...options, map }));
    }

    /** The tile layers added to a level. */
    static InLevel(level) {
        return (level?.entities ?? []).filter(entity => entity instanceof TileMapLayer2D);
    }

    /**
     * Moves a rectangle through every tile layer of a level (see TileMap2D.Move): it stops flush
     * against solid cells and slides along them. With no tile layers it just moves.
     * @param {Object} level
     * @param {{x:number,y:number,width:number,height:number}} rect
     * @param {number} dx
     * @param {number} dy
     * @returns {{x:number, y:number, hitX:boolean, hitY:boolean}}
     */
    static Move(level, rect, dx, dy) {
        const layers = TileMapLayer2D.InLevel(level).filter(layer => layer.map);
        if (!layers.length) return { x: rect.x + dx, y: rect.y + dy, hitX: false, hitY: false };
        // X first, then Y; on each axis the nearest stop of any layer wins.
        const axis = (steps, key, delta, hit) => ({
            value: delta > 0 ? Math.min(...steps.map(step => step[key])) : Math.max(...steps.map(step => step[key])),
            hit: steps.some(step => step[hit]),
        });
        const sx = dx ? axis(layers.map(layer => layer.map.Move(rect, dx, 0)), "x", dx, "hitX") : { value: rect.x, hit: false };
        const moved = { ...rect, x: sx.value };
        const sy = dy ? axis(layers.map(layer => layer.map.Move(moved, 0, dy)), "y", dy, "hitY") : { value: rect.y, hit: false };
        return { x: sx.value, y: sy.value, hitX: sx.hit, hitY: sy.hit };
    }

    /** The tileset image, once it has loaded. */
    TilesetImage() {
        if (this.image) return this.image;
        const name = this.map?.sprite;
        return name && this.assets?.GetImage ? this.assets.GetImage(name) ?? null : null;
    }

    OnDrawn() {
        super.OnDrawn();
        const context = this.screen?.Context ?? this.screen?.context ?? null;
        if (!context || !this.map) return;
        const view = typeof this.view === "function" ? this.view() : this.view;
        this.map.Draw(context, this.TilesetImage(), { view: view ?? null });
    }
}
