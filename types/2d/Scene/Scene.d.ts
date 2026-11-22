/**
 * @doc Class Scene
 * @namespace Root
 * @class Scene
 * @author Patrick Faustino Camello
 * @summary This class is part of the GameForgeJS framework and provides functionality to load and render 2D scenes based on maps created with the Tiled tool.
 * @Date 15/05/2019
 * @example
 *  const scene = new Scene("sceneId", screen);
 *  scene.Load("mapName");
 * @returns {Object}
 */
export class Scene {
    constructor(id: any, screen: any);
    id: any;
    ratio: number;
    screen: any;
    layers: any[];
    /**
     * @doc Method
     * @param {string} sceneName - The name of the scene to load.
     * @description Load and configure a 2D scene based on a Tiled map.
     * @example
     *  scene.Load("tiledMapName");
     * @returns {void}
     */
    Load(sceneName: string): void;
    /**
     * @doc Method
     * @param {Object} json - The JSON data from the Tiled tool.
     * @description Load tileset and prepare for rendering layers.
     * @example
     *  scene.LoadTileset(jsonFile);
     * @returns {void}
     */
    LoadTileset(json: any): void;
    data: any;
    tileset: HTMLImageElement;
    /**
     * @doc Method
     * @param {Object} layer - The layer to render.
     * @description Render a single layer from the tileset.
     * @example
     *  scene.RenderLayer(layer);
     * @returns {void}
     */
    RenderLayer(layer: any): void;
    /**
     * @doc Method
     * @description Render all layers from the tileset.
     * @example
     *  scene.RenderLayers();
     * @returns {void}
     */
    RenderLayers(): void;
}
