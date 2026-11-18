export const WarpSettings = Object.freeze({
    radius: 1.15, heightTolerance: 0.9, cooldownSeconds: 1.2,
    ringSegments: 48, ringThickness: 0.12, ringHeight: 0.08,
    pillarHeight: 2.5, pulseSpeed: 2.4, pulseAmount: 0.08,
    noticeSeconds: 3,
});

// Paired pads are on dry ground. Arrival is locked until the player leaves the pad.
export const WarpPoints = [
    { id: 'courtyard', name: 'Courtyard gate', position: [-4.5, 0, 3.5], destination: 'azure', color: '#63f5e6' },
    { id: 'azure', name: 'Azure Lake', position: [-6, 0, -12], destination: 'courtyard', color: '#63f5e6' },
    { id: 'forest', name: 'Forest gate', position: [4, 0, -10], destination: 'moonwater', color: '#c7a1ff' },
    { id: 'moonwater', name: 'Moonwater Lake', position: [6, 0, -31], destination: 'forest', color: '#c7a1ff' },
];
