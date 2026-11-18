import { HUDFrame } from 'gameforgejs/2d';
import { Level3D, Mesh, PrimitiveMesh, UnlitMaterial } from 'gameforgejs/3d';

export class FirstLevel extends Level3D {
    constructor() {
        super({ width: 800, height: 450, useUI: true, usePhysics: false });
        this.TelaId = 'gameCanvas3D';
        this.caption = '__PROJECT_NAME__';
    }

    BuildScene() {
        this.hud = new HUDFrame(this.ui.Draw);
        this.cube = new Mesh({
            geometry: PrimitiveMesh.Cube(1.6),
            material: new UnlitMaterial({ color: '#70baff' }),
        });
        this.scene.Add(this.cube);
    }

    OnGUI() {
        super.OnGUI();
        this.hud.Panel({ x: 16, y: 16, width: 500, height: 75 });
        this.hud.Text(this.caption, 32, 44, { size: 22, color: this.hud.theme.gold });
        this.hud.Text('A rotating cube rendered with WebGL2. Edit FirstLevel to begin.', 32, 70, { size: 13 });
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);
        this.cube.transform.rotation.y += dt * 0.8;
    }
}
