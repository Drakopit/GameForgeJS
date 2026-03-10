import { ActionManager } from "../../Input/ActionManager.js";
import { Input } from "../../Input/Input.js";

export class PlayerState {
    constructor(player) {
        this.player = player;
    }
    Enter() {} 
    Update(dt) {} 
    Exit() {} 
}

export class IdleState extends PlayerState {
    Enter() {
        this.player.animator.Play("Idle");
    }

    Update(dt) {
        // Se saiu do chão sem pular (ex: andou para fora da plataforma), cai!
        if (!this.player.isGrounded && this.player.vy > 0) {
            this.player.ChangeState(new FallState(this.player));
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
        }
    }
}

export class RunState extends PlayerState {
    Enter() {
        this.player.animator.Play("Run");
    }

    Update(dt) {
        // Se saiu do chão sem pular, cai!
        if (!this.player.isGrounded && this.player.vy > 0) {
            this.player.ChangeState(new FallState(this.player));
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
        }

        this.player.ApplyMovement(dt);
    }
}

// NOVO ESTADO: SUBINDO (JUMP)
export class JumpState extends PlayerState {
    Enter() {
        this.player.animator.Play("JumpStart");
    }

    Update(dt) {
        this.player.ApplyMovement(dt); // Permite controlar o personagem no ar

        if (ActionManager.IsActionDown("ATTACK")) {
            this.player.ChangeState(new AttackState(this.player));
            return;
        }

        // Se a velocidade Y ficou positiva, a gravidade venceu e ele começou a cair
        if (this.player.vy >= 0) {
            this.player.ChangeState(new FallState(this.player));
        }
    }
}

// NOVO ESTADO: CAINDO (FALL)
export class FallState extends PlayerState {
    Enter() {
        this.player.animator.Play("JumpEnd");
    }

    Update(dt) {
        this.player.ApplyMovement(dt); // Permite controlar o personagem no ar

        if (ActionManager.IsActionDown("ATTACK")) {
            this.player.ChangeState(new AttackState(this.player));
            return;
        }

        // Se tocou no chão de novo
        if (this.player.isGrounded) {
            // Volta a correr ou ficar parado dependendo do teclado
            if (this.player.IsMovingInput()) {
                this.player.ChangeState(new RunState(this.player));
            } else {
                this.player.ChangeState(new IdleState(this.player));
            }
        }
    }
}

export class AttackState extends PlayerState {
    Enter() {
        this.player.animator.Play("Attack");
        this.player.isAttacking = true;
    }

    Update(dt) {
        let index = this.player.sprite.index;

        if (index >= 4 && index <= 6) {
            this.player.attackHitBox.active = true;
            this.player.attackHitBox.Update();
        } else {
            this.player.attackHitBox.active = false;
        }

        if (index >= this.player.sprite.frameCount - 1) {
            this.player.ChangeState(new IdleState(this.player));
        }
    }

    Exit() {
        this.player.isAttacking = false;
        this.player.attackHitBox.active = false;
    }
}