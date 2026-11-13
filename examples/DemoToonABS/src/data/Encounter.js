export const Encounter = {
    player: { hp: 5, speed: 4, invulnerability: 0.65 },
    sentry: { hp: 3, spawn: [0, 0.55, -1.5], invulnerability: 0.35 },
    playerAttack: { windup: 0.15, active: 0.12, recovery: 0.28, reach: 1.7, halfWidth: 0.65 },
    sentryAttack: { windup: 0.65, active: 0.15, recovery: 1.0, reach: 1.8, halfWidth: 0.65 },
    knockback: { speed: 5, duration: 0.18 },
};
