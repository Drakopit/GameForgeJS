import { GameObject3D } from "../Root/GameObject3D.js";
import { Shapes3D } from "../Graphic/Shape3D.js";
import { Input } from "../Input/Input.js";
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

        // 2. Converte essa imagem HTML numa Textura WebGL (mantendo a referência)
        if (htmlImage) {
            this.myTexture = this.shapes.CreateTexture(htmlImage);
        }
    }

    OnUpdate(dt) {
        const delta = dt || 0.016;
        const rotationSpeed = 3.0; // Velocidade do giro

        // Eixo X agora controla a ROTAÇÃO (Girar para os lados)
        if (Input.GetKey("KeyA") || Input.GetKey("ArrowLeft")) {
            this.transform.rotation.y += rotationSpeed * delta;
        }
        if (Input.GetKey("KeyD") || Input.GetKey("ArrowRight")) {
            this.transform.rotation.y -= rotationSpeed * delta;
        }

        // Eixo Z agora usa a matemática de Seno e Cosseno para andar na direção do giro
        if (Input.GetKey("KeyW") || Input.GetKey("ArrowUp")) {
            // Anda para a FRENTE (Baseado na rotação Y atual)
            this.transform.position[0] -= this.speed * Math.sin(this.transform.rotation.y) * delta;
            this.transform.position[2] -= this.speed * Math.cos(this.transform.rotation.y) * delta;
        }
        if (Input.GetKey("KeyS") || Input.GetKey("ArrowDown")) {
            // Anda para TRÁS (Baseado na rotação Y atual)
            this.transform.position[0] += this.speed * Math.sin(this.transform.rotation.y) * delta;
            this.transform.position[2] += this.speed * Math.cos(this.transform.rotation.y) * delta;
        }

        // Limites da Arena (Opcional, pode remover se quiser explorar fora do mapa)
        if (this.transform.position[0] < -4.0) this.transform.position[0] = -4.0;
        if (this.transform.position[0] > 4.0) this.transform.position[0] = 4.0;
        if (this.transform.position[2] < -12.0) this.transform.position[2] = -12.0;
        if (this.transform.position[2] > -3.0) this.transform.position[2] = -3.0;
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