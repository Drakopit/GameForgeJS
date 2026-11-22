import { SceneDocument } from 'gameforgejs/core';

/**
 * Reads the arena from scenes/arena.gfscene.json: the `arena` node is the
 * floor (its edges bound the fighters, its top is the ground line) and each start
 * mark's centre X is where that fighter starts a round.
 * @param {Object} document - Parsed scene JSON.
 * @returns {{arena: {left: number, right: number, groundY: number, floorTop: number, floorHeight: number}, playerOneX: number, playerTwoX: number}}
 */
export function ArenaFromScene(document) {
    const scene = new SceneDocument(document);
    const { x, y, width, height } = scene.Rect(scene.Node('arena'));
    return {
        arena: { left: x, right: x + width, groundY: y, floorTop: y, floorHeight: height },
        playerOneX: scene.Center(scene.Node('player_one'))[0],
        playerTwoX: scene.Center(scene.Node('player_two'))[0],
    };
}
