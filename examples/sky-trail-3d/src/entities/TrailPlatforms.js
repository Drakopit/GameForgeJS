import { Vector3D } from 'gameforgejs/core';
import { BoxCollider3D } from 'gameforgejs/3d';
import { SkyTrailSurfaceFactory } from '../rendering/SkyTrailSurfaceFactory.js';

export class TrailPlatforms {
    constructor(scene, physics, course) {
        this.scene = scene;
        this.physics = physics;
        this.course = course;
        this.CreatePlatforms();
        this.Update(0);
    }

    CreatePlatforms() {
        const factory = new SkyTrailSurfaceFactory(this.course.surface);

        this.platforms = this.course.platforms.map(definition => {
            const { baseColor, material, mesh } = factory.CreatePlatform(definition);
            mesh.transform
                .SetPosition(...definition.position.ToArray())
                .SetScale(...definition.size.ToArray());
            this.scene.Add(mesh);
            const body = this.physics.AddBody({
                object: mesh,
                collider: new BoxCollider3D({ size: definition.size.ToArray() }),
                tag: "platform",
            });
            return {
                definition,
                mesh,
                material,
                body,
                baseColor,
                active: true,
                delta: new Vector3D(),
            };
        });
        this.platformById = new Map(this.platforms.map(platform => [platform.definition.id, platform]));
    }

    Update(time) {
        this.platforms.forEach(platform => {
            const previous = Vector3D.FromArray(platform.mesh.transform.position);
            const position = platform.definition.position.GetValue();
            const motion = platform.definition.motion;
            if (motion) {
                position[motion.axis] += Math.sin(time * motion.speed + motion.phase) * motion.amplitude;
            }

            platform.mesh.transform.SetPosition(...position.ToArray());
            platform.delta = position.SubtractValue(previous);
            this.UpdatePlatformAvailability(platform, time);
        });
    }

    UpdatePlatformAvailability(platform, time) {
        const blink = platform.definition.blink;
        if (!blink) return;

        const cycle = (time + blink.phase) % blink.period;
        const active = cycle < blink.solidDuration;
        const warning = active && cycle > blink.solidDuration - blink.warningDuration;
        platform.active = active;
        platform.body.enabled = active;
        platform.mesh.visible = active;
        platform.material.albedoColor = warning
            ? [0.92, 0.31, 0.21, 1]
            : [...platform.baseColor];
        platform.material.emissiveColor = warning
            ? [0.08, 0.012, 0.005]
            : [0, 0, 0];
    }

    GetAttachmentPosition(definition) {
        const rawPosition = this.platformById.get(definition.platformId)?.mesh.transform.position;
        const platformPosition = rawPosition ? Vector3D.FromArray(rawPosition) : new Vector3D();
        return platformPosition.AddValue(definition.offset);
    }

    Carry(player) {
        const platform = this.platforms.find(item => item.body === player.body.groundBody);
        if (player.body.grounded && platform?.active) {
            const position = Vector3D.FromArray(player.model.transform.position).AddValue(platform.delta);
            player.model.SetPosition(...position.ToArray());
        }
    }

    OnDestroy() {
        for (const platform of this.platforms) {
            this.physics.RemoveBody(platform.body);
            this.scene.Remove(platform.mesh);
        }
    }
}

