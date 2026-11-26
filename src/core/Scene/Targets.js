// @ts-check
/**
 * The runtime object a system acts on (its `target`), whatever built it: a 3D scene node
 * (`{ root, meshes, model }` from SceneManifest3D), a Mesh, a Transform3D, a 2D game object
 * (`x` / `y`), a `[x, y, z]` array or a function returning one. Code-first and scene-built
 * systems take the same targets.
 */

/** @param {any} target */
function transformOf(target) {
    if (!target || typeof target !== "object") return null;
    if (typeof target.GetMatrix === "function") return target;
    return transformOf(target.root ?? target.transform ?? target.meshes?.[0] ?? null);
}

/**
 * World position of a target, or null when it has none.
 * @param {any} target
 * @returns {number[]|null}
 */
export function TargetPosition(target) {
    if (target == null) return null;
    if (typeof target === "function") return TargetPosition(target());
    if (Array.isArray(target)) return [target[0] ?? 0, target[1] ?? 0, target[2] ?? 0];
    const transform = transformOf(target);
    if (transform) {
        const matrix = transform.GetMatrix();
        return [matrix[12], matrix[13], matrix[14]];
    }
    if (typeof target.x === "number") return [target.x, target.y ?? 0, target.z ?? 0];
    if (target.position && typeof target.position.x === "number") return [target.position.x, target.position.y ?? 0, target.position.z ?? 0];
    return null;
}

/**
 * Property access for animation: `Get` / `Set` of position, rotation, scale, color, opacity (or
 * any field by name) and `PlayClip` (the target's sprite or skeletal animator).
 * A target that already has Get / Set is returned as it is.
 * @param {any} target
 * @returns {{Get: (property: string) => any, Set: (property: string, value: any) => void, PlayClip: (name: string) => void}|null}
 */
export function BindTarget(target) {
    if (!target) return null;
    if (typeof target.Get === "function" && typeof target.Set === "function") return target;
    const transform = transformOf(target);
    const meshes = target.meshes ?? (target.material ? [target] : []);
    const animator = target.model?.animator ?? target.animator ?? target.skeletal ?? null;
    const object = transform ?? target;
    const materials = () => meshes.map(mesh => mesh.material).filter(Boolean);
    return {
        Get(property) {
            if (transform && property === "rotation") return [transform.rotation.x, transform.rotation.y, transform.rotation.z];
            if (transform && (property === "position" || property === "scale")) return [...transform[property]];
            if (property === "color") return materials()[0]?.albedoColor ?? target.color;
            return target[property];
        },
        Set(property, value) {
            if (transform) {
                if (property === "position") return transform.SetPosition(value[0], value[1], value[2]);
                if (property === "rotation") return transform.SetRotation(value[0], value[1], value[2]);
                if (property === "scale") return transform.SetScale(value[0], value[1], value[2]);
            }
            if (property === "color" || property === "opacity") {
                const list = materials();
                if (list.length) {
                    for (const material of list) {
                        if (!material.albedoColor) continue;
                        if (property === "color") material.albedoColor = [...value];
                        else material.albedoColor[3] = value;
                        if ((property === "opacity" ? value : value[3]) < 1) material.transparent = true;
                    }
                    return;
                }
                if (property === "opacity") { target.alpha = value; target.opacity = value; return; }
            }
            if (!transform && property === "position" && "x" in object) { object.x = value[0]; object.y = value[1]; return; }
            if (!transform && property === "rotation" && Array.isArray(value)) { object.rotation = value[2] ?? value[0]; return; }
            object[property] = Array.isArray(value) ? [...value] : value;
        },
        PlayClip(name) {
            animator?.Play?.(name);
        },
    };
}
