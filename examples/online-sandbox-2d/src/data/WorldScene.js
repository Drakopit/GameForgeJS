import { SceneDocument } from 'gameforgejs/core';

/**
 * Adds the world layout from config/scenes/world.gfscene.json to the simulation
 * rules (config/world.rules.json). The .NET server applies the same mapping
 * (servers/online-sandbox/Simulation/WorldScene.cs), so both sides agree:
 * platforms snap to tiles (x, y, length = width / tileSize), crystals and the
 * beacon are their marker centres, and the spawn is the player's top-left corner.
 * @param {Object} rules - config/world.rules.json.
 * @param {Object} document - Parsed scene JSON.
 * @returns {Object} Rules with `platforms`, `crystals`, `spawnX`, `spawnY` and `beacon`.
 */
export function RulesWithWorld(rules, document) {
    const scene = new SceneDocument(document);
    const size = rules.tileSize;
    const spawn = scene.Node('spawn');
    const beacon = scene.Node('beacon');
    const [spawnX, spawnY] = spawn ? scene.WorldPosition(spawn) : [0, 0];
    const [beaconX, beaconY] = beacon ? scene.Center(beacon) : [0, 0];
    return {
        ...rules,
        spawnX,
        spawnY,
        beacon: { x: beaconX, y: beaconY },
        platforms: scene.Nodes({ layer: 'platforms' }).map(node => {
            const { x, y, width } = scene.Rect(node);
            return { x: Math.round(x / size), y: Math.round(y / size), length: Math.max(1, Math.round(width / size)), ...scene.Component(node, 'Platform') };
        }),
        crystals: scene.Nodes({ layer: 'crystals' }).map(node => {
            const [x, y] = scene.Center(node);
            return { ...scene.Component(node, 'Crystal'), x, y };
        }),
    };
}
