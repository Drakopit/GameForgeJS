/** Base state for owner-driven behavior. Subclass and override the three hooks. */
export class State {
    constructor(owner: any);
    owner: any;
    isFinished: boolean;
    locked: boolean;
    Enter(): void;
    Update(dt: any): void;
    Exit(): void;
}
/** State controller driven by its owner. Never creates a loop or browser service. */
export class StateMachine {
    constructor(owner: any);
    owner: any;
    currentState: any;
    transitioning: boolean;
    ChangeState(next: any, { force }?: {
        force?: boolean;
    }): boolean;
    Update(dt: any): void;
    ClearCurrent(): void;
    /** Exit even a locked state; repeated clearing is harmless. */
    Clear(): void;
    Dispose(): void;
}
