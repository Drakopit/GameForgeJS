/**
 * @doc Class Button
 * @namespace GUI
 * @class Button
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  var button = new Button(canvas, context);
 * @returns {Object}
 */
import {Rect} from "Shapes/Rect.js";
import {Collide2D} from "Math/Collide2D.js";

class Button {
    constructor(screen) {
        this.screen = screen;
        this.color = "#428BCA";
    };

    /**
     * @doc Method
     * @param {color} cor
     * @description Chage button color
     * @example
     *  button.Color(cor);
     * @returns {}
     */
    set Color(cor) { this.color = cor; }

    /**
     * @doc Method
     * @description Get button color
     * @example
     *  var color = button.Color();
     * @returns {string}
     */
    get Color() { return this.color; }
    
    /**
     * @doc Method
     * @param {functionToExecute} callback 
     * @description Execute some action when button is clicked
     * @example
     *  button.Click(function () {
     *      console.log("Button was clicked!");
     *  });
     */
    Click(callback) {
        // Executa a função de callback, caso seja clicado
        canvas.addEventListener('click', (e) => {
            const collide = new Collide2D();
            const mouserect = new Rect(e.offsetX, e.offsetY, 1, 1);
            var iscollide = collide.isCollidingAABB(rect, mouserect);
            if (iscollide) callback();
        }, false);
    }

    /**
     * @doc Method
     * @param {x} x 
     * @param {y} y 
     * @param {width} width 
     * @param {height} height
     * @description Draws button UI
     * @example
     *  button.Draw(0, 0, 121, 24);
     * @returns {} 
     */
    Draw(x, y, width, height) {
        // Instancia um retângulo do tamanho do botão pra que seja possível fazer os cálculos
        this.rect = new Rect(x, y, width, height);
        
        // Desenha o botão
        this.screen.Context.fillStyle = color;
        this.screen.Context.rect(rect.x, rect.y, rect.width, rect.height);
        this.screen.Context.fill();
    }
}