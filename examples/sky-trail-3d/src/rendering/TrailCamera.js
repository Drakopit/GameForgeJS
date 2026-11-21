import { ActionManager, Vector3D } from 'gameforgejs/core';

export class TrailCamera {
    constructor(camera, player, config) {
        this.camera = camera;
        this.player = player;
        this.config = config;
        this.cameraYaw = 0;
        this.cameraReady = false;
        this.cameraTarget = new Vector3D();
    }

    Update(dt) {
        if (!this.camera || !this.player.model) return;

        const followConfig = this.config;
        const cameraTurn = ActionManager.GetActionValue("CAMERA_RIGHT")
            - ActionManager.GetActionValue("CAMERA_LEFT");
        this.cameraYaw += cameraTurn * followConfig.turnSpeed * dt;

        const desiredTarget = Vector3D.FromArray(this.player.model.transform.position)
            .AddValue(followConfig.targetOffset);
        const follow = this.cameraReady ? 1 - Math.exp(-followConfig.smoothness * dt) : 1;
        this.cameraTarget = Vector3D.Lerp(this.cameraTarget, desiredTarget, follow);
        const orbitOffset = new Vector3D(
            Math.sin(this.cameraYaw) * followConfig.distance,
            followConfig.height,
            Math.cos(this.cameraYaw) * followConfig.distance,
        );
        const desiredPosition = this.cameraTarget.AddValue(orbitOffset);
        // Smooth the target, not the orbit angle twice: movement and view share one yaw.
        const cameraPosition = desiredPosition;

        this.camera.SetPosition(...cameraPosition.ToArray()).LookAt(this.cameraTarget.ToArray());
        this.cameraReady = true;
    }
}
