// @ts-check
/**
 * Guard lifecycle-owned resources when a scene is accessed before OnStart.
 * @template T @param {T | undefined} value @param {string} name @returns {T}
 */
export function RequireResource(value, name) {
    if (value === undefined) throw new Error(`Foundry ${name} is only available after OnStart.`);
    return value;
}
