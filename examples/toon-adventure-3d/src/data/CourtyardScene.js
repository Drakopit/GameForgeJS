import { SceneDocument } from 'gameforgejs/core';

/**
 * Reads the courtyard from config/scenes/courtyard.gfscene.json: solids and
 * paths are boxes (scale = size), the player node is the spawn, sentries belong
 * to the area named in their Enemy component, and warp points pair through
 * Warp.destination. Lights come from the Light3D nodes.
 * @param {Object} document - Parsed scene JSON.
 * @returns {{courtyard: Object, warpPoints: Object[], lights: Object[]}}
 */
export function CourtyardFromScene(document) {
    const scene = new SceneDocument(document);
    const { bounds, camera, areas = [] } = scene.settings;
    const box = node => ({ position: scene.WorldPosition(node), size: [...node.transform.scale] });
    const sentries = scene.Nodes({ layer: 'enemies' });
    return {
        courtyard: {
            bounds,
            spawn: scene.WorldPosition(scene.Node('player')),
            camera,
            areas: areas.map(area => ({
                ...area,
                enemies: sentries.filter(node => scene.Component(node, 'Enemy').area === area.name).map(node => scene.WorldPosition(node)),
            })),
            solids: scene.Nodes({ layer: 'solids' }).map(node => ({ ...box(node), color: scene.Component(node, 'Material').albedoColor })),
            paths: scene.Nodes({ layer: 'paths' }).map(box),
        },
        warpPoints: scene.Nodes({ layer: 'warps' }).map(node => {
            const { id, ...warp } = scene.Component(node, 'Warp');
            return { id, name: node.name, position: scene.WorldPosition(node), ...warp };
        }),
        lights: scene.Lights(),
    };
}
