import {Base} from "Base.js"
import {Rect} from "Shapes/Rect.js";
import {Collide2D} from "Math/Collide2D.js";

class Button extends Base {
    constructor(canvas, context) {
        this.canvas = (canvas != undefined) ? canvas : console.log("Canvas não definido! A classe Button precisa ter um canvas.");
        this.context = (context != undefined) ? context : console.log("Contexto não definido! A classe Button precisa ter um contexto.");        
        // Default
        this.color = "#428BCA";
    };
    
    /* Gets e Sets */
    set color(cor) { this.color = cor; }
    get color() { return this.color; }
    
    // Métodos
    Click(callback) {
        // Executa a função de callback, caso seja clicado
        canvas.addEventListener('click', (e) => {
            const collide = new Collide2D();
            const mouserect = new Rect(e.offsetX, e.offsetY, 1, 1);
            var iscollide = collide.isCollidingAABB(rect, mouserect);
            if (iscollide) callback();
        }, false);
    }

    Draw(rect) {
        super().OnGUI();
        // Instancia um retângulo do tamanho do botão pra que seja possível fazer os cálculos
        this.rect = rect;
        
        // Desenha o botão
        context.fillStyle = color;
        context.rect(rect.x, rect.y, rect.width, rect.height);
        context.fill();
    }

    Draw(x, y, width, height) {
        super().OnGUI();
        // Instancia um retângulo do tamanho do botão pra que seja possível fazer os cálculos
        this.rect = new Rect(x, y, width, height);
        
        // Desenha o botão
        context.fillStyle = color;
        context.rect(rect.x, rect.y, rect.width, rect.height);
        context.fill();
    }
}