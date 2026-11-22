import { SceneDocument } from 'gameforgejs/core';

/**
 * Adds the spatial layout from scenes/islands.gfscene.json to the
 * scenario rules: each island node is a 1.2-thick slab centred at y = -0.6
 * (X/Z position and scale give x, z, width and depth) and the `player_spawn`
 * node is movement.spawn.
 * @param {Object} scenario - config/scenario.json.
 * @param {Object} document - Parsed scene JSON.
 * @returns {Object} Scenario with `islands` and `movement.spawn`.
 */
export function ScenarioWithIslands(scenario, document) {
    const scene = new SceneDocument(document);
    const spawn = scene.Node('player_spawn');
    return {
        ...scenario,
        movement: { ...scenario.movement, spawn: spawn ? scene.WorldPosition(spawn) : [0, 2, 0] },
        islands: scene.Nodes({ layer: 'islands' }).map(node => {
            const [x, , z] = scene.WorldPosition(node);
            const [width, , depth] = node.transform?.scale ?? [1, 1, 1];
            return { x, z, width, depth, ...scene.Component(node, 'Island') };
        }),
    };
}
