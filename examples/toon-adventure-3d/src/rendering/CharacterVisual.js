import { CombatVisualSettings } from '../data/PresentationSettings.js';
import { Vector2D, Vector3D } from 'gameforgejs/core';
import { ModelMeshFactory, SkeletalAnimator, ToonMaterial } from 'gameforgejs/3d';
import { CharacterAssets } from '../data/CharacterAssets.js';

export class CharacterVisual {
    /** @param {number} scale - Character scale (the player node's scale in the courtyard scene). */
    constructor(actor, modelName, scene, assets, scale = 1) {
        this.actor = actor;
        this.scene = scene;
        this.model = ModelMeshFactory.FromAsset(modelName, {
            materialFactory: (part, index) => new ToonMaterial(ModelMeshFactory.CreateMaterial(part, index, modelName)),
        });
        this.model.SetScale(scale);
        this.model.AddTo(scene);
        this.animator = new SkeletalAnimator(this.model);
        for (const [name, definition] of Object.entries(CharacterAssets.clips)) {
            this.animator.AddClip(name, assets.GetModel(definition.library), definition.clip);
        }
        this.Reset();
    }

    Reset() {
        this.animator.Play('idle', { restart: true });
        this.SyncTransform();
    }

    OnUpdate(dt) {
        const actor = this.actor;
        if (!actor.health.IsAlive() && this.animator.current?.name === 'death' && this.animator.finished) return;
        const velocity = Vector3D.FromArray(actor.rigidbody.velocity);
        let clip = 'idle';
        if (!actor.health.IsAlive()) clip = 'death';
        else if (actor.hurtRemaining > 0) clip = 'hit';
        else if (actor.attack.phase !== 'ready') clip = 'attack';
        else if (Math.hypot(velocity.x, velocity.z) > CombatVisualSettings.movementThreshold) clip = 'run';
        this.animator.Play(clip, { loop: clip === 'idle' || clip === 'run' });
        if (clip === 'attack') this.SampleAttack();
        else this.animator.Update(dt);
    }

    SampleAttack() {
        const attack = this.actor.attack;
        const settings = attack.settings;
        const total = settings.windup + settings.active + settings.recovery;
        const elapsed = attack.phase === 'windup' ? settings.windup - attack.states.windup.remaining
            : attack.phase === 'active' ? settings.windup + settings.active - attack.states.active.remaining
            : total - attack.states.recovery.remaining;
        this.animator.Seek(Math.max(0, elapsed) / total * this.animator.current.duration);
    }

    SyncTransform() {
        const position = Vector3D.FromArray(this.actor.transform.position);
        this.model.SetPosition(position.x, position.y - this.actor.body.collider.radius, position.z);
        const facing = Vector2D.FromArray(this.actor.facing);
        this.model.SetRotation(0, Math.atan2(facing.x, facing.y), 0);
    }

    OnDestroy() {
        for (const mesh of this.model.meshes) this.scene.Remove(mesh);
    }
}
