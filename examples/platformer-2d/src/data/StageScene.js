import { SceneDocument } from 'gameforgejs/core';

/**
 * Builds a platformer stage from its gameforgejs.scene document
 * (scenes/*.gfscene.json). Terrain nodes are pixel rectangles that the
 * tile world consumes in tile units.
 * @param {Object} document - Parsed scene JSON from the resource manifest.
 * @returns {{title: string, last: boolean, tileSize: number, columns: number, rows: number,
 *   spawn: {x: number, y: number}, goal: {x: number, y: number}, coins: {x: number, y: number}[],
 *   terrain: {x: number, y: number, width: number, height: number}[]}}
 */
export function StageFromScene(document) {
    const scene = new SceneDocument(document);
    const tile = scene.settings.tileSize;
    const point = node => {
        const [x, y] = scene.WorldPosition(node);
        return { x, y };
    };
    return {
        title: scene.name,
        last: Boolean(scene.settings.last),
        tileSize: tile,
        columns: scene.settings.columns,
        rows: scene.settings.rows,
        spawn: point(scene.Node('spawn')),
        goal: point(scene.Node('goal')),
        coins: scene.Nodes({ layer: 'coins' }).map(point),
        terrain: scene.Nodes({ layer: 'terrain' }).map(node => {
            const rect = scene.Rect(node);
            return {
                x: Math.round(rect.x / tile),
                y: Math.round(rect.y / tile),
                width: Math.max(1, Math.round(rect.width / tile)),
                height: Math.max(1, Math.round(rect.height / tile)),
            };
        }),
    };
}
