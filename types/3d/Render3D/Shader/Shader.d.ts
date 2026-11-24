/**
 * Compiled WebGL shader program wrapper with cached uniform locations.
 *
 * Games generally select a material instead of instantiating shaders directly.
 *
 * @param {WebGL2RenderingContext} gl - Active renderer context.
 * @param {string} vertexSource - GLSL vertex shader source.
 * @param {string} fragmentSource - GLSL fragment shader source.
 * @param {string} [label="Shader"] - Error-reporting label.
 */
export class Shader {
    constructor(gl: any, vertexSource: any, fragmentSource: any, label?: string);
    gl: any;
    label: string;
    program: any;
    uniforms: Map<any, any>;
    /**
     * Binds this program for subsequent draw calls.
     * @returns {void}
     */
    Use(): void;
    /**
     * Obtains and caches a named uniform location.
     * @param {string} name - GLSL uniform name.
     * @returns {WebGLUniformLocation|null} Located uniform.
     */
    GetUniform(name: string): WebGLUniformLocation | null;
    /**
     * Active uniforms of the linked program: name (without "[0]") → { type, size }.
     * @returns {Map<string, {type: number, size: number}>}
     */
    GetActiveUniforms(): Map<string, {
        type: number;
        size: number;
    }>;
    activeUniforms: Map<any, any>;
    /**
     * Sets a numeric or boolean uniform with the setter its GLSL type needs: a vec3 takes the first
     * three numbers of a longer array, a vec4 given three gets alpha 1, an int or bool takes any number.
     * Samplers are bound by the renderer, not here.
     * @param {string} name - Uniform name.
     * @param {number|boolean|number[]|Float32Array} value - Value.
     * @returns {boolean} False when the program has no such active (non-sampler) uniform.
     */
    SetUniform(name: string, value: number | boolean | number[] | Float32Array): boolean;
    /** True when the uniform is an active sampler2D. */
    IsSampler2D(name: any): boolean;
    Dispose(): void;
    #private;
}
