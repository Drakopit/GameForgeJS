import { SceneDocument } from 'gameforgejs/core';

/**
 * Reads the tactical map from scenes/tactical-map.gfscene.json into the
 * stage, player and enemy documents the battle uses. The `tilemap` node holds
 * the TileMap component; the `player` node's position is its spawn.
 * @param {Object} document - Parsed scene JSON.
 * @returns {{stage: Object, player: Object, enemies: Object}}
 */
export function TacticalFromScene(document) {
    const scene = new SceneDocument(document);
    const { parallax = {}, ...settings } = scene.settings;
    const { id: _id, x, y, col, row, ...player } = scene.Item(scene.Node('player'));
    return {
        stage: {
            id: scene.data.id,
            name: scene.name,
            ...settings,
            tilemap: scene.Component(scene.Node('tilemap'), 'TileMap'),
            platforms: scene.Items('platforms'),
            objects: scene.Items('objects'),
            parallax: { ...parallax, layers: scene.Items('parallax') },
        },
        player: { player: { ...player, spawn: { col, row, x, y } } },
        enemies: { enemyDefaults: scene.PrefabItem('enemy'), enemies: scene.Items('enemies', { inherit: false }) },
    };
}
