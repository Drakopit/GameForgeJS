import { SceneDocument } from 'gameforgejs/core';

/**
 * Reads the courtyard from scenes/courtyard.gfscene.json. Every world
 * element is its own node:
 * - solids and paths: boxes (scale = size);
 * - water: lakes (plane width/depth/subdivisions = surface size and segments,
 *   Material colour, Water = waves and banks; defaults in the `pond` prefab);
 * - scenery: forest props (model prefab, uniform scale, optional Collider.size);
 * - player: spawn, character model and scale; sentries: model from the `sentry`
 *   prefab, area from Enemy.area;
 * - warp points (Warp.destination pairs them) and lights.
 * @param {Object} document - Parsed scene JSON.
 * @returns {{courtyard: Object, lakes: Object[], scenery: Object[], characters: {player: string, enemy: string, scale: number}, warpPoints: Object[], lights: Object[]}}
 */
export function CourtyardFromScene(document) {
    const scene = new SceneDocument(document);
    const { bounds, camera, areas = [] } = scene.settings;
    const box = node => ({ position: scene.WorldPosition(node), size: [...node.transform.scale] });
    const sentries = scene.Nodes({ layer: 'enemies' });
    const player = scene.Node('player');
    return {
        courtyard: {
            bounds,
            spawn: scene.WorldPosition(player),
            camera,
            areas: areas.map(area => ({
                ...area,
                enemies: sentries.filter(node => scene.Component(node, 'Enemy').area === area.name).map(node => scene.WorldPosition(node)),
            })),
            solids: scene.Nodes({ layer: 'solids' }).map(node => ({ ...box(node), color: scene.Component(node, 'Material').albedoColor })),
            paths: scene.Nodes({ layer: 'paths' }).map(box),
        },
        lakes: scene.Nodes({ layer: 'water' }).map(node => {
            const mesh = scene.Component(node, 'Mesh');
            return {
                ...scene.Component(node, 'Water'),
                name: node.name,
                position: scene.WorldPosition(node),
                width: mesh.width,
                depth: mesh.depth,
                segments: mesh.subdivisions,
                color: scene.Component(node, 'Material').albedoColor,
            };
        }),
        scenery: scene.Nodes({ layer: 'scenery' }).map(node => {
            const collider = scene.Component(node, 'Collider', null);
            return {
                model: scene.Component(node, 'Data').model,
                position: scene.WorldPosition(node),
                scale: node.transform.scale[0],
                ...(collider ? { collider: [...collider.size] } : {}),
            };
        }),
        characters: {
            player: scene.Component(player, 'Data').model,
            enemy: scene.prefabs.sentry?.components?.Data?.model,
            scale: player.transform.scale[0],
        },
        warpPoints: scene.Nodes({ layer: 'warps' }).map(node => {
            const { id, ...warp } = scene.Component(node, 'Warp');
            return { id, name: node.name, position: scene.WorldPosition(node), ...warp };
        }),
        lights: scene.Lights(),
    };
}
