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
     * One layer per `TileMap2D` node of a 2D scene, in node order.
     * @param {Object} scene - A SceneDocument or its JSON.
     * @param {Object} [options] - Passed to each layer (screen, assets, view).
     * @returns {TileMapLayer2D[]}
     */
    static FromScene(scene: any, options?: any): TileMapLayer2D[];
    /** The tile layers added to a level. */
    static InLevel(level: any): any;
    /**
     * Moves a rectangle through every tile layer of a level (see TileMap2D.Move): it stops flush
     * against solid cells and slides along them. With no tile layers it just moves.
     * @param {Object} level
     * @param {{x:number,y:number,width:number,height:number}} rect
     * @param {number} dx
     * @param {number} dy
     * @returns {{x:number, y:number, hitX:boolean, hitY:boolean}}
     */
    static Move(level: any, rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    }, dx: number, dy: number): {
        x: number;
        y: number;
        hitX: boolean;
        hitY: boolean;
    };
    /**
     * @param {Object} options
     * @param {TileMap2D} options.map - The tile layer.
     * @param {{Context: CanvasRenderingContext2D}} [options.screen] - Where to draw (a Screen).
     * @param {{GetImage(name: string): any}} [options.assets] - Looks up the tileset image by `map.sprite`.
     * @param {any} [options.image] - The tileset image, instead of `assets`.
     * @param {() => ({x:number,y:number,width:number,height:number})|null} [options.view] - Visible world rectangle (culling).
     */
    constructor({ map, screen, assets, image, view }?: {
        map: TileMap2D;
        screen?: {
            Context: CanvasRenderingContext2D;
        };
        assets?: {
            GetImage(name: string): any;
        };
        image?: any;
        view?: () => ({
            x: number;
            y: number;
            width: number;
            height: number;
        }) | null;
    });
    name: any;
    map: TileMap2D;
    screen: {
        Context: CanvasRenderingContext2D;
    };
    assets: {
        GetImage(name: string): any;
    };
    image: any;
    view: () => ({
        x: number;
        y: number;
        width: number;
        height: number;
    }) | null;
    /** The tileset image, once it has loaded. */
    TilesetImage(): any;
}
import { GameObject } from "../Objects/GameObject.js";
import { TileMap2D } from "./TileMap2D.js";
