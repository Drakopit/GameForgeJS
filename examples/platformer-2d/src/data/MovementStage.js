// Tile coordinates describe solid rectangles; all other coordinates use pixels.
export const MovementStage = {
    title: '1 / 2 — Across the gaps',
    last: false,
    tileSize: 32,
    columns: 60,
    rows: 17,
    spawn: { x: 64, y: 400 },
    goal: { x: 1840, y: 402 },
    coins: [
        { x: 160, y: 452 },
        { x: 688, y: 388 },
        { x: 1008, y: 388 },
        { x: 1712, y: 452 },
    ],
    terrain: [
        { x: 0, y: 15, width: 13, height: 2 },
        { x: 16, y: 15, width: 22, height: 2 },
        { x: 41, y: 15, width: 19, height: 2 },
        { x: 6, y: 13, width: 4, height: 1 },
        { x: 19, y: 13, width: 4, height: 1 },
        { x: 29, y: 13, width: 4, height: 1 },
        { x: 46, y: 13, width: 4, height: 1 },
    ],
};
