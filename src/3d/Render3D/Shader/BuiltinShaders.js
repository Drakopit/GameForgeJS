import { STANDARD_FRAGMENT_SHADER, STANDARD_VERTEX_SHADER } from './StandardShader.js';
import { UNLIT_FRAGMENT_SHADER, UNLIT_VERTEX_SHADER } from './UnlitShader.js';
import { SHADOW_FRAGMENT_SHADER, SHADOW_VERTEX_SHADER } from './ShadowShader.js';
import { CELESTIAL_FRAGMENT_SHADER, CELESTIAL_VERTEX_SHADER } from './CelestialShader.js';
import { SKYBOX_FRAGMENT_SHADER, SKYBOX_VERTEX_SHADER } from './SkyboxShader.js';

/**
 * The renderer's built-in GLSL ES 3.00 programs, by name.
 *
 * A project replaces any of them with its own GLSL files: list the file in
 * resources.json "shaders" as `<name>_vs` or `<name>_fs`, conventionally under
 * the project's `shader/` folder (e.g. `{ "name": "standard_fs", "path":
 * "../shader/Standard.fs.glsl" }`). `WebGL3DRenderer` compiles the project file
 * instead of the built-in one. The GameForgeJS Editor's Shader view starts a
 * project copy from these sources.
 */
export const BuiltinShaders = Object.freeze({
    standard: Object.freeze({ vertex: STANDARD_VERTEX_SHADER, fragment: STANDARD_FRAGMENT_SHADER }),
    unlit: Object.freeze({ vertex: UNLIT_VERTEX_SHADER, fragment: UNLIT_FRAGMENT_SHADER }),
    celestial: Object.freeze({ vertex: CELESTIAL_VERTEX_SHADER, fragment: CELESTIAL_FRAGMENT_SHADER }),
    skybox: Object.freeze({ vertex: SKYBOX_VERTEX_SHADER, fragment: SKYBOX_FRAGMENT_SHADER }),
    shadow: Object.freeze({ vertex: SHADOW_VERTEX_SHADER, fragment: SHADOW_FRAGMENT_SHADER }),
});
