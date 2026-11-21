import { GameObject, Draw } from 'gameforgejs/2d';
import { StateMachine } from 'gameforgejs/addons/state-machine';
import { PatrolState } from '../states/PatrolState.js';
import { RestState } from '../states/RestState.js';

export class PatrolActor extends GameObject {
    constructor(screen, spawn = { x: 300, y: 326 }, patrol = { left: 140, right: 620, speed: 100 }) {
        super();
        this.position.x = spawn.x;
        this.position.y = spawn.y;
        this.patrol = patrol;
        this.direction = 1;
        this.draw = new Draw(screen);
        this.machine = new StateMachine(this);
        this.states = {
            patrol: new PatrolState(this),
            rest: new RestState(this),
        };
    }
    OnStart() {
        super.OnStart();
        this.machine.ChangeState(this.states.patrol);
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
