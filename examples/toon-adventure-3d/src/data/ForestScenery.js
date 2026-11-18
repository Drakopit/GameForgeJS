// Positions and simplified collision volumes are authored in world units.
export const ForestScenery = [
    ...[-22, -8, 8, 22].flatMap(x => [-2, -23, -42].map(z => ({
        model: 'forest-tree', position: [x, 0.2, z], scale: 1.25, collider: [0.8, 3, 0.8],
    }))),
    ...[-20, -10, 10, 20].map(x => ({ model: 'forest-rock', position: [x, 0, -42], scale: 2 })),
    { model: 'forest-tree', position: [-5, 0.2, -3], scale: 1, collider: [0.7, 3, 0.7] },
    { model: 'forest-tree', position: [5, 0.2, -4], scale: 1.1, collider: [0.7, 3, 0.7] },
    { model: 'forest-tree', position: [-4.5, 0.2, -9], scale: 1.2, collider: [0.8, 3, 0.8] },
    { model: 'forest-tree', position: [5, 0.2, -12], scale: 1, collider: [0.7, 3, 0.7] },
    { model: 'forest-tree', position: [-5, 0.2, -17], scale: 1.1, collider: [0.7, 3, 0.7] },
    { model: 'forest-tree', position: [5, 0.2, -20], scale: 1.2, collider: [0.8, 3, 0.8] },
    { model: 'forest-tree', position: [-4.5, 0.2, -25], scale: 1.1, collider: [0.7, 3, 0.7] },
    { model: 'forest-rock', position: [3.8, 0, -7], scale: 3, collider: [1.5, 2, 1.5] },
    { model: 'forest-rock', position: [-3.8, 0, -14], scale: 3, collider: [1.5, 2, 1.5] },
    { model: 'forest-rock', position: [3.8, 0, -25], scale: 2.5, collider: [1.2, 2, 1.2] },
    { model: 'forest-bush', position: [3.5, 0, -5], scale: 4 },
    { model: 'forest-bush', position: [-3, 0, -6], scale: 3 },
    { model: 'forest-bush', position: [4, 0, -16], scale: 4 },
    { model: 'forest-bush', position: [-4, 0, -23], scale: 4 },
];
