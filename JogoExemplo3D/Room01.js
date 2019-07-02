import { Screen3D } from "../Scripts/Window/Screen3D.js";

/**
 * @description Primeira Fase do jogo em 3D
 */

export class Room01 {
    constructor() {
        this.screen3D = new Screen3D("Tela", 640, 480);
        this.screen3D.Init("webGL");
        this.screen3D.ViewPort();
    }
}