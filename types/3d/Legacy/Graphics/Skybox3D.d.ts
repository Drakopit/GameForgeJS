/** @deprecated Use `Skybox` from `gameforgejs/3d`. */
export class Skybox3D extends Shapes3D {
    constructor(screen: any, image: any);
    texture: any;
    createCubeMapFromCross(image: any): any;
    OnDrawn(camera: any): void;
}
import { Shapes3D } from "./Shape3D.js";
