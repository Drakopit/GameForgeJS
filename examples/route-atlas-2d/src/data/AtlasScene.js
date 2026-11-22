import { SceneDocument } from 'gameforgejs/core';

/**
 * Adds the overworld from scenes/atlas.gfscene.json to the scenario
 * rules: each location is the centre of its marker and each `links` entry is
 * a route (edge) from that location.
 * @param {Object} scenario - config/scenario.json (travel and trial settings).
 * @param {Object} document - Parsed scene JSON.
 * @returns {Object} Scenario with `nodes` and `edges`.
 */
export function ScenarioWithAtlas(scenario, document) {
    const scene = new SceneDocument(document);
    const locations = scene.Nodes({ layer: 'locations' });
    return {
        ...scenario,
        nodes: locations.map(node => {
            const [x, y] = scene.Center(node);
            return { id: node.id, name: node.name ?? node.id, x, y, ...scene.Component(node, 'Location') };
        }),
        edges: locations.flatMap(node => scene.Links(node).map(target => [node.id, target.id])),
    };
}
