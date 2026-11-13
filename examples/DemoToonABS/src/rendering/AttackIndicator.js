import { Mesh, PrimitiveMesh, UnlitMaterial } from 'gameforgejs/3d';

export class AttackIndicator extends Mesh {
    constructor(actor) {
        super({ geometry: PrimitiveMesh.Cube(1), material: new UnlitMaterial({ color: '#ffd56c' }), castShadow: false });
        this.actor = actor;
    }

    OnUpdate() {
        const { attack, health, transform } = this.actor;
        this.visible = health.IsAlive() && (attack.phase === 'windup' || attack.phase === 'active');
        this.material.albedoColor = attack.phase === 'active' ? [1, 0.25, 0.2, 1] : [1, 0.8, 0.35, 1];
        this.transform.SetScale(attack.settings.halfWidth * 2, 0.06, attack.settings.reach);
        this.transform.SetPosition(
            transform.position[0] + attack.direction[0] * attack.settings.reach / 2,
            0.08,
            transform.position[2] + attack.direction[1] * attack.settings.reach / 2,
        );
        this.transform.rotation.y = Math.atan2(attack.direction[0], attack.direction[1]);
    }
}
