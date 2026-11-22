/** @deprecated Use `Transform3D` from the `Render3D` exports. */
export class Transform3D {
    constructor(showWarning?: boolean);
    position: number[];
    rotation: {
        x: number;
        y: number;
        z: number;
    };
    scale: number[];
}
/** @deprecated Use `Mesh`, `Model3D` or game-owned entities composed with Render3D. */
export class GameObject3D extends Base {
    id: any;
    name: string;
    transform: Transform3D;
    solid: boolean;
    OnUpdate(dt: any): void;
}
import { Base } from "../../core/Base.js";
