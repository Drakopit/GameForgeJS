import { PuzzleConfig } from "../data/puzzleConfig.js";
import { PuzzleGem, GemType } from "./PuzzleGem.js";

export class PuzzleBoard {
    constructor(x, y, isPlayer1 = true) {
        this.x = x;
        this.y = y;
        this.isPlayer1 = isPlayer1;
        this.grid = [];
        this.score = 0;
        this.combo = 0;
        this.gameOver = false;
        
        // Callback to notify the scene about garbage sent
        this.onSendGarbage = null;
        // Callback for visual feedback on fighter
        this.onCombo = null;

        this.initGrid();
    }

    initGrid() {
        this.grid = [];
        for (let r = 0; r < PuzzleConfig.ROWS; r++) {
            let row = [];
            for (let c = 0; c < PuzzleConfig.COLS; c++) {
                row.push(null);
            }
            this.grid.push(row);
        }
    }

    // Attempt to place a piece on the board. Returns false if blocked.
    lockPiece(piece) {
        if (this.gameOver) return false;

        if (!this.isValidPos(piece.row1, piece.col1) || !this.isValidPos(piece.row2, piece.col2)
            || (piece.row1 === piece.row2 && piece.col1 === piece.col2)) {
            this.gameOver = true;
            return false;
        }
        this.grid[piece.row1][piece.col1] = piece.gem1;
        this.grid[piece.row2][piece.col2] = piece.gem2;

        // Start processing logic (gravity -> match -> repeat)
        this.combo = 0;
        this.processBoard();
        
        // Decrease garbage timers
        this.tickGarbage();
        this.processBoard();

        return true;
    }

    tickGarbage() {
        for (let r = 0; r < PuzzleConfig.ROWS; r++) {
            for (let c = 0; c < PuzzleConfig.COLS; c++) {
                const gem = this.grid[r][c];
                if (gem && gem.type === GemType.GARBAGE) {
                    gem.timer--;
                    if (gem.timer <= 0) {
                        gem.type = GemType.NORMAL; // Turns into a normal gem (could randomize color)
                        gem.color = PuzzleConfig.COLORS[Math.floor(Math.random() * PuzzleConfig.COLORS.length)];
                    }
                }
            }
        }
    }

    receiveGarbage(amount) {
        // Drop garbage gems from the top
        for (let index = 0; index < amount; index++) {
            const c = index % PuzzleConfig.COLS;
            // Find highest empty spot
            let r = 0;
            while (r < PuzzleConfig.ROWS && this.grid[r][c] === null) {
                r++;
            }
            if (r > 0) {
                this.grid[r - 1][c] = new PuzzleGem(GemType.GARBAGE, "garbage", PuzzleConfig.GARBAGE_TIMER_TURNS);
            } else { this.gameOver=true; break; }
        }
        // Force gravity if needed
        this.applyGravity();
    }

    processBoard() {
        let changed = false;
        
        do {
            changed = false;
            if (this.applyGravity()) changed = true;
            if (this.checkMatches()) changed = true;
        } while (changed);
    }

    applyGravity() {
        const { blocks, used } = this.MergePowerGems();
        const pieces = blocks.map(block => ({ ...block }));
        for (let r = 0; r < PuzzleConfig.ROWS; r++) {
            for (let c = 0; c < PuzzleConfig.COLS; c++) {
                const gem = this.grid[r][c];
                if (gem && !used.has(gem)) pieces.push({ r, c, width: 1, height: 1 });
            }
        }
        pieces.sort((a, b) => b.r + b.height - a.r - a.height);
        let moved = false;
        let changed;
        do {
            changed = false;
            for (const piece of pieces) {
                const bottom = piece.r + piece.height;
                if (bottom >= PuzzleConfig.ROWS) continue;
                if (this.grid[bottom].slice(piece.c, piece.c + piece.width).some(Boolean)) continue;
                for (let r = bottom; r > piece.r; r--) {
                    for (let c = piece.c; c < piece.c + piece.width; c++) this.grid[r][c] = this.grid[r - 1][c];
                }
                this.grid[piece.r].fill(null, piece.c, piece.c + piece.width);
                piece.r++;
                moved = changed = true;
            }
        } while (changed);
        return moved;
    }

    MergePowerGems() {
        const blocks = [];
        const used = new Set();
        for (let r = 0; r < PuzzleConfig.ROWS - 1; r++) {
            for (let c = 0; c < PuzzleConfig.COLS - 1; c++) {
                const gem = this.grid[r][c];
                if (gem?.type !== GemType.NORMAL || used.has(gem)) continue;
                let width = PuzzleConfig.COLS - c;
                let best;
                for (let y = r; y < PuzzleConfig.ROWS; y++) {
                    let run = 0;
                    while (run < width) {
                        const cell = this.grid[y][c + run];
                        if (cell?.type !== GemType.NORMAL || cell.color !== gem.color || used.has(cell)) break;
                        run++;
                    }
                    width = run;
                    const height = y - r + 1;
                    if (width < 2) break;
                    if (height > 1 && width * height > (best?.area ?? 0))
                        best = { r, c, width, height, area: width * height, color: gem.color };
                }
                if (!best) continue;
                blocks.push(best);
                for (let y = r; y < r + best.height; y++)
                    for (let x = c; x < c + best.width; x++) used.add(this.grid[y][x]);
            }
        }
        return { blocks, used };
    }

