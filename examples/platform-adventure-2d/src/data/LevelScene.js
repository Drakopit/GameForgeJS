import { SceneDocument } from 'gameforgejs/core';

/**
 * Reads one level from its scene file (scenes/*.gfscene.json) into the
 * level config shape the game uses: world/victory/audio/materials from
 * `settings`, and parallax layers, platforms, objects and enemies from the
 * scene layers. Enemy defaults are the `enemy` prefab.
 * @param {Object} document - Parsed scene JSON.
 * @returns {Object} Partial level config, merged over the shared manifests.
 */
export function LevelFromScene(document) {
    const scene = new SceneDocument(document);
    const { parallax = {}, ...settings } = scene.settings;
    return {
        ...settings,
        parallax: { ...parallax, layers: scene.Items('parallax') },
        platforms: scene.Items('platforms'),
        objects: scene.Items('objects'),
        enemies: scene.Items('enemies', { inherit: false }),
        enemyDefaults: scene.PrefabItem('enemy'),
    };
}
