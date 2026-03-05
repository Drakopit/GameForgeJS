import { GameObject3D } from "../Root/GameObject3D.js";
import { Shapes3D } from "../Graphic/Shape3D.js";
import { AssetManager } from "../Root/AssetManager.js";

export class Coin3D extends GameObject3D {
    constructor(screen3D) {
        super();
        this.name = "CoinCube";
        this.shapes = new Shapes3D(screen3D);

        // Escala menorzinha (como se fosse um item)
        this.transform.scale = [0.1, 0.1, 0.1];
        const htmlImage = AssetManager.instance.GetImage("textura_coin");

        // 2. Converte essa imagem HTML numa Textura WebGL (mantendo a referência)
        if (htmlImage) {
            this.myTexture = this.shapes.CreateTexture(htmlImage);
        }
        this.Respawn();
    }

    Respawn() {
        // Nasce em posições aleatórias dentro dos limites da nossa "Arena"
        const randomX = (Math.random() * 8) - 4.0;    // Entre -4.0 e 4.0
        const randomZ = (Math.random() * -9) - 3.0;   // Entre -3.0 e -12.0

        this.transform.position = [randomX, 0.0, randomZ];
    }

    OnUpdate(dt) {
        const delta = dt || 0.016;
        // Gira loucamente para chamar a atenção do jogador
        this.transform.rotation.x += 3.0 * delta;
        this.transform.rotation.y += 3.0 * delta;
    }

    // Exemplo no Player3D.js (Faça o mesmo nas outras entidades)
    OnDrawn(camera) {
        this.shapes.DrawCube(
            this.transform.position,
            this.transform.rotation,
            this.transform.scale,
            camera, // <-- Passa a câmera para renderizar no referencial correto
            this.myTexture // <-- Passa a textura para renderizar
        );
    } '  '
}                                                                                                                                                           