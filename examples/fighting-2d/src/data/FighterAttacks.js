export const FighterAttacks = Object.freeze({
    light: { damage: 7, duration: 0.28, activeStart: 0.09, activeEnd: 0.18,
        range: 66, height: 44, yOffset: -88, knockback: 90, hitStun: 0.29,
        hitStop: 0.04, shake: 3, meterGain: 9, lunge: 35, chainIndex: 0, chainFromFrame: 2 },
    heavy: { damage: 12, duration: 0.44, activeStart: 0.14, activeEnd: 0.27,
        range: 86, height: 52, yOffset: -92, knockback: 160, hitStun: 0.37,
        hitStop: 0.065, shake: 5, meterGain: 13, lunge: 55, chainIndex: 1, chainFromFrame: 3 },
    special: { damage: 13, duration: 0.48, activeStart: 0.18, activeEnd: 0.24,
        projectile: true, speed: 470, radius: 16, lifetime: 1.8, rank: 1,
        knockback: 210, hitStun: 0.32, hitStop: 0.06, shake: 5, meterGain: 8,
        chainIndex: 2, chainFromFrame: 3 },
    super: { damage: 29, duration: 0.78, activeStart: 0.3, activeEnd: 0.38,
        projectile: true, speed: 640, radius: 30, lifetime: 1.6, rank: 2,
        knockback: 330, hitStun: 0.48, hitStop: 0.1, shake: 8, meterGain: 0, meterCost: 50 },
});
export const AttackChain = Object.freeze(['light', 'heavy', 'special'].map(name => ({
    animation: name, chainFromFrame: FighterAttacks[name].chainFromFrame,
})));
