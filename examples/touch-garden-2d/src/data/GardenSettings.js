import { SceneDocument } from 'gameforgejs/core';

/**
 * Tuning and touch-UI layout. The garden layout itself (arena, spawn,
 * obstacles, crystals) comes from scenes/garden.gfscene.json through
 * ApplyGardenScene() when the level starts.
 */
export const GardenSettings = {
    arena: { x: 24, y: 150, width: 432, height: 436 },
    spawn: { x: 226, y: 346 },
    playerSize: 28,
    speed: 170,
    dashMultiplier: 2.8,
    dashSeconds: 0.16,
    cooldownSeconds: 0.85,
    stickRadius: 58,
    stickDeadzone: 0.12,
    stickOrigin: { x: 96, y: 690 },
    action: { x: 384, y: 690, radius: 47 },
    helpButton: { x: 350, y: 27, width: 42, height: 32 },
    resetButton: { x: 400, y: 27, width: 50, height: 32 },
    obstacles: [],
    crystals: [],
};

/**
 * Copies the spatial layout of a gameforgejs.scene document into GardenSettings.
 * @param {Object} document - Parsed scene JSON from the resource manifest.
 */
export function ApplyGardenScene(document) {
    const scene = new SceneDocument(document);
    const point = node => {
        const [x, y] = scene.WorldPosition(node);
        return { x, y };
    };
    const player = scene.Node('player');
    GardenSettings.arena = scene.Rect(scene.Node('arena'));
    GardenSettings.spawn = point(player);
    GardenSettings.playerSize = scene.Size(player, [GardenSettings.playerSize])[0];
    GardenSettings.obstacles = scene.Nodes({ layer: 'obstacles' }).map(node => scene.Rect(node));
    GardenSettings.crystals = scene.Nodes({ layer: 'crystals' }).map(point);
}
