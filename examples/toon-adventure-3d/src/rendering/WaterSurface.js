import { Mesh, ToonMaterial } from 'gameforgejs/3d';
import { WaterGeometry } from './WaterGeometry.js';

export class WaterSurface extends Mesh {
    constructor(definition) {
        super({
            name: 'Pond water',
            geometry: new WaterGeometry(definition),
            material: new ToonMaterial({ albedoColor: definition.color }),
            castShadow: false,
        });
        this.speed = definition.speed;
        this.phase = 0;
        this.transform.SetPosition(...definition.position);
    }

    OnUpdate(dt) {
        this.phase = (this.phase + dt * this.speed) % (Math.PI * 2);
        this.geometry.Update(this.phase);
    }
}
