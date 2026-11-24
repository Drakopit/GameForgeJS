/**
 * Base class for all Components in GameForgeJS.
 * Follows the standardized lifecycle defined in Base.js.
 */
export class Component {
    constructor({ enabled }?: {
        enabled?: boolean;
    });
    owner: any;
    enabled: boolean;
    /**
     * Called when this component is attached to a GameObject.
     * Override this instead of putting attach logic in the constructor.
     * @param {object} owner
     */
    OnAttach(owner: object): void;
    /**
     * Called when this component is removed from its owner.
     */
    OnDetach(): void;
    OnStart(): void;
    OnUpdate(deltaTime: any): void;
    OnFixedUpdate(fixedDeltaTime: any): void;
    OnDrawn(): void;
    OnDestroy(): void;
    Attach(owner: any): this;
    Detach(): void;
}
/**
 * Stores 2D position, rotation and scale and can mirror them onto its owner.
 */
export class TransformComponent extends Component {
    constructor({ x, y, rotation, scaleX, scaleY, syncOwner, parent, renderTransform, inheritScale, }?: {
        x?: any;
        y?: any;
        rotation?: number;
        scaleX?: number;
        scaleY?: number;
        syncOwner?: boolean;
        parent?: any;
        renderTransform?: boolean;
        inheritScale?: boolean;
    });
    set x(value: any);
    get x(): any;
    _x: any;
    set y(value: any);
    get y(): any;
    _y: any;
    rotation: number;
    scaleX: number;
    scaleY: number;
    syncOwner: boolean;
    renderTransform: boolean;
    /** False: the parent's scale spaces this node but never deforms it (no squash/shear). */
    inheritScale: boolean;
    hasInitialPosition: boolean;
    OnAttach(owner: any): void;
    SetPosition(x: any, y: any): this;
    Translate(dx: any, dy: any): this;
    /** Links the local transform to another 2D transform. */
    SetParent(parent?: any): this;
    parent: any;
    GetMatrix(): any;
    /** Adapts legacy drawing at owner.x/y to this node's local transform. */
    DrawWithTransform(context: any, draw: any): void;
    CopyFromOwner(): this;
    ApplyToOwner(): this;
}
/**
 * Applies velocity, gravity and friction to an owner's 2D position.
 */
export class VelocityComponent extends Component {
    constructor({ vx, vy, gravity, friction, maxSpeedX, maxSpeedY, useFixedUpdate, }?: {
        vx?: number;
        vy?: number;
        gravity?: number;
        friction?: number;
        maxSpeedX?: number;
        maxSpeedY?: number;
        useFixedUpdate?: boolean;
    });
    vx: number;
    vy: number;
    gravity: number;
    friction: number;
    maxSpeedX: number;
    maxSpeedY: number;
    useFixedUpdate: boolean;
    SetVelocity(vx: any, vy: any): this;
    AddImpulse(ix: any, iy: any): this;
    _integrate(dt: any): void;
}
/**
 * Supplies a reusable AABB for collision tests and pointer selection.
 */
export class BoundsComponent extends Component {
    constructor({ width, height, offsetX, offsetY, solid, syncOwnerSize, }?: {
        width?: any;
        height?: any;
        offsetX?: number;
        offsetY?: number;
        solid?: boolean;
        syncOwnerSize?: boolean;
    });
    width: any;
    height: any;
    offsetX: number;
    offsetY: number;
    solid: boolean;
    syncOwnerSize: boolean;
    hasInitialSize: boolean;
    OnAttach(owner: any): void;
    GetAABB(): {
        x: any;
        y: any;
        width: any;
        height: any;
    };
    ContainsPoint(x: any, y: any): boolean;
    Intersects(other: any): boolean;
}
/**
 * Tracks hit points, invulnerability time and owner damage/death callbacks.
 */
export class HealthComponent extends Component {
    constructor({ hp, maxHp, invulnerability }?: {
        hp?: number;
        maxHp?: any;
        invulnerability?: number;
    });
    maxHp: any;
    hp: number;
    invulnerability: number;
    invulnerabilityTimer: number;
    alive: boolean;
    Damage(amount: any, source?: any): number;
    Heal(amount: any): number;
    Reset(hp?: any): void;
    IsAlive(): boolean;
}
/**
 * Disables or removes short-lived owner objects after an elapsed duration.
 */
export class LifetimeComponent extends Component {
    /** @param {{duration?: number, mode?: 'disable'|'destroy', onExpire?: ((owner: object, component: LifetimeComponent) => void) | null}} [options] */
    constructor({ duration, mode, onExpire }?: {
        duration?: number;
        mode?: "disable" | "destroy";
        onExpire?: ((owner: object, component: LifetimeComponent) => void) | null;
    });
    duration: number;
    remaining: number;
    mode: "disable" | "destroy";
    onExpire: (owner: object, component: LifetimeComponent) => void;
    expired: boolean;
    Reset(duration?: number): void;
    Expire(): void;
}
/**
 * Exposes configured `ActionManager` values to a composed game entity.
 */
export class ActionInputComponent extends Component {
    constructor({ actions }?: {
        actions?: {};
    });
    actions: {};
    Map(alias: any, actionName: any): this;
    IsDown(aliasOrActionName: any): any;
    IsHeld(aliasOrActionName: any): any;
}
