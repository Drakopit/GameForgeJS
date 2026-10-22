/** Base state for owner-driven behavior. Subclass and override the three hooks. */
export class State {
    constructor(owner) {
        this.owner = owner;
        this.isFinished = false;
        this.locked = false;
    }
    Enter() {}
    Update(dt) {}
    Exit() {}
}

/** State controller driven by its owner. Never creates a loop or browser service. */
export class StateMachine {
    constructor(owner) {
        this.owner = owner;
        this.currentState = null;
        this.transitioning = false;
    }
    ChangeState(next, { force = false } = {}) {
        if (this.transitioning) throw new Error('Transition from Update, not from Enter/Exit.');
        if (!next || ['Enter', 'Update', 'Exit'].some(hook => typeof next[hook] !== 'function')) {
            throw new TypeError('A state requires Enter, Update and Exit methods.');
        }
        if (this.currentState?.locked && !force) return false;
        this.transitioning = true;
        try {
            this.ClearCurrent();
            this.currentState = next;
            // A partially entered state remains available to Clear() on failure.
            next.Enter();
            return true;
        } finally { this.transitioning = false; }
    }
    Update(dt) { this.currentState?.Update(dt); }
    ClearCurrent() {
        const previous = this.currentState;
        this.currentState = null;
        previous?.Exit();
    }
    /** Exit even a locked state; repeated clearing is harmless. */
    Clear() {
        if (this.transitioning) throw new Error('Cannot clear during a state transition.');
        this.transitioning = true;
        try { this.ClearCurrent(); }
        finally { this.transitioning = false; }
    }
    Dispose() {
        try { this.Clear(); }
        finally { this.owner = null; }
    }
}
