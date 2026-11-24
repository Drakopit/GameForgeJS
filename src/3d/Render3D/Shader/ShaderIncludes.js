import { ShaderLibrary } from "./ShaderLibrary.js";

const INCLUDE = /^[ \t]*#include[ \t]*<([\w./-]+)>[ \t]*$/gm;

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
export function ResolveShaderIncludes(source, library = ShaderLibrary) {
    const text = String(source ?? "");
    if (!text.includes("#include")) return text;
    return expand(text, library, new Set(), []);
}

/** True when the source still has `#include` lines to expand. */
export function HasShaderIncludes(source) {
    INCLUDE.lastIndex = 0;
    return INCLUDE.test(String(source ?? ""));
}

function expand(text, library, included, stack) {
    return text.replace(INCLUDE, (line, name) => {
        if (stack.includes(name)) throw new Error(`Shader include cycle: ${[...stack, name].join(" → ")}`);
        if (included.has(name)) return "";
        const chunk = Object.hasOwn(library, name) ? library[name] : undefined;
        if (typeof chunk !== "string") throw new Error(`Unknown shader include <${name}>.`);
        included.add(name);
        return expand(chunk.replace(/\r\n/g, "\n").trimEnd(), library, included, [...stack, name]);
    });
}
