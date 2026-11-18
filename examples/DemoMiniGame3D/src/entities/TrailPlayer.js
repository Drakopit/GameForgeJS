import { ActionManager, AssetManager, MathExt, Vector3D } from 'gameforgejs/core';
import { ModelMeshFactory, Rigidbody3D, SphereCollider3D, StandardMaterial, Texture } from 'gameforgejs/3d';

export class TrailPlayer {
    constructor(scene, physics, definition) {
        this.scene = scene;
        this.physics = physics;
        this.definition = definition;
        this.CreatePlayer();
        this.Reset(definition.spawn);
        this.input = { horizontal: 0, forward: 0, boost: false };
    }

    CreatePlayer() {
        const player = this.definition;
        const material = new StandardMaterial({
            name: "CharacterMaterial",
            albedoMap: Texture.FromImage(AssetManager.instance.GetImage("textura_player")),
            roughness: 0.62,
            metallic: 0,
        });

        this.model = ModelMeshFactory.FromAsset(player.model, { material, name: "PlayerCharacter" });
        this.model
            .SetPosition(...player.spawn.ToArray())
            .SetScale(player.scale)
            .SetRotation(0, Math.PI, 0)
            .AddTo(this.scene);

        this.body = new Rigidbody3D({
            mass: 1,
            damping: 1,
            bounciness: 0,
        });
        this.physicsBody = this.physics.AddBody({
            object: this.model,
            rigidbody: this.body,
            collider: new SphereCollider3D({
                radius: player.collider.radius,
                offset: player.collider.offset.ToArray(),
            }),
            tag: "player",
        });
        this.facing = Math.PI;
    }

    OnUpdate() {
        this.input.horizontal = ActionManager.GetActionValue('RIGHT') - ActionManager.GetActionValue('LEFT');
        this.input.forward = ActionManager.GetActionValue('FORWARD') - ActionManager.GetActionValue('BACK');
        this.input.boost = ActionManager.IsAction('BOOST');
        if (ActionManager.IsActionDown('JUMP')) this.jumpBuffer = this.definition.movement.jumpBufferSeconds;
    }

    Move(dt, cameraYaw) {
        const movement = this.definition.movement;
        const horizontal = this.input.horizontal;
        const forward = this.input.forward;
        const length = Math.hypot(horizontal, forward);
        const normalizedX = length > 1 ? horizontal / length : horizontal;
        const normalizedForward = length > 1 ? forward / length : forward;
        const sin = Math.sin(cameraYaw);
        const cos = Math.cos(cameraYaw);
        const directionX = normalizedX * cos - normalizedForward * sin;
        const directionZ = -normalizedX * sin - normalizedForward * cos;
        const speed = this.input.boost ? movement.boostSpeed : movement.speed;
        const response = length < movement.stopThreshold ? movement.braking : movement.smoothing;
        const smoothing = 1 - Math.exp(-response * dt);

        const velocity = Vector3D.FromArray(this.body.velocity);
        velocity.x = MathExt.Lerp(velocity.x, directionX * speed, smoothing);
        velocity.z = MathExt.Lerp(velocity.z, directionZ * speed, smoothing);

        if (length > movement.facingThreshold) {
            const targetFacing = Math.atan2(directionX, directionZ);
            this.facing = MathExt.LerpAngle(this.facing, targetFacing, 1 - Math.exp(-movement.turnSmoothing * dt));
            this.model.transform.rotation.y = this.facing;
        }

        this.coyote = this.body.grounded ? movement.coyoteSeconds : Math.max(0, this.coyote - dt);
        if (this.jumpBuffer > 0 && this.coyote > 0) {
            this.jumpBuffer = 0;
            this.coyote = 0;
            this.body.grounded = false;
            this.body.groundBody = null;
            velocity.y = movement.jumpSpeed;
        }
        velocity.ToArray(this.body.velocity);
        this.jumpBuffer = Math.max(0, this.jumpBuffer - dt);
    }

    Reset(position) {
        this.model.SetPosition(...position.ToArray()).SetRotation(0, Math.PI, 0);
        this.body.velocity.fill(0);
        this.body.grounded = false;
        this.body.groundBody = null;
        this.facing = Math.PI;
        this.jumpBuffer = 0;
        this.coyote = 0;
        if (this.input) this.input = { horizontal: 0, forward: 0, boost: false };
    }

    OnDestroy() {
        this.physics.RemoveBody(this.physicsBody);
        for (const mesh of this.model.meshes) this.scene.Remove(mesh);
    }
}
