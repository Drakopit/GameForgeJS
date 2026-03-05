import { GameObject3D } from "../Root/GameObject3D.js";
import { Shapes3D } from "../Graphic/Shape3D.js";
import { AssetManager } from "../Root/AssetManager.js";

export class Floor3D extends GameObject3D {
    constructor(screen3D) {
        super();
        this.name = "Floor";
        this.shapes = new Shapes3D(screen3D);

        // Posição: Fica abaixo do jogador (Y = -1.0) e centralizado no meio da nossa arena (Z = -7.5)
        this.transform.position = [0.0, -1.0, -7.5];

        // Escala: Largo (X = 10), Achatado como um papel (Y = 0.1) e Profundo (Z = 10)
        this.transform.scale = [10.0, 0.1, 10.0];

        // 1. Vai buscar a imagem HTML carregada na memória
        const htmlImage = AssetManager.instance.GetImage("textura_chao");
        
        // 2. Converte essa imagem HTML numa Textura WebGL (mantendo a referência)
        if (htmlImage) {
            this.myTexture = this.shapes.CreateTexture(htmlImage);
        }
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
    }
}