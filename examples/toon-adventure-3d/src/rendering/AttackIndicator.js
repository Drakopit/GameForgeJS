import { CombatVisualSettings } from '../data/PresentationSettings.js';
import { Vector2D, Vector3D } from 'gameforgejs/core';
import { Mesh, PrimitiveMesh, UnlitMaterial } from 'gameforgejs/3d';

export class AttackIndicator extends Mesh {
    constructor(actor) {
        super({ geometry: PrimitiveMesh.Cube(1), material: new UnlitMaterial({ color: '#ffd56c' }), castShadow: false });
        this.actor = actor;
    }

    OnUpdate() {
        const { attack, health, transform } = this.actor;
        const position = Vector3D.FromArray(transform.position);
        const direction = Vector2D.FromArray(attack.direction);
        this.visible = health.IsAlive() && (attack.phase === 'windup' || attack.phase === 'active');
        this.material.albedoColor = attack.phase === 'active' ? [1, 0.25, 0.2, 1] : [1, 0.8, 0.35, 1];
        this.transform.SetScale(attack.settings.halfWidth * 2, CombatVisualSettings.indicatorThickness, attack.settings.reach);
        this.transform.SetPosition(
            position.x + direction.x * attack.settings.reach / 2,
            CombatVisualSettings.indicatorHeight,
            position.z + direction.y * attack.settings.reach / 2,
        );
        this.transform.rotation.y = Math.atan2(direction.x, direction.y);
    }
}
