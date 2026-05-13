import { GameObject3D } from "../Root/GameObject3D.js";
import { Mesh3D } from "../Graphic/Mesh3D.js";
import { AssetManager } from "../Root/AssetManager.js";

export class Char extends GameObject3D {
    constructor(screen3D, modelName) {
        super();
        this.name = "GoalMarker";

        const meshDatas = AssetManager.instance.GetModel(modelName) || [];
        this.meshes = meshDatas.map(data => new Mesh3D(screen3D.Context, data));

        this.transform.position = [3.25, -0.45, -11.35];
        this.transform.scale = [0.65, 0.65, 0.65];
    }

    OnUpdate(dt) {
        this.transform.rotation.y += 0.45 * (dt || 0.016);
    }

    OnDrawn(camera, lighting) {
        this.meshes.forEach(mesh => mesh.Draw(this.transform, camera, { lighting }));
    }

    OnExit() {
        this.meshes.forEach(mesh => mesh.Dispose());
    }
}
