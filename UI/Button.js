/**
 * @doc Class Button
 * @namespace UI
 * @class Button
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example
 *  In Progress
 * @returns {Object}
 */

import { Draw } from "../Drawing/Draw.js";
import { Mouse } from "../Input/Mouse.js";

export class Button {
    constructor(screen) {
        this.screen = screen;
        this.color = "#428BCA";
        this.draw = new Draw(screen);
        this.mouse = new Mouse();
        this.rect = new Rectangle(0,0,80,15);
    };

    SetButton(rect) {
        this.rect = rect;
    }

    /**
     * @doc Method
     * @param {color} cor
     * @description Chage button color
     * @example
     *  button.Color(cor);
     * @returns {}
     */
    set Color(cor) { this.draw.Color = cor; }

    /**
     * @doc Method
     * @param {functionToExecute} callback 
     * @description Execute some action when button is clicked
     * @example
     *  button.Click(function () {
     *      console.log("Button was clicked!");
     *  });
     */
    Click() {
        this.rect = rect || this.rect;
        if (this.mouse.ClickDown(this.rect)) {
            return true;
        } else {
            return false;
        };
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
    DrawCursor(rect) {
        this.rect = rect || this.rect;
        this.draw.Color = this.Color;
        this.draw.Style = 1;
        this.draw.DrawRect(this.rect.x+1, this.rect.y+1, this.rect.width-1, this.rect.height-1);
        this.draw.Style = 0;
        this.draw.DrawRect(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
        this.draw.Color = "white";
    }
}