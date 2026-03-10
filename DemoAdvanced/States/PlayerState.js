import { ActionManager } from "../../Input/ActionManager.js";

// Classe Base
export class PlayerState {
    constructor(player) { this.player = player; }
    Enter() {} Update(dt) {} Exit() {}
}

// ==========================================
// ESTADO: PARADO
// ==========================================
export class IdleState extends PlayerState {
    Enter() {
        this.player.animator.Play("Idle");
    }

    Update(dt) {
        // Se saiu de uma plataforma sem pular, entra no estado de pulo para tocar a animação
        if (!this.player.isGrounded && this.player.vy > 0) {
            this.player.ChangeState(new JumpState(this.player));
            return;
        }

        if (ActionManager.IsActionDown("ATTACK")) {
            this.player.ChangeState(new AttackState(this.player));
            return; 
        }

        if (this.player.IsMovingInput()) {
            this.player.ChangeState(new RunState(this.player));
            return;
        }

        if (this.player.IsJumpInput()) {
            this.player.DoJump();
            this.player.ChangeState(new JumpState(this.player));
        }
    }
}

// ==========================================
// ESTADO: CORRENDO
// ==========================================
export class RunState extends PlayerState {
    Enter() {
        this.player.animator.Play("Run");
    }

    Update(dt) {
        if (!this.player.isGrounded && this.player.vy > 0) {
            this.player.ChangeState(new JumpState(this.player));
            return;
        }

        if (ActionManager.IsActionDown("ATTACK")) {
            this.player.ChangeState(new AttackState(this.player));
            return;
        }

        if (!this.player.IsMovingInput()) {
            this.player.ChangeState(new IdleState(this.player));
            return;
        }

        if (this.player.IsJumpInput()) {
            this.player.DoJump();
            this.player.ChangeState(new JumpState(this.player));
        }

        this.player.ApplyMovement(dt);
    }
}

// ==========================================
// ESTADO: NO AR (PULO / QUEDA)
// ==========================================
export class JumpState extends PlayerState {
    Enter() {
        this.player.animator.Play("Jump");
    }

    Update(dt) {
        // Permite controlar o boneco no ar
        this.player.ApplyMovement(dt); 

        // Condição de saída: Bateu no chão
        if (this.player.isGrounded && this.player.vy >= 0) {
            if (this.player.IsMovingInput()) {
                this.player.ChangeState(new RunState(this.player));
            } else {
                this.player.ChangeState(new IdleState(this.player));
            }
        }
    }
}

// ==========================================
// ESTADO: ATACANDO (Attack_1)
// ==========================================
export class AttackState extends PlayerState {
    Enter() {
        this.player.animator.Play("Attack_1");
        this.player.isAttacking = true;
        // Zera a velocidade X para o personagem não deslizar no chão enquanto ataca
        // this.player.vy = 0; // Opcional: Descomente se quiser que ele trave no ar ao atacar pulando
    }

    Update(dt) {
        let index = this.player.sprite.index;

        // --- FRAME DATA DA NOVA ANIMAÇÃO ---
        // Se a animação tem 6 frames (0 a 5), a espada geralmente acerta entre o 2 e o 4
        if (index >= 2 && index <= 4) {
            this.player.attackHitBox.active = true;
            this.player.attackHitBox.Update();
        } else {
            this.player.attackHitBox.active = false;
        }

        // Fim da animação
        if (index >= this.player.sprite.frameCount - 1) {
            this.player.ChangeState(new IdleState(this.player));
        }
    }

    Exit() {
        // Segurança vital
        this.player.isAttacking = false;
        this.player.attackHitBox.active = false;
    }
}