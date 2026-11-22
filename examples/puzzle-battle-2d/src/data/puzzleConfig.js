export const PuzzleConfig = Object.freeze({
    ROWS: 12,
    COLS: 6,
    GEM_SIZE: 32,
    FALL_SPEED_NORMAL: 2.2,
    FALL_SPEED_FAST: 18.0,
    LOCK_DELAY: 500, // ms before piece locks
    COLORS: ["red", "blue", "green", "yellow"],
    GARBAGE_TIMER_TURNS: 3, // Turns a garbage piece stays as garbage before turning normal
    // Board positions live in scenes/arena.gfscene.json.
});
