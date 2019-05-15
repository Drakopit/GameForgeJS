///-----------------------------------------------------------------
///   Namespace:      Root
///   Class:          Scene
///   Description:    Class that hadler scenes, of game.
///   Author:         Patrick Faustino Camello      Date: 15/05/2019
///   Notes:          That class was made, to compose the EngineHtml5
///                   framework.
///   Usage:
///     var screen = new Screen(0, 320, 240);
///     var scene = new Scene(0, "2d", screen);
///     scene.Load2D("nameScene");
///
// To call scene
///     scene.Call(0, "nameScene");
///-----------------------------------------------------------------
import { Screen } from "Window/Screen.js";

class Scene {
    constructor(id, context, screen) {
        // Contextos suportados "2d" e "webgl" (Caso webgl não for suportado, tem o "experimental-webgl")
        this.id = id;
        this.context = (context == undefined) ? "2d" : context;
        this.ratio = (window.devicePixelRatio ? window.devicePixelRatio : 1);
        this.screen = screen;
        screen.Resize(screen.Width() * ratio, screen.Height() * ratio)

        // Mapa
        this.layers = [];
    }

    //  Muda a cena via Id 
    set Call(id, sceneName) {
        this.id = id;
        // Carrega a cena no modo 2D
        Load2D(sceneName);
    }

    // Carre
    Load2D(sceneName) {
        this.scene = document.createElement("canvas");
        this.scene.id = sceneName;
        this.scene.width = screen.Width();
        this.scene.height = screen.Height();
        this.map = document.getElementById(this.scene.id).getContext('2d');
        
        // Carrega o Mapa
        Load(sceneName);
    }

    RenderLayer(layer) {
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

    // Pega Layer por layer pra ser reenderizado
    RenderLayers(layers) { 
        layers = $.isArray(layers) ? layers : this.data.layers;
        layers.forEach(this.RenderLayer);
    }

    // Carrega a imagem que compõem o TileSet
    LoadTileset(json) {
        this.data = json;
        this.tileset = $("<img />", { src: json.tilesets[0].image })[0]
        this.tileset.onload = $.proxy(this.RenderLayers, this);
    }

    // Carrega o Mapa inteiro
    Load(mapName) {
        return $.ajax({
            url: "/maps/" + mapName + ".json",
            type: "JSON"
          }).done($.proxy(this.LoadTileset, this));
    }
}