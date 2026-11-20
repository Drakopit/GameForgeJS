import { Component, ActionManager, Input, Touch, Vector3D, MathExt } from 'gameforgejs/core';

/** Orbit/chase and free orbit share one camera; cinematic tracks temporarily own it. */
export class ObservatoryCamera extends Component {
    constructor(level) {
        super(); this.level = level; this.mode = 'chase'; this.yaw = level.rules.camera.yaw;
        this.pitch = level.rules.camera.pitch; this.pointer = null; this.touchId = null;
    }
    OnUpdate(dt) {
        const level = this.level;
        if (level.tour.playing) { this.pointer = null; this.touchId = null; return; }
        const settings = level.rules.camera;
        this.yaw += (ActionManager.GetActionValue('LOOK_RIGHT') - ActionManager.GetActionValue('LOOK_LEFT')) * settings.turnSpeed * dt;
        this.pitch += (ActionManager.GetActionValue('LOOK_DOWN') - ActionManager.GetActionValue('LOOK_UP')) * dt;
        let point = null;
        const input = Input.instance;
        if (input?.mouse?.buttons[2]) point = Touch.ToScreen(input.mouse.position, level.ui.Screen);
        for (const contact of input?.touch?.GetStartedTouches() ?? []) {
            const start = Touch.ToScreen(contact.startPosition, level.ui.Screen);
            if (start.x > level.ui.Screen.Width / 2 && start.y > 95 && start.y < level.ui.Screen.Height - 110 && this.touchId === null) this.touchId = contact.identifier;
        }
        const touch = input?.touch?.GetTouch(this.touchId);
        if (touch) point = Touch.ToScreen(touch.position, level.ui.Screen);
        else this.touchId = null;
        if (point && this.pointer) {
            this.yaw -= (point.x - this.pointer.x) * settings.dragSensitivity;
            this.pitch += (point.y - this.pointer.y) * settings.dragSensitivity;
        }
        this.pointer = point;
        this.pitch = Math.max(0.1, Math.min(1.2, this.pitch));
        const target = this.mode === 'chase' ? Vector3D.FromArray(level.player.mesh.transform.position).Add(new Vector3D(0, 1.2, 0)) : new Vector3D(0, 4, 0);
        const distance = this.mode === 'chase' ? settings.distance : settings.distance * 2;
        const goal = target.Add(new Vector3D(Math.sin(this.yaw) * Math.cos(this.pitch), Math.sin(this.pitch), Math.cos(this.yaw) * Math.cos(this.pitch)).MultiplyScalar(distance));
        const position = Vector3D.Lerp(Vector3D.FromArray(level.camera.position), goal, 1 - Math.exp(-4 * dt));
        level.camera.SetPosition(position.x, position.y, position.z).LookAt(target.ToArray());
        level.camera.fov = MathExt.Lerp(level.camera.fov, 55, 1 - Math.exp(-4 * dt));
    }
}
