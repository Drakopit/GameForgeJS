import { SceneDocument } from 'gameforgejs/core';

/**
 * Reads a Sky Trail course from its scene file (assets/Scenes/sky-trail/*.gfscene.json).
 *
 * Gameplay settings are plain `settings`; everything placed in the world is a node:
 * platforms, coins (children of their platform, so their position is the offset),
 * the player spawn, the goal (its ring and light are children), pole, flag and lights.
 * Coin size comes from the `coin` prefab.
 * @param {Object} document - Parsed scene JSON.
 * @returns {Object} Course document in the shape `LoadSkyTrailCourse` reads.
 */
export function CourseDocumentFromScene(document) {
    const scene = new SceneDocument(document);
    const { backgroundColor, camera = {}, player = {}, coins = {}, goal = {}, ...settings } = scene.settings;
    const node = id => scene.Node(id);
    const light = id => {
        const { type, ...values } = scene.Component(node(id), 'Light');
        return values;
    };
    const playerNode = node('player');
    const ring = node('goal_ring');
    const part = id => ({ ...scene.Component(node(id), 'GoalPart'), position: scene.WorldPosition(node(id)), scale: [...node(id).transform.scale] });
    return {
        ...settings,
        name: scene.name,
        backgroundColor,
        camera,
        platforms: scene.Nodes({ layer: 'platforms' }).map(platform => ({
            id: platform.id,
            ...scene.Component(platform, 'Platform'),
            position: scene.WorldPosition(platform),
            size: [...platform.transform.scale],
            color: scene.Component(platform, 'Material').albedoColor,
        })),
        coins: {
            ...coins,
            radius: scene.prefabs.coin?.components?.Mesh?.radius,
            items: scene.Nodes({ layer: 'coins' }).map(coin => ({ platformId: coin.parent, offset: scene.LocalPosition(coin), ...scene.Component(coin, 'Coin') })),
        },
        player: { ...player, spawn: scene.WorldPosition(playerNode), scale: playerNode.transform.scale[0] },
        goal: {
            ...goal,
            trigger: scene.WorldPosition(node('goal')),
            ring: { innerRadius: scene.Component(ring, 'Mesh').innerRadius, outerRadius: scene.Component(ring, 'Mesh').outerRadius, offset: scene.LocalPosition(ring) },
            pole: part('goal_pole'),
            flag: part('goal_flag'),
        },
        lighting: {
            ambient: light('light_ambient'),
            hemisphere: light('light_sky'),
            sun: light('light_sun'),
            goalLight: { ...light('light_goal'), offset: scene.LocalPosition(node('light_goal')) },
        },
    };
}
