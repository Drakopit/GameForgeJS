/**
 * Expands `#include <name>` lines with chunks of the shared GLSL library (`ShaderLibrary`).
 *
 * Each chunk is inserted once per program, at its first include (later includes of the same
 * chunk become empty lines), so chunks can include their own dependencies. Sources without
 * includes are returned unchanged.
 *
 * @param {string} source - GLSL source that may contain `#include <gf_…>` lines.
 * @param {Object<string,string>} [library=ShaderLibrary] - Chunk name → GLSL.
 * @returns {string} Self-contained GLSL.
 * @throws {Error} For an unknown chunk or an include cycle.
 */
export function ResolveShaderIncludes(source: string, library?: {
    [x: string]: string;
}): string;
/** True when the source still has `#include` lines to expand. */
export function HasShaderIncludes(source: any): boolean;
