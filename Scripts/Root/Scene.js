/**
 * @doc Class Screen
 * @namespace Root
 * @class Scene
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  var scene = new Scene(0, "typeContext", screenObject);
 * @returns {Object}
 */
export class Scene {
    constructor(id, screen) {
        this.id = id;
        this.context = (context == undefined) ? "2d" : context;
        this.ratio = (window.devicePixelRatio ? window.devicePixelRatio : 1);
        this.screen = screen;
        screen.Resize(screen.Width() * ratio, screen.Height() * ratio)

        // Mapa
        this.layers = [];
    }

    /**
     * @doc Method
     * @description Call the specific scene
     * @example
     *  scene.Call(0, "sceneName");
     * @returns {}
     */
    set Call(id, sceneName) {
        this.id = id;
        Load2D(sceneName);
    }

    /**
     * @doc Methdo
     * @param {sceneName} sceneName
     * @description Load and configure an scene 2d, based tile from Tiled tool
     * @example
     *  scene.Load2D("tiledMapName");
     * @returns {}
     */
    Load2D(sceneName) {
        this.scene = this.screen.Canvas;
        this.scene.width = this.screen.Width;
        this.scene.height = this.screen.Height;
        this.map = this.screen.Context;
        
        Load(sceneName);
    }

    /**
     * @doc Method
     * @param {layer} layer 
     * @description Render an layer from tileset
     * @example
     *  scene.RenderLayer("yourLayer");
     * @returns {}
     */
    static RenderLayer(layer) {
        if (layer.type !== "tilelayer" || !layer.opacity) { return; }
        var newCanvas = this.map.canvas.cloneNode(),
            size = scene.data.tilewidth;
        newCanvas = newCanvas.getContext("2d");

        if (scene.layers.length < scene.data.layers.length) {
            layer.data.forEach(function(tile_idx, i) {
                if (!tile_idx) { return; }
                var img_x, img_y, s_x, s_y,
                    tile = scene.data.tilesets[0];
                tile_idx--;
                img_x = (tile_idx % (tile.imagewidth / size)) * size;
                img_y = ~~(tile_idx / (tile.imagewidth / size)) * size;
                s_x = (i % layer.width) * size;
                s_y = ~~(i / layer.width) * size;
                newCanvas.drawImage(scene.tileset, img_x, img_y, size, size,
                                    s_x, s_y, size, size);
            });
            scene.layers.push(newCanvas.canvas.toDataURL());
            this.map.drawImage(newCanvas.canvas, 0, 0);
        } else {
            scene.layers.forEach(function(src) {
                var i = $("<img />", { src: src })[0];
                this.map.drawImage(i, 0, 0);
            });
        }
    }

    /**
     * @doc Method
     * @param {arrayLayers} layers 
     * @description Render each layer from tileset
     * @example
     *  scene.RenderLayers("arrayLayers");
     * @returns {}
     */
    static RenderLayers(layers) { 
        layers = $.isArray(layers) ? layers : this.data.layers;
        layers.forEach(this.RenderLayer);
    }

    /**
     * @doc Method
     * @param {jsonFile} json 
     * @description Load json with map of Tiled tool
     * @example
     *  scene.LoadTileset("jsonFile");
     * @returns {}
     */
    static LoadTileset(json) {
        this.data = json;
        this.tileset = $("<img />", { src: json.tilesets[0].image })[0]
        this.tileset.onload = $.proxy(this.RenderLayers, this);
    }

    /**
     * @doc Method
     * @param {mapName} mapName 
     * @description Load an json file
     * @example
     *  scene.Load("fileName");
     * @returns {json}
     */
    static Load(mapName) {
        return $.ajax({
            url: "/maps/" + mapName + ".json",
            type: "JSON"
          }).done($.proxy(this.LoadTileset, this));
    }
}