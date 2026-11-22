/** @deprecated Use `Level3D` from `gameforgejs/3d`. */
export class Level3D extends Base {
    caption: string;
    TelaId: any;
    FPS: number;
    LEVEL_HANDLER: this;
    entities: any[];
    OnUpdate(dt: any): void;
    AddEntity(entity: any): void;
}
import { Base } from "../../../core/Base.js";
