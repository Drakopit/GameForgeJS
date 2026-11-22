import { SceneDocument } from 'gameforgejs/core';

/**
 * Adds the world size and the courier route from scenes/crossing.gfscene.json
 * to the scenario rules. Waypoints are the centres of the waypoint markers, in order.
 * @param {Object} scenario - config/scenario.json (timing and beats).
 * @param {Object} document - Parsed scene JSON.
 * @returns {Object} Scenario with `world` and `waypoints`.
 */
export function ScenarioWithRoute(scenario, document) {
    const scene = new SceneDocument(document);
    return {
        ...scenario,
        world: { ...scene.settings.world },
        waypoints: scene.Nodes({ layer: 'waypoints' }).map(node => {
            const [x, y] = scene.Center(node);
            return { x, y };
        }),
    };
}
