import { SceneDocument } from 'gameforgejs/core';
import { MapScale } from './BattleRules.js';

/**
 * Reads the battlefield from its gameforgejs.scene document
 * (scenes/battlefield.gfscene.json) into `{ heights, units }`.
 * Tiles: column/row come from the X/Z position, height from scale Y
 * (`base + h * elevation`). Units: tile from position, facing from rotation Y
 * (`-facing * 90deg`), colour from their Material.
 * @param {Object} document - Parsed scene JSON from the resource manifest.
 * @returns {{heights: (number|null)[][], units: Object[]}}
 */
export function BattleFromScene(document) {
    const scene = new SceneDocument(document);
    const { cols, rows } = scene.settings.grid;
    const { tile, base, elevation } = MapScale;
    const cell = ([x, , z]) => ({
        col: Math.max(0, Math.min(cols - 1, Math.round(x / tile + (cols - 1) / 2))),
        row: Math.max(0, Math.min(rows - 1, Math.round(z / tile + (rows - 1) / 2))),
    });
    const heights = Array.from({ length: rows }, () => Array(cols).fill(null));
    for (const node of scene.Nodes({ layer: 'tiles' })) {
        const { col, row } = cell(scene.WorldPosition(node));
        const top = node.transform?.scale?.[1] ?? base;
        heights[row][col] = Math.max(0, Math.round((top - base) / elevation));
    }
    const units = scene.Nodes({ layer: 'units' }).map(node => {
        const { team, ...stats } = scene.Component(node, 'Unit');
        const turns = Math.round(-(node.transform?.rotation?.[1] ?? 0) / (Math.PI / 2));
        return {
            id: node.id,
            name: node.name ?? node.id,
            team,
            ...cell(scene.WorldPosition(node)),
            facing: ((turns % 4) + 4) % 4,
            ...stats,
            color: scene.Component(node, 'Material').albedoColor,
        };
    });
    return { heights, units };
}
