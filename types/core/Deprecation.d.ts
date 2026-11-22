/**
 * Reports use of compatibility APIs once per deprecated identifier.
 *
 * This keeps legacy projects running while guiding new games toward the
 * maintained GameForgeJS API.
 */
export class Deprecation {
    static warnings: Set<any>;
    /**
     * Writes one browser warning for a deprecated API.
     * @param {string} apiName - Deprecated public identifier.
     * @param {string} [replacement=""] - Preferred replacement API.
     * @returns {void}
     */
    static WarnOnce(apiName: string, replacement?: string): void;
}
