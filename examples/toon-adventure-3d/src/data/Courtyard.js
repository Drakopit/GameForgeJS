export const Courtyard = {
    bounds: { minX: -7, maxX: 7, minZ: -27, maxZ: 5 },
    spawn: [0, 0.55, 3.5],
    camera: { position: [0, 13, 14], target: [0, 0, 0], fov: 48 },
    sunlight: { direction: [-0.7, -1, -0.4], intensity: 0.9 },
    areas: [
        { name: 'Courtyard', minZ: -5, enemies: [[0, 0.55, -1.5]] },
        { name: 'Forest trail', minZ: -16, enemies: [[-1.5, 0.55, -9], [2, 0.55, -13]] },
        { name: 'Old grove', minZ: -27, enemies: [[-2, 0.55, -21], [2, 0.55, -23]] },
    ],
    solids: [
        { position: [0, -0.3, -11], size: [14, 0.6, 32], color: '#799a74' },
        { position: [-7, 0.5, -11], size: [0.5, 1, 32], color: '#8babb1' },
        { position: [7, 0.5, -11], size: [0.5, 1, 32], color: '#8babb1' },
        { position: [0, 0.5, -27], size: [14, 1, 0.5], color: '#8babb1' },
        { position: [-2.5, 0.7, 0], size: [2, 1.4, 2], color: '#ae9bb1' },
        { position: [2.5, 0.7, -1], size: [2, 1.4, 2], color: '#ae9bb1' },
    ],
    paths: [
        { position: [0, 0.015, -2], size: [3, 0.02, 14] },
        { position: [0, 0.015, -14], size: [5, 0.02, 10] },
        { position: [0, 0.015, -22], size: [8, 0.02, 7] },
    ],
};
