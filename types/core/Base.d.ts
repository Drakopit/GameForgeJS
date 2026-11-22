/**
 * Standardized Lifecycle Contract for GameForgeJS
 *
 * This is the single source of truth for object/component lifecycles.
 * Both GameObject (via inheritance) and Components should follow this contract.
 *
 * Lifecycle Order (typical):
 *   1. Constructor
 *   2. OnAttach (Components only)
 *   3. OnStart
 *   4. OnUpdate / OnFixedUpdate (loop)
 *   5. OnDrawn / OnGUI
 *   6. OnDestroy / OnDetach
 */
export class Base {
    Next: boolean;
    Back: boolean;
    /**
     * Called when the object is first initialized (Level start or object creation).
     * Use for one-time setup.
     */
    OnStart(): void;
    /**
     * Called every frame.
     * @param {number} deltaTime - Time since last frame in seconds
     */
    OnUpdate(deltaTime: number): void;
    /**
     * Called at a fixed timestep (default 60 times per second).
     * Use for physics, deterministic logic, etc.
     * @param {number} fixedDeltaTime
     */
    OnFixedUpdate(fixedDeltaTime: number): void;
    /**
     * Called during the render phase.
     * Prefer putting drawing logic here instead of OnUpdate.
     */
    OnDrawn(): void;
    /**
     * Called for UI / HUD drawing (after main scene drawing).
     */
    OnGUI(): void;
    /**
     * Called when the object is being destroyed / removed.
     * Use for cleanup (removing listeners, stopping sounds, etc).
     */
    OnDestroy(): void;
    /** @deprecated Use OnCollisionEnter / OnCollisionStay instead when available */
    OnCollision(other: any): void;
}