    checkMatches() {
        let matched = false;
        let gemsToDestroy = new Set(); // Using Set to avoid duplicates (store string "r,c")

        for (let r = 0; r < PuzzleConfig.ROWS; r++) {
            for (let c = 0; c < PuzzleConfig.COLS; c++) {
                const gem = this.grid[r][c];
                if (gem && gem.type === GemType.CRASH) {
                    // Flood fill to find all connected normal gems of same color
                    let connected = this.getConnectedGems(r, c, gem.color);
                    // A crash gem destroys itself and connected normal gems
                    if (connected.length > 1) { // 1 is just the crash gem itself
                        connected.forEach(pos => gemsToDestroy.add(`${pos.r},${pos.c}`));
                        matched = true;
                    }
                }
            }
        }

        if (matched) {
            this.combo++;
            const destroyedCount = gemsToDestroy.size;
            const power = this.MergePowerGems().blocks.reduce((bonus, block) =>
                bonus + (gemsToDestroy.has([block.r, block.c].join(',')) ? Math.floor(block.area / 2) : 0), 0);
            
            gemsToDestroy.forEach(posStr => {
                const [r, c] = posStr.split(',').map(Number);
                this.grid[r][c] = null;
            });

            // Score calculation
            const points = (destroyedCount + power) * 10 * this.combo;
            this.score += points;

            // Garbage calculation (e.g. 1 garbage per 3 gems destroyed + bonus for combos)
            const garbageAmt = Math.floor(destroyedCount / 3) + power + (this.combo > 1 ? this.combo : 0);
            
            if (garbageAmt > 0) {
                if (this.onSendGarbage) this.onSendGarbage(garbageAmt);
            }
            this.onCombo?.(this.combo, garbageAmt);
        }

        return matched;
    }

    getConnectedGems(startR, startC, targetColor) {
        let connected = [];
        let visited = new Set();
        let queue = [{ r: startR, c: startC }];
        
        while (queue.length > 0) {
            const { r, c } = queue.shift();
            const key = `${r},${c}`;
            
            if (visited.has(key)) continue;
            visited.add(key);

            const gem = this.grid[r][c];
            if (!gem || gem.color !== targetColor || gem.type === GemType.GARBAGE) continue;

            // Only normal and crash gems of same color can be linked
            connected.push({ r, c });

            // Check neighbors
            if (r > 0) queue.push({ r: r - 1, c });
            if (r < PuzzleConfig.ROWS - 1) queue.push({ r: r + 1, c });
            if (c > 0) queue.push({ r, c: c - 1 });
            if (c < PuzzleConfig.COLS - 1) queue.push({ r, c: c + 1 });
        }
        
        return connected;
    }

    isValidPos(r, c) {
        return r >= 0 && r < PuzzleConfig.ROWS && c >= 0 && c < PuzzleConfig.COLS && this.grid[r][c] === null;
    }

    draw(ctx) {
        const cell=this.cellSize??this.board?.cellSize??PuzzleConfig.GEM_SIZE;
        // Draw board background
        const width = PuzzleConfig.COLS * cell;
        const height = PuzzleConfig.ROWS * cell;
        
        ctx.fillStyle = "#222222";
        ctx.fillRect(this.x, this.y, width, height);
        
        ctx.strokeStyle = this.isPlayer1 ? "#4444aa" : "#aa4444";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x - 2, this.y - 2, width + 4, height + 4);

        // Draw grid lines
        ctx.strokeStyle = "#333333";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let c = 1; c < PuzzleConfig.COLS; c++) {
            ctx.moveTo(this.x + c * cell, this.y);
            ctx.lineTo(this.x + c * cell, this.y + height);
        }
        for (let r = 1; r < PuzzleConfig.ROWS; r++) {
            ctx.moveTo(this.x, this.y + r * cell);
            ctx.lineTo(this.x + width, this.y + r * cell);
        }
        ctx.stroke();

        const { blocks, used } = this.MergePowerGems();
        // Draw gems
        for (let r = 0; r < PuzzleConfig.ROWS; r++) {
            for (let c = 0; c < PuzzleConfig.COLS; c++) {
                if (this.grid[r][c] && !used.has(this.grid[r][c])) {
                    const gx = this.x + c * cell;
                    const gy = this.y + r * cell;
                    this.grid[r][c].render(ctx, gx, gy,cell);
                }
            }
        }
        for (const block of blocks) {
            const x = this.x + block.c * cell, y = this.y + block.r * cell;
            const width = block.width * cell, height = block.height * cell;
            const shine = ctx.createLinearGradient(x, y, x + width, y + height);
            shine.addColorStop(0, '#fff');
            shine.addColorStop(0.24, block.color);
            shine.addColorStop(1, '#292139');
            ctx.fillStyle = shine;
            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, width - 4, height - 4, 7);
            ctx.fill();
            ctx.strokeStyle = '#fff9';
            ctx.stroke();
        }
    }
}
