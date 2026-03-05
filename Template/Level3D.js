import { Base } from "../Root/Base.js";
import { Screen3D as ScreenWebGL } from "../Window/Screen3D.js";

export class Level3D extends Base {
    constructor(canvasId = "gameCanvas", width = 800, height = 600) {
        super();
        this.caption = "Modelo de Level 3D";
        this.Next = false;
        this.TelaId = null;
        this.FPS = 0;
        this.LEVEL_HANDLER = this;
        this.entities = [];
        
        // Inicializa o contexto 3D em vez do 2D
        this.screen3D = new ScreenWebGL(canvasId, width, height);
    }

    OnStart() {
        document.title = this.caption;
        
        // Habilita o teste de profundidade (Depth Test) nativo do WebGL
        const gl = this.screen3D.Context;
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Fundo preto
        gl.enable(gl.DEPTH_TEST);

        this.entities.forEach(entity => {
            if (typeof entity.OnStart === "function") entity.OnStart();
        });
    }

    OnUpdate(dt) {
        this.entities.forEach(entity => {
            if (typeof entity.OnUpdate === "function") entity.OnUpdate(dt);
        });
    }

    OnDrawn() {
        // Limpa os buffers de cor e profundidade do WebGL a cada frame
        this.screen3D.Refresh();

        this.entities.forEach(entity => {
            if (typeof entity.OnDrawn === "function") entity.OnDrawn();
        });
    }

    AddEntity(entity) {
        this.entities.push(entity);
        if (typeof entity.OnStart === "function") {
            entity.OnStart();
        }
    }
}