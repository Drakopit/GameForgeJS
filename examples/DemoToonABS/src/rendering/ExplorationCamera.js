export class ExplorationCamera {
    constructor(camera, player, bounds) {
        this.camera = camera;
        this.player = player;
        this.bounds = bounds;
    }

    Follow() {
        const position = this.player.transform.position;
        const x = Math.max(-1.5, Math.min(1.5, position[0] * 0.3));
        const z = Math.max(this.bounds.minZ + 5, Math.min(0, position[2] - 3.5));
        this.camera.SetPosition(x, 13, z + 14);
        this.camera.LookAt([x, 0, z]);
    }
}
