import { Component, Vector3D, MathExt } from 'gameforgejs/core';

export class ExplorerMotion extends Component {
    constructor(level, actor) { super(); this.level = level; this.actor = actor; this.stepTime=0; this.wasGrounded=false; }
    OnFixedUpdate(dt) {
        const level = this.level, actor = this.actor, rules = level.rules.movement;
        if (level.tour.playing) return;
        const direction = level.hud.Direction();
        const yaw = level.rig.yaw, input = new Vector3D(direction.x, 0, direction.y);
        const target = new Vector3D(input.x * Math.cos(yaw) + input.z * Math.sin(yaw), 0,
            input.z * Math.cos(yaw) - input.x * Math.sin(yaw)).MultiplyScalar(rules.speed);
        const velocity = Vector3D.FromArray(actor.body.velocity);
        const response = 1 - Math.exp(-rules.response * dt);
        velocity.x = MathExt.Lerp(velocity.x, target.x, response);
        velocity.z = MathExt.Lerp(velocity.z, target.z, response);
        if (level.jumpQueued && actor.body.grounded) {velocity.y = rules.jump;level.sound.Play('jump');}
        if (!this.wasGrounded && actor.body.grounded) level.sound.Play('land');
        this.wasGrounded=actor.body.grounded;
        this.stepTime-=dt;
        if (target.xz.Length()>1 && actor.body.grounded && this.stepTime<=0) {level.sound.Play('step');this.stepTime=0.38;}
        level.jumpQueued = false;
        velocity.ToArray(actor.body.velocity);
        if (target.xz.Length() > 0.1) actor.mesh.transform.rotation.y = Math.atan2(target.x, target.z);
        if (Vector3D.FromArray(actor.mesh.transform.position).y < rules.fallLimit) level.ResetPlayer();
    }
}
