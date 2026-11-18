import { Vector3D } from 'gameforgejs/core';
import { CameraSettings } from '../data/PresentationSettings.js';
export class ExplorationCamera {
    constructor(camera, player, bounds) {
        this.camera = camera;
        this.player = player;
        this.bounds = bounds;
    }

    Follow() {
        const position = Vector3D.FromArray(this.player.transform.position);
        const x = Math.max(-CameraSettings.lateralLimit, Math.min(CameraSettings.lateralLimit, position.x * CameraSettings.lateralFollow));
        const z = Math.max(this.bounds.minZ + CameraSettings.endMargin, Math.min(0, position.z - CameraSettings.spawnOffset));
        this.camera.SetPosition(x, CameraSettings.height, z + CameraSettings.distance);
        this.camera.LookAt([x, 0, z]);
    }
}
