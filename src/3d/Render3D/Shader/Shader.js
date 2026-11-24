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
    constructor(gl, vertexSource, fragmentSource, label = "Shader") {
        this.gl = gl;
        this.label = label;
        this.program = this.#createProgram(vertexSource, fragmentSource);
        this.uniforms = new Map();
    }

    /**
     * Binds this program for subsequent draw calls.
     * @returns {void}
     */
    Use() {
        this.gl.useProgram(this.program);
    }

    /**
     * Obtains and caches a named uniform location.
     * @param {string} name - GLSL uniform name.
     * @returns {WebGLUniformLocation|null} Located uniform.
     */
    GetUniform(name) {
        if (!this.uniforms.has(name)) {
            this.uniforms.set(name, this.gl.getUniformLocation(this.program, name));
        }
        return this.uniforms.get(name);
    }

    /**
     * Active uniforms of the linked program: name (without "[0]") → { type, size }.
     * @returns {Map<string, {type: number, size: number}>}
     */
    GetActiveUniforms() {
        if (this.activeUniforms) return this.activeUniforms;
        const gl = this.gl;
        this.activeUniforms = new Map();
        const count = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS) ?? 0;
        for (let index = 0; index < count; index++) {
            const info = gl.getActiveUniform(this.program, index);
            if (info) this.activeUniforms.set(info.name.replace(/\[0\]$/, ""), { type: info.type, size: info.size });
        }
        return this.activeUniforms;
    }

    /**
     * Sets a numeric or boolean uniform with the setter its GLSL type needs: a vec3 takes the first
     * three numbers of a longer array, a vec4 given three gets alpha 1, an int or bool takes any number.
     * Samplers are bound by the renderer, not here.
     * @param {string} name - Uniform name.
     * @param {number|boolean|number[]|Float32Array} value - Value.
     * @returns {boolean} False when the program has no such active (non-sampler) uniform.
     */
    SetUniform(name, value) {
        const gl = this.gl;
        const info = this.GetActiveUniforms().get(name);
        const location = info && this.GetUniform(info.size > 1 ? `${name}[0]` : name);
        if (!location) return false;
        const numbers = typeof value === "number" || typeof value === "boolean" ? [Number(value)] : Array.from(value ?? [], Number);
        const take = count => (numbers.length >= count ? numbers.slice(0, count)
            : [...numbers, ...new Array(count - numbers.length).fill(count === 4 && numbers.length === 3 ? 1 : 0)]);
        const array = info.size > 1;
        switch (info.type) {
            case gl.FLOAT: array ? gl.uniform1fv(location, numbers) : gl.uniform1f(location, numbers[0] ?? 0); break;
            case gl.FLOAT_VEC2: gl.uniform2fv(location, array ? numbers : take(2)); break;
            case gl.FLOAT_VEC3: gl.uniform3fv(location, array ? numbers : take(3)); break;
            case gl.FLOAT_VEC4: gl.uniform4fv(location, array ? numbers : take(4)); break;
            case gl.INT: case gl.BOOL: array ? gl.uniform1iv(location, numbers.map(Math.trunc)) : gl.uniform1i(location, Math.trunc(numbers[0] ?? 0)); break;
            case gl.INT_VEC2: case gl.BOOL_VEC2: gl.uniform2iv(location, take(2).map(Math.trunc)); break;
            case gl.INT_VEC3: case gl.BOOL_VEC3: gl.uniform3iv(location, take(3).map(Math.trunc)); break;
            case gl.INT_VEC4: case gl.BOOL_VEC4: gl.uniform4iv(location, take(4).map(Math.trunc)); break;
            case gl.FLOAT_MAT3: gl.uniformMatrix3fv(location, false, take(9)); break;
            case gl.FLOAT_MAT4: gl.uniformMatrix4fv(location, false, take(16)); break;
            default: return false;
        }
        return true;
    }

    /** True when the uniform is an active sampler2D. */
    IsSampler2D(name) {
        return this.GetActiveUniforms().get(name)?.type === this.gl.SAMPLER_2D;
    }

    Dispose() {
        if (this.program) this.gl.deleteProgram(this.program);
        this.program = null;
    }

    #createProgram(vertexSource, fragmentSource) {
        const gl = this.gl;
        const vertex = this.#compile(gl.VERTEX_SHADER, vertexSource);
        let fragment;
        try { fragment = this.#compile(gl.FRAGMENT_SHADER, fragmentSource); }
        catch (error) { gl.deleteShader(vertex); throw error; }
        const program = gl.createProgram();

        gl.attachShader(program, vertex);
        gl.attachShader(program, fragment);
        gl.linkProgram(program);
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error(`${this.label}: program link failed: ${info}`);
        }

        return program;
    }

    #compile(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`${this.label}: shader compile failed: ${info}`);
        }

        return shader;
    }
}
