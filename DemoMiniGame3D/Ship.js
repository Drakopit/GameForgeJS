import { GameObject3D } from "../Root/GameObject3D.js";
import { Mesh3D }        from "../Graphic/Mesh3D.js";
import { AssetManager }  from "../Root/AssetManager.js";

export class Ship extends GameObject3D {
    constructor(screen3D) {
        super();
        this.name = "EnemyShip";

        // Pega as meshes pré-carregadas pelo AssetManager
        const meshDatas = AssetManager.instance.GetModel("nave_inimiga");

        // Cria um Mesh3D para cada sub-mesh do modelo
        this.meshes = meshDatas.map(data => new Mesh3D(screen3D.Context, data));

        this.transform.position = [2.0, 0.0, -8.0];
        this.transform.scale    = [0.5, 0.5, 0.5];
    }

    OnUpdate(dt) {
        this.transform.rotation.y += 0.5 * dt; // Gira devagarzinho
    }

    OnDrawn(camera) {
        this.meshes.forEach(mesh => mesh.Draw(this.transform, camera));
    }

    OnExit() {
        // IMPORTANTE: libera memória da GPU quando o level encerrar
        this.meshes.forEach(mesh => mesh.Dispose());
    }
}
