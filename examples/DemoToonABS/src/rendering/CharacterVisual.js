import { ModelMeshFactory, SkeletalAnimator, ToonMaterial } from 'gameforgejs/3d';
import { CharacterAssets } from '../data/CharacterAssets.js';

export class CharacterVisual {
    constructor(actor, modelName, scene, assets, focus = actor) {
        this.actor = actor;
        this.focus = focus;
        this.scene = scene;
        this.model = ModelMeshFactory.FromAsset(modelName, {
            materialFactory: (part, index) => new ToonMaterial(ModelMeshFactory.CreateMaterial(part, index, modelName)),
        });
        this.model.SetScale(CharacterAssets.scale);
        this.model.AddTo(scene);
        this.animator = new SkeletalAnimator(this.model);
        for (const [name, definition] of Object.entries(CharacterAssets.clips)) {
            this.animator.AddClip(name, assets.GetModel(definition.library), definition.clip);
        }
        this.Reset();
    }

    Reset() {
        this.elapsed = 0;
        this.animator.Play('idle', { restart: true });
        this.SyncTransform();
    }

    OnUpdate(dt) {
        const actor = this.actor;
        this.elapsed += dt;
        const distance = Math.hypot(
            actor.transform.position[0] - this.focus.transform.position[0],
            actor.transform.position[2] - this.focus.transform.position[2]);
        // Distant rigs sample at 5 Hz; combat still runs at the normal fixed step.
        if (distance > 12 && this.elapsed < 0.2) return;
        dt = this.elapsed;
        this.elapsed = 0;
        if (!actor.health.IsAlive() && this.animator.current?.name === 'death' && this.animator.finished) return;
        let clip = 'idle';
        if (!actor.health.IsAlive()) clip = 'death';
        else if (actor.hurtRemaining > 0) clip = 'hit';
        else if (actor.attack.phase !== 'ready') clip = 'attack';
        else if (Math.hypot(actor.rigidbody.velocity[0], actor.rigidbody.velocity[2]) > 0.1) clip = 'run';
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
        const position = this.actor.transform.position;
        this.model.SetPosition(position[0], position[1] - 0.55, position[2]);
        const facing = this.actor.facing;
        this.model.SetRotation(0, Math.atan2(facing[0], facing[1]), 0);
    }

    OnDestroy() {
        for (const mesh of this.model.meshes) this.scene.Remove(mesh);
    }
}
