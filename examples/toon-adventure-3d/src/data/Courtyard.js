export const Courtyard = {
    bounds: { minX: -24, maxX: 24, minZ: -44, maxZ: 6 },
    spawn: [0, 0.55, 3.5],
    camera: { position: [0, 13, 14], target: [0, 0, 0], fov: 48 },
    sunlight: { direction: [-0.7, -1, -0.4], intensity: 0.9 },
    areas: [
        { name: 'Courtyard', minZ: -5, enemies: [[0, 0.55, -1.5]] },
        { name: 'Forest trail', minZ: -16, enemies: [[-1.5, 0.55, -9], [2, 0.55, -13]] },
        { name: 'Old grove', minZ: -44, enemies: [[-2, 0.55, -21], [2, 0.55, -23]] },
    ],
    solids: [
        { position: [0, -0.3, -19], size: [48, 0.6, 50], color: '#799a74' },
        { position: [-24, 0.5, -19], size: [0.5, 1, 50], color: '#8babb1' },
        { position: [24, 0.5, -19], size: [0.5, 1, 50], color: '#8babb1' },
        { position: [0, 0.5, -44], size: [48, 1, 0.5], color: '#8babb1' },
        { position: [-2.5, 0.7, 0], size: [2, 1.4, 2], color: '#ae9bb1' },
        { position: [2.5, 0.7, -1], size: [2, 1.4, 2], color: '#ae9bb1' },
    ],
    paths: [
        { position: [-4, 0.015, 2.5], size: [7, 0.02, 2] },
        { position: [-4, 0.015, -12], size: [7, 0.02, 2] },
        { position: [4, 0.015, -31], size: [7, 0.02, 2] },
        { position: [0, 0.015, -34], size: [4, 0.02, 20] },
        { position: [0, 0.015, -2], size: [3, 0.02, 14] },
        { position: [0, 0.015, -14], size: [5, 0.02, 10] },
        { position: [0, 0.015, -22], size: [8, 0.02, 7] },
    ],
};
