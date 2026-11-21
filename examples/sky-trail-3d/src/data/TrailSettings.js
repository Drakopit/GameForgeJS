// Seconds and response rates used by movement; course manifests may override them.
export const MovementDefaults = Object.freeze({
    jumpBufferSeconds: 0.12,
    coyoteSeconds: 0.1,
    braking: 28,
    stopThreshold: 0.01,
    facingThreshold: 0.06,
});

export const MenuSettings = Object.freeze({
    width: 960,
    height: 540,
    directionThreshold: 0.45,
    initialRepeatSeconds: 0.35,
    repeatSeconds: 0.14,
    targetX: -5,
    orbitX: 8,
    orbitHeight: 14,
    orbitDistance: 22,
    orbitSpeed: 0.12,
    orbitAmplitude: 1.5,
});

export const RunRules = Object.freeze({ fallPenalty: 5, finishBonus: 100 });

export const ScenerySettings = Object.freeze({
    rockSegments: { widthSegments: 7, heightSegments: 4 },
    rockDrop: 0.55,
    rockScale: { x: 0.45, y: 1, z: 0.43 },
    railInset: 0.1,
    railLift: 0.015,
    railScale: { x: 0.07, y: 0.025, z: 0.85 },
    cloudSegments: { widthSegments: 10, heightSegments: 6 },
    cloudCount: 8,
    cloudColor: '#d9eafa',
    cloudLeft: -11,
    cloudRight: 12,
    cloudHeight: -3,
    cloudStartZ: 4,
    cloudSpacing: 4,
    cloudVariation: 3,
    cloudScale: { x: 3, y: 0.7, z: 1.7 },
});
