import { GameObject3D } from "../Root/GameObject3D.js";
import { Shapes3D } from "../Graphic/Shape3D.js";
import { ActionManager } from "../Input/ActionManager.js";
import { AssetManager } from "../Root/AssetManager.js";

export class Player3D extends GameObject3D {
    constructor(screen3D) {
        super();
        this.name = "PlayerCube";
        this.shapes = new Shapes3D(screen3D);

        // Posição inicial: Centro da tela (X=0, Y=0), afastado da câmera (Z=-6)
        this.transform.position = [0.0, 0.0, -6.0];
        // Um pouco menor para termos espaço para andar
        this.transform.scale = [0.5, 0.5, 0.5];

        this.speed = 5.0; // Velocidade de movimento em unidades 3D por segundo

        const htmlImage = AssetManager.instance.GetImage("textura_player");

        if (htmlImage) {
            this.myTexture = this.shapes.CreateTexture(htmlImage);
        }
    }

    OnUpdate(dt) {
        const delta = dt || 0.016;
        const rotationSpeed = 3.0;

        // Girar para os lados usa LEFT/RIGHT do ActionManager
        if (ActionManager.IsAction("LEFT")) {
            this.transform.rotation.y += rotationSpeed * delta;
        }
        if (ActionManager.IsAction("RIGHT")) {
            this.transform.rotation.y -= rotationSpeed * delta;
        }

        // Andar frente/trás usa FORWARD/BACK do ActionManager
        if (ActionManager.IsAction("FORWARD")) {
            this.transform.position[0] -= this.speed * Math.sin(this.transform.rotation.y) * delta;
            this.transform.position[2] -= this.speed * Math.cos(this.transform.rotation.y) * delta;
        }
        if (ActionManager.IsAction("BACK")) {
            this.transform.position[0] += this.speed * Math.sin(this.transform.rotation.y) * delta;
            this.transform.position[2] += this.speed * Math.cos(this.transform.rotation.y) * delta;
        }

        // Limites da Arena
        if (this.transform.position[0] < -4.0) this.transform.position[0] = -4.0;
        if (this.transform.position[0] >  4.0) this.transform.position[0] =  4.0;
        if (this.transform.position[2] < -12.0) this.transform.position[2] = -12.0;
        if (this.transform.position[2] >  -3.0) this.transform.position[2] =  -3.0;
    }

    OnDrawn(camera) {
        this.shapes.DrawCube(
            this.transform.position,
            this.transform.rotation,
            this.transform.scale,
            camera,
            this.myTexture
        );
    }
}