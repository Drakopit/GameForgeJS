import { Player } from "./Objects/Player";
import { GenericMap } from "./Maps/GenericMap";
import { Maps } from "./Maps/Maps";

export class Phase00 {
    constructor() {
        // Tela
        this.screen = new Screen("PrimeiraFase", 640, 480);
        this.screen.Init("Fase01");

        // Cena/Room
        this.scene = new Scene("PrimeiraFase", this.screen);
        this.scene.CallScene("PrimeiraFase", "Fase_01");

        // Entidades
        this.player = new Player();

        // Câmera
        this.camera = new Camera(this.jogador.position, new Vector2D(this.screen.Width, this.screen.Height));
        let GameWorld = {
            width: (this.debugMap.mapWidth*this.debugMap.tileW),
            height: (this.debugMap.mapHeight*this.debugMap.tileH)
        };
        this.camera.Init(this.screen, GameWorld);

        // Mapas
        this.maps = new Maps();

        // Adiciona objetos à lista
        this.Objects = new Array();
        this.Objects.push(this.player);
    }

    Loop(dt) {
        this.screen.Refresh();
        // Adiciona todos os objetos da cena
        for (const object of this.Objects) {
            object.Update();
            object.FixedUpdate(dt);
            this.camera.Update(this.player);
            this.camera.Begin();
            object.DrawnSelf();
            this.camera.DrawnSelf();
            this.camera.End();
            object.OnGUI();
        }
    }
}