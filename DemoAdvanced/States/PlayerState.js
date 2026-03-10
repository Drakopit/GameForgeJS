import { ActionManager } from "../../Input/ActionManager.js";

// Classe Base
export class PlayerState {
    constructor(player) { this.player = player; }
    Enter() { } Update(dt) { } Exit() { }
}

// ==========================================
// ESTADO: PARADO
// ==========================================
export class IdleState extends PlayerState {
    Enter() {
        this.player.animator.Play("Idle");
    }

    Update(dt) {

        if (!this.player.isGrounded && this.player.vy > 0) {
            this.player.stateMachine.ChangeState(new JumpState(this.player));
            return;
        }

        if (ActionManager.IsActionDown("ATTACK")) {
            this.player.stateMachine.ChangeState(new AttackState(this.player));
            return;
        }

        if (this.player.IsMovingInput()) {
            this.player.stateMachine.ChangeState(new RunState(this.player));
            return;
        }

        if (this.player.IsJumpInput()) {
            this.player.DoJump();
            this.player.stateMachine.ChangeState(new JumpState(this.player));
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
            this.player.stateMachine.ChangeState(new JumpState(this.player));
            return;
        }

        if (ActionManager.IsActionDown("ATTACK")) {
            this.player.stateMachine.ChangeState(new AttackState(this.player));
            return;
        }

        if (!this.player.IsMovingInput()) {
            this.player.stateMachine.ChangeState(new IdleState(this.player));
            return;
        }

        if (this.player.IsJumpInput()) {
            this.player.DoJump();
            this.player.stateMachine.ChangeState(new JumpState(this.player));
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

        this.player.ApplyMovement(dt);

        if (this.player.isGrounded && this.player.vy >= 0) {

            if (this.player.IsMovingInput()) {
                this.player.stateMachine.ChangeState(new RunState(this.player));
            }
            else {
                this.player.stateMachine.ChangeState(new IdleState(this.player));
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

        // Fim da animação
        if (index >= this.player.sprite.frameCount - 1) {
            this.player.stateMachine.ChangeState(new IdleState(this.player));
        }
    }

    Exit() {
        // Segurança vital
        this.player.isAttacking = false;
        this.player.attackHitBox.active = false;
    }
}