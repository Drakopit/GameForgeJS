// Level-owned perception and steering; animation/combat remain in the existing states.
export class EnemyBrain {
    constructor(owner) {
        this.owner = owner;
        this.settings = owner.config.ai;
        this.Reset();
    }

    Reset() {
        this.mode = 'patrol';
        this.memoryRemaining = 0;
        this.lastKnownX = this.owner.spawn.x;
        this.patrolDirection = this.owner.facingRight ? 1 : -1;
        this.seesPlayer = false;
    }

    Update(dt) {
        const enemy = this.owner;
        const player = enemy.player;
        const settings = this.settings;
        this.seesPlayer = Boolean(player?.hp > 0 && this.CanSee(player));
        if (this.seesPlayer) {
            this.lastKnownX = player.position.x;
            this.memoryRemaining = settings.memorySeconds;
        } else this.memoryRemaining = Math.max(0, this.memoryRemaining - dt);

        const awayFromPost = Math.abs(enemy.position.x - enemy.spawn.x);
        if (awayFromPost > settings.leashRange) this.mode = 'return';
        else if (this.mode === 'return' && awayFromPost > settings.homeTolerance) return;
        else if (this.seesPlayer) this.mode = 'chase';
        else if (this.memoryRemaining > 0) this.mode = 'search';
        else this.mode = 'patrol';
    }

    CanSee(player) {
        const enemy = this.owner;
        const from = { x: enemy.position.x + enemy.size.x / 2, y: enemy.position.y + enemy.size.y / 2 };
        const to = { x: player.position.x + player.size.x / 2, y: player.position.y + player.size.y / 2 };
        if (Math.abs(to.x - from.x) > enemy.aggroRange || Math.abs(to.y - from.y) > this.settings.sightHeight) return false;
        return !(enemy.level?.blocks ?? []).some(block => {
            // Platforms below the eye line do not hide actors standing on them.
            const left = Math.max(Math.min(from.x, to.x), block.position.x);
            const right = Math.min(Math.max(from.x, to.x), block.position.x + block.size.x);
            if (left >= right) return false;
            const slope = (to.y - from.y) / (to.x - from.x);
            const y1 = from.y + (left - from.x) * slope;
            const y2 = from.y + (right - from.x) * slope;
            return Math.max(y1, y2) > block.position.y && Math.min(y1, y2) < block.position.y + block.size.y;
        });
    }

    Move(dt) {
        const enemy = this.owner;
        const settings = this.settings;
        let direction;
        let speed = enemy.speed;
        if (this.mode === 'patrol') {
            if (settings.patrolRadius <= 0) return false;
            if (Math.abs(enemy.position.x - enemy.spawn.x) >= settings.patrolRadius) {
                this.patrolDirection = Math.sign(enemy.spawn.x - enemy.position.x);
            }
            direction = this.patrolDirection;
            speed *= settings.patrolSpeed;
        } else {
            const targetX = this.mode === 'return' ? enemy.spawn.x : this.lastKnownX;
            const distance = targetX - enemy.position.x;
            const stoppingDistance = this.mode === 'chase' ? enemy.stopDistance : settings.homeTolerance;
            if (Math.abs(distance) <= stoppingDistance) return false;
            direction = Math.sign(distance);
        }
        if (!enemy.isGrounded) return false;
        const feetY = enemy.position.y + enemy.size.y;
        const nextX = enemy.position.x + enemy.size.x / 2 + direction * (enemy.size.x / 2 + settings.edgeLookahead);
        const supported = (enemy.level?.blocks ?? []).some(block => nextX >= block.position.x
            && nextX <= block.position.x + block.size.x && block.position.y >= feetY - settings.floorTolerance
            && block.position.y <= feetY + settings.maxDrop);
        if (!supported) {
            if (this.mode === 'patrol') this.patrolDirection *= -1;
            return false;
        }
        enemy.facingRight = direction > 0;
        const step = direction * speed * dt;
        const blocked = (enemy.level?.blocks ?? []).some(block => enemy.position.y < block.position.y + block.size.y
            && feetY > block.position.y + settings.floorTolerance
            && enemy.position.x + step < block.position.x + block.size.x
            && enemy.position.x + enemy.size.x + step > block.position.x);
        if (blocked) {
            if (this.mode === 'patrol') this.patrolDirection *= -1;
            return false;
        }
        const worldWidth = enemy.level?.GameWorld?.width ?? Infinity;
        enemy.position.x = Math.max(0, Math.min(worldWidth - enemy.size.x, enemy.position.x + step));
        return true;
    }
}
