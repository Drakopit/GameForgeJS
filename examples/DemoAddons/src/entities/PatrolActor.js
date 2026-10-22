import { GameObject, Draw } from 'gameforgejs/2d';
import { State, StateMachine } from 'gameforgejs/addons/state-machine';

class Patrol extends State {
    Enter() { this.owner.label = 'Patrol'; }
    Update(dt) {
        const actor = this.owner;
        actor.position.x += actor.direction * 100 * dt;
        if (actor.position.x >= 620 || actor.position.x <= 140) {
            actor.position.x = Math.max(140, Math.min(620, actor.position.x));
            actor.machine.ChangeState(new Rest(actor));
        }
    }
}

class Rest extends State {
    Enter() { this.owner.label = 'Rest'; this.remaining = 0.8; }
    Update(dt) {
        this.remaining -= dt;
        if (this.remaining <= 0) {
            this.owner.direction *= -1;
            this.owner.machine.ChangeState(new Patrol(this.owner));
        }
    }
}

export class PatrolActor extends GameObject {
    constructor(screen) {
        super();
        this.position.Set?.(300, 326);
        this.position.x = 300;
        this.position.y = 326;
        this.direction = 1;
        this.draw = new Draw(screen);
        this.machine = new StateMachine(this);
    }
    OnStart() {
        super.OnStart();
        this.machine.ChangeState(new Patrol(this));
    }
    OnUpdate(dt) {
        super.OnUpdate(dt);
        this.machine.Update(dt);
    }
    OnDrawn() {
        super.OnDrawn();
        this.draw.Color = this.label === 'Rest' ? '#f8bd66' : '#fff1bf';
        this.draw.DrawRect(this.position.x, this.position.y, 32, 34);
        this.draw.Color = '#183d42';
        this.draw.DrawRect(this.position.x + (this.direction > 0 ? 22 : 6), this.position.y + 8, 5, 5);
    }
    OnDestroy() {
        this.machine.Dispose();
        super.OnDestroy();
    }
}
