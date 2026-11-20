import { PuzzleConfig } from '../data/puzzleConfig.js';
/** Presentation changes cell pixels; board rules always use row/column coordinates. */
export class PuzzleLayout {
    static Apply(screen, boards, touch) {
        const reserve = touch ? (screen.Width < 650 ? 228 : 78) : 72;
        const cell = Math.max(8, Math.min(32, (screen.Width / 2 - 40) / PuzzleConfig.COLS, (screen.Height - 150 - reserve) / PuzzleConfig.ROWS));
        const y = 130 + (screen.Height - 130 - reserve - cell * PuzzleConfig.ROWS) / 2;
        boards.forEach((board, index) => { board.cellSize = cell; board.x = index ? screen.Width - 16 - cell * PuzzleConfig.COLS : 16; board.y = y; });
    }
}
