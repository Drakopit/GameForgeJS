/**
 * World position of a target, or null when it has none.
 * @param {any} target
 * @returns {number[]|null}
 */
export function TargetPosition(target: any): number[] | null;
/**
 * Property access for animation: `Get` / `Set` of position, rotation, scale, color, opacity (or
 * any field by name) and `PlayClip` (the target's sprite or skeletal animator).
 * A target that already has Get / Set is returned as it is.
 * @param {any} target
 * @returns {{Get: (property: string) => any, Set: (property: string, value: any) => void, PlayClip: (name: string) => void}|null}
 */
export function BindTarget(target: any): {
    Get: (property: string) => any;
    Set: (property: string, value: any) => void;
    PlayClip: (name: string) => void;
} | null;
