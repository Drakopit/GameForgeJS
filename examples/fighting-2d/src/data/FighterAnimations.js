export const FrameSize = Object.freeze({ width: 64, height: 64, feetY: 54 });
// Authored occupied cells in the supplied sheets. KO/hurt no longer end on blank cells.
export const FighterAnimations = Object.freeze({
    idle: { row: 0, column: 0, count: 6, fps: 9, loop: true },
    walk: { row: 0, column: 6, count: 6, fps: 12, loop: true },
    jump: { row: 1, column: 0, count: 2, fps: 8, loop: false },
    guard: { row: 0, column: 12, count: 1, fps: 8, loop: true },
    light: { row: 2, column: 0, count: 5, fps: 20, loop: false },
    heavy: { row: 2, column: 6, count: 6, fps: 16, loop: false },
    special: { row: 4, column: 9, count: 4, fps: 12, loop: false },
    super: { row: 5, column: 0, count: 3, fps: 9, loop: false },
    hurt: { row: 3, column: 0, count: 2, fps: 12, loop: false },
    ko: { row: 3, column: 7, count: 1, fps: 8, loop: false, feetY: 59 },
    victory: { row: 5, column: 0, count: 3, fps: 8, loop: true },
});
