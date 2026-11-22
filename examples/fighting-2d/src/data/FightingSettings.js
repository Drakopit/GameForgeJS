export const ScreenSettings = Object.freeze({ width: 960, height: 540 });
// Arena bounds and start positions live in scenes/arena.gfscene.json.
export const RoundSettings = Object.freeze({ startDelay: 0.9, endDelay: 2.1, maxTime: 99, winsToMatch: 2, continueDelay: 1.2 });
export const FighterSettings = Object.freeze({
    scale: 2.75, maxHp: 100, walkSpeed: 230, jumpStrength: -560, gravity: 1450,
    airControl: 0.78, friction: 0.72, pushRadius: 35, hurtWidth: 45, hurtHeight: 116,
    dashSeconds: 0.18, doubleTapSeconds: 0.24, dashMultiplier: 2.1,
    footTolerance: 0.5, crossupHeight: 74,
});
export const CombatSettings = Object.freeze({
    maxMeter: 100, startingMeter: 50, passiveMeterPerSecond: 2,
    inputBufferSeconds: 0.24, comboSeconds: 0.7, specialCooldown: 0.85,
    chipRatio: 0.18, blockPush: 0.35, blockStun: 0.18, blockHitStop: 0.025,
    blockedMeter: 7, hurtMeter: 5, invulnerabilitySeconds: 0.055,
    healthTrailSpeed: 40, projectilePoolSize: 6, maxProjectiles: 8,
    noticeSeconds: 0.8, maxDelta: 0.05,
});
export const CpuSettings = Object.freeze({
    reactionMin: 0.13, reactionSpread: 0.1, meleeDistance: 82,
    powerMinDistance: 185, powerMaxDistance: 650, projectileDanger: 240,
    guardDistance: 145, punishDistance: 110,
    jumpChance: 0.35, blockChance: 0.58, superChance: 0.18, powerChance: 0.65,
    closeGuardChance: 0.18, lightChance: 0.72,
});
