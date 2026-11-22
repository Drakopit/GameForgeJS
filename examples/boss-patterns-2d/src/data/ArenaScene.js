import { SceneDocument } from 'gameforgejs/core';

/**
 * Adds the arena size and start anchors from scenes/arena.gfscene.json
 * to the scenario rules. The scene world is the arena; each anchor is the
 * centre of its marker.
 * @param {Object} scenario - config/scenario.json (combat tuning).
 * @param {Object} document - Parsed scene JSON.
 * @returns {Object} Scenario with `arena.width/height` and `anchors`.
 */
export function ScenarioWithArena(scenario, document) {
    const scene = new SceneDocument(document);
    const anchors = {};
    for (const node of scene.Nodes({ layer: 'anchors' })) {
        const [x, y] = scene.Center(node);
        anchors[node.id] = { x, y };
    }
    const { width, height } = scene.settings.world;
    return { ...scenario, arena: { width, height, ...scenario.arena }, anchors };
}
