import { Level3D, Mesh, PrimitiveMesh, UnlitMaterial } from 'gameforgejs/3d';

export class FirstLevel extends Level3D {
    constructor() {
        super({ width: 800, height: 450, useUI: false, usePhysics: false });
        this.TelaId = 'gameCanvas3D';
        this.caption = '__PROJECT_NAME__';
    }

    BuildScene() {
        this.cube = new Mesh({
            geometry: PrimitiveMesh.Cube(1.6),
            material: new UnlitMaterial({ color: '#70baff' }),
        });
        this.scene.Add(this.cube);
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);
        this.cube.transform.rotation.y += dt * 0.8;
    }
}
