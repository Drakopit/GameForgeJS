// import { Screen } from "./Screen";
// import { Vector3D } from "../Math/Vector3D.js";

// export class Screen3D extends Screen {
//     constructor(id, width, height) {
//         super();
// 		this.id = id;
// 		this.ratio = width/height;
// 		if (width !== undefined && height !== undefined) {
//             this.width = width * this.ratio;
// 			this.height = height * this.ratio;
// 		} else {
// 			this.width = window.innerWidth * this.ratio;
// 			this.height = window.innerHeight * this.ratio;
// 		}
//         this.clientWidth = window.innerWidth;
//         this.clientHeight = window.innerHeight;
//         this.x = 0; this.y = 0; this.z = 0;
//         this.position = new Vector3D(this.x, this.y, this.z);
//     }

//     Init(screenName) {
//         this.canvas = document.createElement("canvas");
//         document.body.appendChild(this.canvas);
//         this.canvas.setAttribute("id", screenName);
//         this.canvas.setAttribute("width", this.width);
//         this.canvas.setAttribute("height", this.height);
//         this.context = this.canvas.getContext("webgl") ||
//                        this.canvas.getContext("experimental-webgl") ||
//                        this.canvas.getContext("webkit-3d") ||
//                        this.canvas.getContext("moz-webgl");
//         if (this.context && this.context instanceof WebGLRenderingContext) return true;
//         else throw "Contexto de reenderização 3D não encontrado";
//     }

//     // configura o viewport
//     ViewPort() {
//         this.Context.viewport(0, 0, this.canvas.width, this.canvas.height );
//     }

//     /**
//      * @doc Method
//      * @description Get canvas of the screen
//      * @example
//      *  var newCanvas = screen.Canvas();
//      * @returns canvas
//      */
//     get Canvas() { return this.canvas; }

//     /**
//      * @doc Method
//      * @description Set new canvas
//      * @example
//      * var canvas = document.getElementById("canvasName")
//      *  screen.Canvas(canvas)
//      */
//     set Canvas(canvas) { this.canvas = canvas; }
    
//     /**
//      * @doc Method
//      * @description Get context of the screen
//      * @example
//      *  var newContext = screen.Context();
//      * @returns context
//      */
//     get Context() { return this.context; }

//     /**
//      * @doc Method
//      * @description Set new context
//      * @example
//      *  var context = document.getElementById("canvasName").getContext("typeContext");
//      *  screen.Context(context);
//      */
//     set Context(context) { this.context = context; }

//     /**
//      * @doc Method
//      * @description Get screen id
//      * @example
//      *  var id = screen.ScreenId();
//      * @returns number
//      */
//     get ScreenId() { return this.id; }

//     /**
//      * @doc Method
//      * @description return canvas width
//      * @example
//      *  var width = screen.Width();
//      * @returns number
//      */
//     get Width() { return this.canvas.width; }
    
//     /**
//      * @doc Method
//      * @description returns canvas height
//      * @example
//      *  var width = screen.Height();
//      * @returns number
//      */
//     get Height() { return this.canvas.height; }

//     /**
//      * @doc Method
//      * @description Return size screen
//      * @example
//      * var size = screen.GetSize();
//      * @returns Vector2D
//      */
//     GetSize() {
//         return new Vector2D(this.Width, this.Height);
//     }

//     /**
//      * @doc Method
//      * @description Return size window browser
//      * @example
//      * var windowSize = GetwindowSize();
//      * @returns Vector2D
//      */
//     GetwindowSize() {
//         return new Vector2D(this.clientWidth, this.clientHeight);
//     }

//     Refresh() {
//         // Limpa a tela com a cor preta
//         this.Context.clearColor(0.0, 0.0, 0.0, 1.0);
//         // Limpa a tela
//         this.Context.clear(this.Canvas.COLOR_BUFFER_BIT);
//     }

//     /**
//      * @doc Method
//      * @param {width} width 
//      * @param {height} height
//      * @description Resize screen
//      * @example
//      *  screen.Resize(640, 480);
//      */
//     Resize() {
//         window.addEventListener("resize", function() {
//             this.canvas.width = this.width;
//             this.canvas.height = this.height;
//         });
//     }
// }

// TODO: Fix it too
export class Screen3D {

}