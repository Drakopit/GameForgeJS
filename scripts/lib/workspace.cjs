/**
 * Reads game.workspace.json in either schema: v1 (levels2D / scenes3D) or
 * v2 (one "scenes" list with "dimension"), and returns both arrays.
 */
function workspaceScenes(workspace = {}) {
    const scenes = Array.isArray(workspace.scenes) ? workspace.scenes : [];
    return {
        levels2D: [...(workspace.levels2D ?? []), ...scenes.filter(scene => (scene.dimension ?? '2d') === '2d')],
        scenes3D: [...(workspace.scenes3D ?? []), ...scenes.filter(scene => scene.dimension === '3d')],
    };
}

module.exports = { workspaceScenes };
