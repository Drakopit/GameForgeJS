export const expedition = { seats: 1, classes: [], stage: null };

export const classes = [
    { name: 'Vanguard', asset: 'blue_warrior_idle', frame: { width: 192, height: 192, frames: 8 }, detail: '36 HP / 3 move / Cleave', skill: 'cleave', stats: { hp: 36, attack: 12, defense: 5, moveRange: 3, attackRange: 1 } },
    { name: 'Arcanist', asset: 'blue_monk_idle', runAsset: 'blue_monk_run', frame: { width: 192, height: 192, frames: 6 }, runFrame: { width: 192, height: 192, frames: 4 }, detail: '23 HP / 3 move / Cross magic', skill: 'magic', stats: { hp: 23, attack: 9, defense: 2, moveRange: 3, attackRange: 2 } },
    { name: 'Scout', asset: 'blue_archer_idle', runAsset: 'blue_archer_run', frame: { width: 192, height: 192, frames: 6 }, runFrame: { width: 192, height: 192, frames: 4 }, detail: '27 HP / 5 move / Ranged strike', skill: 'attack', stats: { hp: 27, attack: 10, defense: 3, moveRange: 5, attackRange: 3 } },
];

export const stages = [
    { name: 'Cliffside', detail: 'A broken central ridge with two flanks', blocked: null },
    { name: 'Stone Gate', detail: 'One central opening and lanes at the edges', blocked: ['5,1', '5,2', '5,4', '5,5'] },
    { name: 'Twin Crossing', detail: 'Two staggered ridges with wide outer lanes', blocked: ['3,2', '3,3', '3,4', '6,2', '6,3', '6,4'] },
];
