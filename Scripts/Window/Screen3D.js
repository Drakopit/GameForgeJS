import { Screen } from "./Screen";
import { Vector3D } from "../Math/Vector3D.js";

export class Screen3D extends Screen {
    constructor(id, width, height) {
        super();
		this.id = id;
		this.ratio = width/height;
		if (width !== undefined && height !== undefined) {
            this.width = width * this.ratio;
			this.height = height * this.ratio;
		} else {
			this.width = window.innerWidth * this.ratio;
			this.height = window.innerHeight * this.ratio;
		}
        this.clientWidth = window.innerWidth;
        this.clientHeight = window.innerHeight;
        this.x = 0; this.y = 0; this.z = 0;
        this.position = new Vector3D(this.x, this.y, this.z);
    }

    Init(screenName) {
        this.canvas = document.createElement("canvas");
        document.body.appendChild(this.canvas);
        this.canvas.setAttribute("id", screenName);
        this.canvas.setAttribute("width", this.width);
        this.canvas.setAttribute("height", this.height);
        this.context = this.canvas.getContext("webgl") || this.canvas.getContext("experimental-webgl");
        if (this.context && this.context instanceof WebGLRenderingContext) return true;
        else throw "Contexto de reenderização 3D não encontrado";
    }
}