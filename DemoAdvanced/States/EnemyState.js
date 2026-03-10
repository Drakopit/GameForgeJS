export class EnemyState {
    constructor(enemy) { this.enemy = enemy; }
    Enter() {} Update(dt) {} Exit() {}
}

export class EnemyIdleState extends EnemyState {
    Enter() { this.enemy.animator.Play("Idle"); }
    Update(dt) {
        // Se o player chegar perto, começa a correr atrás
        if (this.enemy.player && Math.abs(this.enemy.position.x - this.enemy.player.position.x) < 200) {
            this.enemy.ChangeState(new EnemyRunState(this.enemy));
        }
    }
}

export class EnemyRunState extends EnemyState {
    Enter() { this.enemy.animator.Play("Run"); }
    Update(dt) {
        let dist = this.enemy.position.x - this.enemy.player.position.x;
        
        // Se ficou muito longe, desiste e volta pro Idle
        if (Math.abs(dist) > 200) {
            this.enemy.ChangeState(new EnemyIdleState(this.enemy));
            return;
        }

        // Persegue o Player
        if (dist > 5) {
            this.enemy.position.x -= this.enemy.speed * dt;
            this.enemy.facingRight = false;
        } else if (dist < -5) {
            this.enemy.position.x += this.enemy.speed * dt;
            this.enemy.facingRight = true;
        }
    }
}

export class EnemyHitState extends EnemyState {
    Enter() { 
        this.enemy.animator.Play("Hit"); 
        this.enemy.isTakingDamage = true;
    }
    Update(dt) {
        this.enemy.position.x += this.enemy.knockbackSpeed * dt;
        // Morre ao tocar no chão
        if (this.enemy.isGrounded && this.enemy.vy >= 0) {
            this.enemy.active = false; 
        }
    }
}