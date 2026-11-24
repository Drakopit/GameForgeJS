import { Mat4 } from "../../../core/Math/Mat4.js";
import { FrameStats } from "../../../core/Debug/FrameStats.js";
import { RenderQueue3D } from './RenderQueue3D.js';
import { Texture } from "../Texture/Texture.js";
import { BuiltinShaders } from "../Shader/BuiltinShaders.js";
import { Shader } from "../Shader/Shader.js";
import { ResolveShaderIncludes } from "../Shader/ShaderIncludes.js";
import { PrimitiveMesh } from "../Mesh/PrimitiveMesh.js";
import { AssetManager } from "../../../core/Assets/AssetManager.js";

const ATTRIBUTE = Object.freeze({
    position: 0,
    normal: 1,
    uv: 2,
    tangent: 3,
});

const MAX_POINT_LIGHTS = 4;
const MAX_SPOT_LIGHTS = 2;

/** Full-screen triangle for post-process shaders without their own vertex stage. */
const POST_VERTEX = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
    vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
    vUv = corner;
    gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}`;
/** Depth-only fragment stage paired with a ShaderMaterial's vertex stage in the shadow pass. */
const DEPTH_FRAGMENT = "#version 300 es\nprecision highp float;\nvoid main() {\n}";
/** Texture units free for ShaderMaterial properties (7 is the shadow map). */
const PROPERTY_UNITS = [0, 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15];

/**
 * WebGL2 renderer for `Scene3D`, including lit materials, skyboxes and shadows.
 *
 * @param {HTMLCanvasElement|Screen3D} canvasOrScreen - Destination canvas or screen wrapper.
 * @param {Object} [options] - Renderer settings.
 * @param {number[]} [options.clearColor] - Default RGBA clear color.
 * @param {boolean} [options.antialias=true] - Request browser multisampling.
 */
export class WebGL3DRenderer {
    constructor(canvasOrScreen, {
        clearColor = [0.03, 0.04, 0.07, 1],
        antialias = true,
        assets = AssetManager.instance,
    } = {}) {
        this.canvas = canvasOrScreen?.Canvas ?? canvasOrScreen;
        if (!this.canvas) {
            throw new Error("WebGL3DRenderer requires a canvas or Screen3D.");
        }

        this.gl = this.canvas.getContext("webgl2", { antialias });
        if (!this.gl) {
            throw new Error("GameForgeJS Render3D requires WebGL2.");
        }

        this.clearColor = [...clearColor];
        this.assets = assets;
        /** ShaderMaterial programs by stage sources: { shader } or { error }. */
        this.materialPrograms = new Map();
        this.subdivisionCache = new WeakMap();
        this.warnings = new Set();
        /** A ShaderMaterial of domain "post" applied to the finished frame (see SetPostProcess). */
        this.postProcess = null;
        this.renderQueue = new RenderQueue3D();
        /** Main camera pass only; shadow and skybox draws are not included. */
        this.stats = { visible: 0, culled: 0, triangles: 0 };
        this.geometryCache = new WeakMap();
        this.textureCache = new Map();
        this.shadowCache = new WeakMap();
        this.skyboxCache = new WeakMap();
        this.skyboxTextures = new Set();
        this.ownedBuffers = new Set();
        this.ownedVertexArrays = new Set();
        this.ownedTextures = new Set();
        this.ownedFramebuffers = new Set();
        this.usedTextures = new Set();
        this.lightViewProjection = Mat4.create();
        this.skyboxGeometry = PrimitiveMesh.Cube(2);

        // A project replaces any built-in shader with its own GLSL files by listing them in
        // resources.json "shaders" as <name>_vs / <name>_fs (e.g. "celestial_fs": "../shader/Celestial.fs.glsl").
        const source = name => {
            const { vertex, fragment } = BuiltinShaders[name];
            return [assets?.shaders?.[`${name}_vs`] || vertex, assets?.shaders?.[`${name}_fs`] || fragment].map(stage => ResolveShaderIncludes(stage));
        };

        try {
        this.standardShader = new Shader(this.gl, ...source("standard"), "StandardShader");
        this.unlitShader = new Shader(this.gl, ...source("unlit"), "UnlitShader");
        this.shadowShader = new Shader(this.gl, ...source("shadow"), "ShadowShader");
        this.celestialShader = new Shader(this.gl, ...source("celestial"), "CelestialShader");
        this.skyboxShader = new Shader(this.gl, ...source("skybox"), "SkyboxShader");

        this.#configureState();
        this.#createFallbackTextures();
        } catch (error) {
            this.Dispose();
            throw error;
        }
    }

    /**
     * Draws one scene from a supplied or scene-owned camera.
     * @param {Scene3D} scene - Scene to render.
     * @param {PerspectiveCamera} [camera] - Camera override.
     * @returns {void}
     */
    Render(scene, camera = scene?.camera) {
        if (this.disposed) throw new Error("Cannot render with a disposed renderer.");
        if (!scene) throw new Error("WebGL3DRenderer.Render requires a Scene3D.");
        if (!camera) throw new Error("WebGL3DRenderer.Render requires a PerspectiveCamera.");

        this.#resize();
        camera.UpdateProjection(this.canvas.width / Math.max(1, this.canvas.height));
        camera.UpdateView();

        const shadowState = this.#renderShadowPass(scene, camera);
        this.#renderReflection(scene, camera, shadowState);
        const post = this.postProcess;
        const postTarget = post ? this.#getPostTarget() : null;
        this.#beginMainPass(scene.backgroundColor ?? this.clearColor, postTarget?.framebuffer ?? null);
        this.#drawSkybox(scene.skybox, camera);

        const objects = this.renderQueue.Build(scene.GetRenderableObjects(), camera);
        this.stats = { visible: objects.length, culled: this.renderQueue.culled,
            triangles: objects.reduce((sum, mesh) => {
                const geometry = this.#meshGeometry(mesh); // subdivided when the mesh or its shader asks for it
                return sum + (geometry.indices?.length ?? geometry.vertexCount) / 3;
            }, 0) };
        FrameStats.global.Observe("meshes", objects.length, this);
        for (const mesh of objects) {
            this.#drawMesh(mesh, scene, camera, shadowState);
        }
        if (postTarget) this.#drawPostProcess(post, postTarget, camera);
    }

    /**
     * Applies a full-screen `post` ShaderMaterial to every rendered frame, or removes it (null).
     * Its fragment stage reads `uSceneColor` / `uSceneDepth` (sampler2D), `vUv`, `uResolution`,
     * `uTime`, `uCameraNear` / `uCameraFar` and its own properties, and writes `outColor`.
     * @param {ShaderMaterial|null} material
     * @returns {void}
     */
    SetPostProcess(material) {
        if (material && (material.type !== "shader" || material.domain !== "post")) {
            throw new Error('SetPostProcess needs a ShaderMaterial whose shader domain is "post".');
        }
        this.postProcess = material ?? null;
    }

    /**
     * Releases shader programs, caches and GPU-owned resources.
     * @returns {void}
     */
    Dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.standardShader?.Dispose();
        this.unlitShader?.Dispose();
        this.shadowShader?.Dispose();
        this.celestialShader?.Dispose();
        this.skyboxShader?.Dispose();
        this.materialPrograms?.forEach(entry => entry.shader?.Dispose());
        this.materialPrograms?.clear();
        this.postTarget = null;
        this.ownedBuffers.forEach(buffer => this.gl.deleteBuffer(buffer));
        this.ownedVertexArrays.forEach(vao => this.gl.deleteVertexArray(vao));
        this.ownedTextures.forEach(texture => this.gl.deleteTexture(texture));
        if (this.reflectionTarget) this.gl.deleteRenderbuffer(this.reflectionTarget.depth);
        this.ownedFramebuffers.forEach(framebuffer => this.gl.deleteFramebuffer(framebuffer));
        this.usedTextures.forEach(texture => texture.Dispose(this.gl));
        this.ownedBuffers.clear(); this.ownedVertexArrays.clear();
        this.ownedTextures.clear(); this.ownedFramebuffers.clear(); this.usedTextures.clear();
        this.skyboxTextures.clear();
        this.geometryCache = new WeakMap();
        this.textureCache.clear();
        this.shadowCache = new WeakMap();
        this.skyboxCache = new WeakMap();
        this.renderQueue.bounds = new WeakMap();
    }

    #configureState() {
        const gl = this.gl;
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CCW);
        gl.clearColor(...this.clearColor);
    }

    #createFallbackTextures() {
        this.whiteTexture = this.#createSolidTexture([255, 255, 255, 255]);
        this.normalTexture = this.#createSolidTexture([128, 128, 255, 255]);
        this.blackTexture = this.#createSolidTexture([0, 0, 0, 255]);
        this.grayTexture = this.#createSolidTexture([128, 128, 128, 255]);
        this.emptyVertexArray = this.gl.createVertexArray();
        this.ownedVertexArrays.add(this.emptyVertexArray);
    }

    #createSolidTexture(color) {
        const gl = this.gl;
        const texture = gl.createTexture();
        this.ownedTextures.add(texture);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(color));
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
    }

    #resize() {
        const displayWidth = this.canvas.clientWidth || this.canvas.width || 1;
        const displayHeight = this.canvas.clientHeight || this.canvas.height || 1;

        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }
    }

    #beginMainPass(clearColor, framebuffer = null) {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.colorMask(true, true, true, true);
        gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3] ?? 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    #renderReflection(scene, camera, shadows) {
        this.activeReflection = null;
        const elevation = scene.planarReflection?.height;
        if (!Number.isFinite(elevation) || camera.position[1] <= elevation) return;

        const gl = this.gl;
        if (!this.reflectionTarget) {
            const framebuffer = gl.createFramebuffer();
            const color = gl.createTexture();
            const depth = gl.createRenderbuffer();
            this.ownedFramebuffers.add(framebuffer);
            this.ownedTextures.add(color);
            this.reflectionTarget = { framebuffer, color, depth };
        }
        const target = this.reflectionTarget;
        const width = Math.max(1, this.canvas.width >> 1);
        const height = Math.max(1, this.canvas.height >> 1);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
        if (target.width !== width || target.height !== height) {
            gl.bindTexture(gl.TEXTURE_2D, target.color);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.color, 0);
            gl.bindRenderbuffer(gl.RENDERBUFFER, target.depth);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, width, height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, target.depth);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            Object.assign(target, { width, height });
        }
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return;

        const mirror = Mat4.create();
        mirror[5] = -1;
        mirror[13] = 2 * elevation;
        const reflected = {
            position: [camera.position[0], 2 * elevation - camera.position[1], camera.position[2]],
            projectionMatrix: camera.projectionMatrix,
            viewMatrix: Mat4.multiply(Mat4.create(), camera.viewMatrix, mirror),
        };
        gl.viewport(0, 0, width, height);
        gl.clearColor(...(scene.backgroundColor ?? this.clearColor));
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.frontFace(gl.CW);
        this.reflectionClip = elevation;
        try {
            this.#drawSkybox(scene.skybox, reflected);
            const objects = scene.GetRenderableObjects().filter(mesh =>
                !mesh.material?.planarReflection && mesh.reflect !== false && mesh.material?.type !== 'celestial');
            for (const mesh of this.renderQueue.Build(objects, reflected)) {
                this.#drawMesh(mesh, scene, reflected, shadows);
            }
        } finally {
            this.reflectionClip = undefined;
            gl.frontFace(gl.CCW);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        this.activeReflection = {
            texture: target.color,
            matrix: Mat4.multiply(Mat4.create(), reflected.projectionMatrix, reflected.viewMatrix),
        };
    }

    #drawSkybox(skybox, camera) {
        if (!skybox?.image) return;

        const texture = this.#getSkyboxTexture(skybox);
        if (!texture) return;

        const gl = this.gl;
        const geometry = this.#getGeometryState(this.skyboxGeometry);
        this.skyboxShader.Use();
        gl.bindVertexArray(geometry.vao);
        this.#setMatrix(this.skyboxShader, "uView", camera.viewMatrix);
        this.#setMatrix(this.skyboxShader, "uProjection", camera.projectionMatrix);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        this.#set1i(this.skyboxShader, "uSkybox", 0);

        gl.depthMask(false);
        gl.disable(gl.CULL_FACE);
        gl.disable(gl.BLEND);
        gl.drawElements(gl.TRIANGLES, geometry.count, geometry.indexType, 0);
        gl.enable(gl.CULL_FACE);
        gl.depthMask(true);
        gl.bindVertexArray(null);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }

    #getSkyboxTexture(skybox) {
        if (this.skyboxCache.has(skybox)) return this.skyboxCache.get(skybox);

        const image = skybox.image;
        if (!image?.width || !image?.height) return null;

        const gl = this.gl;
        const faceSize = Math.floor(Math.min(image.width / 4, image.height / 3));
        const canvas = document.createElement("canvas");
        canvas.width = faceSize;
        canvas.height = faceSize;
        const context = canvas.getContext("2d");
        if (!context) return null;

        const texture = gl.createTexture();
        this.ownedTextures.add(texture);
        const faces = [
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, col: 2, row: 1 },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, col: 0, row: 1 },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, col: 1, row: 0 },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, col: 1, row: 2 },
            { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, col: 1, row: 1 },
            { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, col: 3, row: 1 },
        ];

        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        faces.forEach(face => {
            context.clearRect(0, 0, faceSize, faceSize);
            context.drawImage(
                image,
                face.col * faceSize,
                face.row * faceSize,
                faceSize,
                faceSize,
                0,
                0,
                faceSize,
                faceSize,
            );
            gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        });
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

        this.skyboxCache.set(skybox, texture);
        this.skyboxTextures.add(texture);
        return texture;
    }

    #drawMesh(mesh, scene, camera, shadowState) {
        let material = mesh.material ?? {};
        if (material.type === "shader" && material.domain === "post") return;
        let shader = this.#getShaderForMaterial(material);
        if (!shader) {
            // The ShaderMaterial's program failed to compile (reported once): draw it magenta.
            shader = this.standardShader;
            material = { type: "standard", albedoColor: [1, 0, 1, 1], roughness: 1 };
        }
        const gl = this.gl;
        const geometry = this.#getGeometryState(this.#meshGeometry(mesh));
        const model = mesh.transform.GetMatrix(Mat4.create());

        shader.Use();
        gl.bindVertexArray(geometry.vao);

        this.#setMatrix(shader, "uModel", model);
        this.#setMatrix(shader, "uView", camera.viewMatrix);
        this.#setMatrix(shader, "uProjection", camera.projectionMatrix);
        this.#setVec3(shader, 'uFogColor', scene.fog?.color ?? [0, 0, 0]);
        this.#setVec3(shader, 'uCameraPosition', camera.position);
        this.#set1f(shader, 'uFogNear', scene.fog?.near ?? 0);
        this.#set1f(shader, 'uFogFar', scene.fog?.far ?? 0);
        this.#set1i(shader, 'uReflectionClip', this.reflectionClip === undefined ? 0 : 1);
        this.#set1f(shader, 'uReflectionClipHeight', this.reflectionClip ?? 0);
        gl.depthMask(!material.transparent && material.asset?.render.depthWrite !== false);
        const cull = material.asset?.render.cull ?? "back";
        if (cull === "none") gl.disable(gl.CULL_FACE);
        else if (cull === "front") gl.cullFace(gl.FRONT);

        if (material.transparent) {
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        } else {
            gl.disable(gl.BLEND);
        }

        if (material.type === "shader") {
            const normalMatrix = Mat4.create();
            Mat4.copy(normalMatrix, model);
            if (Mat4.invert(normalMatrix, normalMatrix)) {
                Mat4.transpose(normalMatrix, normalMatrix);
            }
            this.#setMatrix(shader, "uNormalMatrix", normalMatrix);
            this.#setMatrix(shader, "uLightViewProjection", shadowState?.matrix ?? this.lightViewProjection);
            this.#bindShaderMaterial(shader, material, mesh, scene, shadowState);
        } else if (material.type === "unlit") {
            this.#bindUnlitMaterial(shader, material);
        } else if (material.type === "celestial") {
            const normalMatrix = Mat4.create();
            Mat4.copy(normalMatrix, model);
            if (Mat4.invert(normalMatrix, normalMatrix)) {
                Mat4.transpose(normalMatrix, normalMatrix);
            }

            this.#setMatrix(shader, "uNormalMatrix", normalMatrix);
            this.#setVec3(shader, "uCameraPosition", camera.position);
            this.#bindCelestialMaterial(shader, material, scene);
        } else {
            const normalMatrix = Mat4.create();
            Mat4.copy(normalMatrix, model);
            if (Mat4.invert(normalMatrix, normalMatrix)) {
                Mat4.transpose(normalMatrix, normalMatrix);
            }

            this.#setMatrix(shader, "uNormalMatrix", normalMatrix);
            this.#setMatrix(shader, "uLightViewProjection", shadowState?.matrix ?? this.lightViewProjection);
            this.#setVec3(shader, "uCameraPosition", camera.position);
            this.#bindStandardMaterial(shader, material, mesh, shadowState);
            this.#bindLights(shader, scene, shadowState);
        }

        if (geometry.indexed) {
            gl.drawElements(gl.TRIANGLES, geometry.count, geometry.indexType, 0);
        } else {
            gl.drawArrays(gl.TRIANGLES, 0, geometry.count);
        }

        gl.bindVertexArray(null);
        gl.depthMask(true);
        if (cull === "none") gl.enable(gl.CULL_FACE);
        else if (cull === "front") gl.cullFace(gl.BACK);
    }

    #getShaderForMaterial(material) {
        if (material.type === "shader") return this.#getMaterialProgram(material.asset, "main");
        if (material.type === "unlit") return this.unlitShader;
        if (material.type === "celestial") return this.celestialShader;
        return this.standardShader;
    }

    /**
     * The compiled program of a shader asset: "main" draws it, "shadow" pairs its vertex stage with a
     * depth-only fragment. Programs are shared by every asset with the same sources. Null when the
     * sources do not compile (logged once).
     */
    #getMaterialProgram(asset, kind) {
        const vertex = asset.vertex ?? (asset.domain === "post" ? POST_VERTEX : BuiltinShaders.standard.vertex);
        const fragment = kind === "shadow" ? DEPTH_FRAGMENT : asset.fragment;
        const key = `${vertex}\u0000${fragment}`;
        let entry = this.materialPrograms.get(key);
        if (!entry) {
            try {
                entry = { shader: new Shader(this.gl, ResolveShaderIncludes(vertex), ResolveShaderIncludes(fragment), `${asset.name} (${kind})`) };
            } catch (error) {
                entry = { error };
                console.error(`ShaderMaterial "${asset.name}": ${error.message}`);
            }
            this.materialPrograms.set(key, entry);
        }
        return entry.shader ?? null;
    }

    #bindShaderMaterial(shader, material, mesh, scene, shadowState) {
        // Surface and unlit graphs may read the lights (unlit: e.g. a toon ramp from the key light).
        if (material.domain !== "post") {
            this.#set1f(shader, "uToonBands", material.domain === "surface" ? material.toonBands ?? 0 : 0);
            this.#bindLights(shader, scene, shadowState);
            const useShadow = Boolean(shadowState?.texture && material.receiveShadow !== false && mesh.receiveShadow !== false);
            this.#set1i(shader, "uUseShadowMap", useShadow ? 1 : 0);
            this.#bindTextureObject(shader, 7, "uShadowMap", shadowState?.texture ?? this.whiteTexture);
        }
        this.#bindShaderProperties(shader, material, PROPERTY_UNITS);
    }

    /** Time, resolution and the material's property values (numbers by GLSL type, textures on free units). */
    #bindShaderProperties(shader, material, units) {
        shader.SetUniform("uTime", material.time ?? performance.now() / 1000);
        shader.SetUniform("uResolution", [this.canvas.width, this.canvas.height]);
        let unit = 0;
        for (const property of material.asset.properties) {
            const value = material.values.get(property.name);
            if (property.type !== "texture") {
                shader.SetUniform(property.name, value);
                continue;
            }
            if (!shader.IsSampler2D(property.name)) continue;
            if (unit >= units.length) {
                this.#warnOnce(`units:${material.asset.name}`, `ShaderMaterial "${material.asset.name}": more than ${units.length} textures; the rest are not bound.`);
                break;
            }
            this.#bindTextureObject(shader, units[unit++], property.name, this.#propertyTexture(value, material));
        }
    }

    #propertyTexture(value, material) {
        const builtin = { white: this.whiteTexture, black: this.blackTexture, gray: this.grayTexture, normal: this.normalTexture };
        if (value == null) return this.whiteTexture;
        if (typeof value === "string") {
            if (builtin[value]) return builtin[value];
            const image = this.assets?.images?.[value];
            if (!image) {
                this.#warnOnce(`image:${value}`, `ShaderMaterial "${material.name}": image "${value}" is not loaded; using white.`);
                return this.whiteTexture;
            }
            value = image;
        }
        if (typeof WebGLTexture !== "undefined" && value instanceof WebGLTexture) return value;
        return this.#resolveTexture(value)?.EnsureGPU(this.gl, this.whiteTexture) ?? this.whiteTexture;
    }

    #warnOnce(key, message) {
        if (this.warnings.has(key)) return;
        this.warnings.add(key);
        console.warn(message);
    }

    /** The geometry a mesh draws with: subdivided when the mesh or its shader asks for it. */
    #meshGeometry(mesh) {
        const level = mesh.subdivision ?? mesh.material?.asset?.render.subdivision ?? 0;
        if (!level) return mesh.geometry;
        let levels = this.subdivisionCache.get(mesh.geometry);
        if (!levels) this.subdivisionCache.set(mesh.geometry, levels = new Map());
        if (!levels.has(level)) levels.set(level, mesh.geometry.Subdivide(level));
        return levels.get(level);
    }

    #getPostTarget() {
        const gl = this.gl;
        const width = this.canvas.width || 1;
        const height = this.canvas.height || 1;
        if (!this.postTarget) {
            const framebuffer = gl.createFramebuffer();
            const color = gl.createTexture();
            const depth = gl.createTexture();
            this.ownedFramebuffers.add(framebuffer);
            this.ownedTextures.add(color);
            this.ownedTextures.add(depth);
            this.postTarget = { framebuffer, color, depth };
        }
        const target = this.postTarget;
        if (target.width !== width || target.height !== height) {
            gl.bindTexture(gl.TEXTURE_2D, target.color);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindTexture(gl.TEXTURE_2D, target.depth);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.color, 0);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, target.depth, 0);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            Object.assign(target, { width, height });
        }
        return target;
    }

    #drawPostProcess(material, target, camera) {
        const gl = this.gl;
        const shader = this.#getMaterialProgram(material.asset, "main");
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        if (!shader) {
            // Show the frame unprocessed when the post shader does not compile.
            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, target.framebuffer);
            gl.blitFramebuffer(0, 0, target.width, target.height, 0, 0, this.canvas.width, this.canvas.height, gl.COLOR_BUFFER_BIT, gl.NEAREST);
            gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
            return;
        }
        shader.Use();
        gl.disable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
        gl.depthMask(false);
        gl.bindVertexArray(this.emptyVertexArray);
        this.#bindTextureObject(shader, 0, "uSceneColor", target.color);
        this.#bindTextureObject(shader, 1, "uSceneDepth", target.depth);
        shader.SetUniform("uCameraNear", camera.near ?? 0.1);
        shader.SetUniform("uCameraFar", camera.far ?? 1000);
        this.#bindShaderProperties(shader, material, PROPERTY_UNITS.filter(unit => unit > 1));
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        gl.bindVertexArray(null);
        gl.depthMask(true);
        gl.enable(gl.DEPTH_TEST);
        for (const unit of [0, 1]) {
            gl.activeTexture(gl.TEXTURE0 + unit);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }

    #bindUnlitMaterial(shader, material) {
        this.#setVec4(shader, "uAlbedoColor", material.albedoColor ?? [1, 1, 1, 1]);
        this.#bindTexture(shader, 0, "uAlbedoMap", "uHasAlbedoMap", material.albedoMap, this.whiteTexture);
    }

    #bindStandardMaterial(shader, material, mesh, shadowState) {
        // Set for every draw: Standard surfaces must not inherit Toon uniforms.
        this.#set1f(shader, "uToonBands", material.type === "toon" ? material.bands : 0);
        this.#setVec4(shader, "uAlbedoColor", material.albedoColor ?? [1, 1, 1, 1]);
        this.#setVec3(shader, "uEmissiveColor", material.emissiveColor ?? [0, 0, 0]);
        this.#setVec2(shader, "uUvScale", material.uvScale ?? [1, 1]);
        this.#set1f(shader, "uNormalScale", material.normalScale ?? 1);
        this.#set1f(shader, "uHeightScale", material.heightScale ?? 0);
        this.#set1f(shader, "uRoughness", material.roughness ?? 0.72);
        this.#set1f(shader, "uMetallic", material.metallic ?? 0);
        this.#set1f(shader, 'uSurface', material.surface ?? 0);
        this.#set1f(shader, 'uSurfaceTime', material.time ?? 0);
        this.#set1f(shader, 'uSurfaceScale', material.surfaceScale ?? 1);
        this.#set1f(shader, 'uWetness', material.wetness ?? 0);
        this.#set1f(shader, 'uReflection', material.reflection ?? 0);
        this.#set1f(shader, 'uWaterDepth', material.waterDepth ?? 0);
        const planar = material.planarReflection ? this.activeReflection : null;
        this.#set1i(shader, 'uHasPlanarReflection', planar ? 1 : 0);
        if (planar) this.#setMatrix(shader, 'uPlanarMatrix', planar.matrix);
        this.#bindTextureObject(shader, 8, 'uPlanarMap', planar?.texture ?? this.blackTexture);
        this.#set1i(shader, 'uRippleCount', material.ripples?.length ?? 0);
        if (material.rippleUniforms) this.gl.uniform4fv(shader.GetUniform('uRipples[0]'),material.rippleUniforms);

        this.#bindTexture(shader, 0, "uAlbedoMap", "uHasAlbedoMap", material.albedoMap, this.whiteTexture);
        this.#bindTexture(shader, 1, "uNormalMap", "uHasNormalMap", material.normalMap, this.normalTexture);
        this.#bindTexture(shader, 2, "uRoughnessMap", "uHasRoughnessMap", material.roughnessMap, this.whiteTexture);
        this.#bindTexture(shader, 3, "uAoMap", "uHasAoMap", material.aoMap, this.whiteTexture);
        this.#bindTexture(shader, 4, "uEmissiveMap", "uHasEmissiveMap", material.emissiveMap, this.blackTexture);
        this.#bindTexture(shader, 5, "uOrmMap", "uHasOrmMap", material.ormMap, this.whiteTexture);
        this.#bindTexture(shader, 6, "uHeightMap", "uHasHeightMap", material.heightMap, this.blackTexture);

        const useShadow = Boolean(shadowState?.texture && material.receiveShadow !== false && mesh.receiveShadow !== false);
        this.#set1i(shader, "uUseShadowMap", useShadow ? 1 : 0);
        this.#bindTextureObject(shader, 7, "uShadowMap", shadowState?.texture ?? this.whiteTexture);
    }

    #bindCelestialMaterial(shader, material, scene) {
        const pointLight = scene.GetLights("point")[0];
        this.#setVec3(shader, "uLightPosition", pointLight?.position ?? [0, 0, 0]);
        this.#setVec3(shader, "uBaseColor", material.baseColor ?? [0.25, 0.46, 1.0]);
        this.#setVec3(shader, "uSecondaryColor", material.secondaryColor ?? [0.95, 0.88, 0.55]);
        this.#setVec3(shader, "uAtmosphereColor", material.atmosphereColor ?? [0.45, 0.74, 1.0]);
        this.#setVec3(shader, "uNightColor", material.nightColor ?? [0.02, 0.025, 0.06]);
        this.#setVec3(shader, "uEmissiveColor", material.emissiveColor ?? [0, 0, 0]);
        this.#set1f(shader, "uRoughness", material.roughness ?? 0.62);
        this.#set1f(shader, "uSeed", material.seed ?? 1);
        this.#set1f(shader, "uCloudStrength", material.cloudStrength ?? 0.35);
        this.#set1f(shader, "uAtmosphereStrength", material.atmosphereStrength ?? 0.55);
        this.#set1f(shader, "uEmissiveStrength", material.emissiveStrength ?? 0);
        this.#set1f(shader, "uTime", performance.now() / 1000);
        this.#bindTexture(shader, 0, "uAlbedoMap", "uHasAlbedoMap", material.albedoMap, this.whiteTexture);
    }

    #bindLights(shader, scene, shadowState) {
        const ambient = scene.GetLights("ambient")[0];
        const hemisphere = scene.GetLights("hemisphere")[0];
        const directional = scene.GetLights("directional")[0];
        const points = scene.GetLights("point").slice(0, MAX_POINT_LIGHTS);
        const spots = scene.GetLights("spot").slice(0, MAX_SPOT_LIGHTS);

        this.#setVec3(shader, "uAmbientColor", ambient?.color ?? [1, 1, 1]);
        this.#set1f(shader, "uAmbientIntensity", ambient?.intensity ?? 0.12);
        this.#setVec3(shader, "uHemisphereSkyColor", hemisphere?.skyColor ?? [0, 0, 0]);
        this.#setVec3(shader, "uHemisphereGroundColor", hemisphere?.groundColor ?? [0, 0, 0]);
        this.#set1f(shader, "uHemisphereIntensity", hemisphere?.intensity ?? 0);

        this.#set1i(shader, "uHasDirectionalLight", directional ? 1 : 0);
        this.#setVec3(shader, "uDirectionalDirection", directional?.direction ?? [0, -1, 0]);
        this.#setVec3(shader, "uDirectionalColor", directional?.color ?? [1, 1, 1]);
        this.#set1f(shader, "uDirectionalIntensity", directional?.intensity ?? 0);
        this.#set1f(shader, "uShadowBias", shadowState?.light?.shadowBias ?? 0.0012);
        this.#set1f(shader, "uShadowStrength", shadowState?.light?.shadowStrength ?? 0.55);

        this.#set1i(shader, "uPointLightCount", points.length);
        points.forEach((light, index) => {
            this.#setVec3(shader, `uPointLightPositions[${index}]`, light.position);
            this.#setVec3(shader, `uPointLightColors[${index}]`, light.color);
            this.#set1f(shader, `uPointLightIntensities[${index}]`, light.intensity);
            this.#set1f(shader, `uPointLightRanges[${index}]`, light.range);
        });

        this.#set1i(shader, "uSpotLightCount", spots.length);
        spots.forEach((light, index) => {
            this.#setVec3(shader, `uSpotLightPositions[${index}]`, light.position);
            this.#setVec3(shader, `uSpotLightDirections[${index}]`, light.direction);
            this.#setVec3(shader, `uSpotLightColors[${index}]`, light.color);
            this.#set1f(shader, `uSpotLightIntensities[${index}]`, light.intensity);
            this.#set1f(shader, `uSpotLightRanges[${index}]`, light.range);
            this.#set1f(shader, `uSpotLightInnerCos[${index}]`, Math.cos(light.innerAngle));
            this.#set1f(shader, `uSpotLightOuterCos[${index}]`, Math.cos(light.outerAngle));
        });
    }

    #renderShadowPass(scene, camera) {
        const light = scene.GetLights("directional").find(candidate => candidate.castShadow);
        Mat4.identity(this.lightViewProjection);

        if (!light) {
            return { light: null, texture: null, matrix: this.lightViewProjection };
        }

        const shadow = this.#getShadowState(light);
        const matrix = this.#calculateDirectionalLightMatrix(light, camera);
        const gl = this.gl;
        const objects = scene.GetRenderableObjects().filter(mesh => mesh.castShadow !== false);

        gl.bindFramebuffer(gl.FRAMEBUFFER, shadow.framebuffer);
        gl.viewport(0, 0, shadow.size, shadow.size);
        gl.colorMask(false, false, false, false);
        gl.clear(gl.DEPTH_BUFFER_BIT);

        this.shadowShader.Use();
        this.#setMatrix(this.shadowShader, "uLightViewProjection", matrix);

        const identity = Mat4.create();
        for (const mesh of objects) {
            const material = mesh.material;
            if (material?.type === "shader" && material.domain === "post") continue;
            // A ShaderMaterial with its own vertex stage casts its displaced shape: that stage runs
            // with view = identity and projection = the light's view-projection.
            const custom = material?.type === "shader" && material.asset.vertex ? this.#getMaterialProgram(material.asset, "shadow") : null;
            const program = custom ?? this.shadowShader;
            const geometry = this.#getGeometryState(custom ? this.#meshGeometry(mesh) : mesh.geometry);
            const model = mesh.transform.GetMatrix(Mat4.create());
            program.Use();
            this.#setMatrix(program, "uModel", model);
            if (custom) {
                const normalMatrix = Mat4.create();
                if (Mat4.invert(normalMatrix, model)) Mat4.transpose(normalMatrix, normalMatrix);
                this.#setMatrix(program, "uNormalMatrix", normalMatrix);
                this.#setMatrix(program, "uView", identity);
                this.#setMatrix(program, "uProjection", matrix);
                this.#setMatrix(program, "uLightViewProjection", matrix);
                this.#bindShaderProperties(program, material, PROPERTY_UNITS);
            } else {
                this.#setMatrix(program, "uLightViewProjection", matrix);
            }
            gl.bindVertexArray(geometry.vao);

            if (geometry.indexed) {
                gl.drawElements(gl.TRIANGLES, geometry.count, geometry.indexType, 0);
            } else {
                gl.drawArrays(gl.TRIANGLES, 0, geometry.count);
            }
        }

        gl.bindVertexArray(null);
        gl.colorMask(true, true, true, true);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.lightViewProjection = matrix;
        return { light, texture: shadow.depthTexture, matrix };
    }

    #calculateDirectionalLightMatrix(light, camera) {
        const center = camera.target ?? [0, 0, 0];
        const direction = light.direction ?? [0, -1, 0];
        const distance = light.shadowDistance ?? 16;
        const radius = distance * 0.72;
        const eye = [
            center[0] - direction[0] * distance,
            center[1] - direction[1] * distance,
            center[2] - direction[2] * distance,
        ];
        const up = Math.abs(direction[1]) > 0.92 ? [0, 0, 1] : [0, 1, 0];
        const view = Mat4.create();
        const projection = Mat4.create();
        const result = Mat4.create();

        Mat4.lookAt(view, eye, center, up);
        Mat4.orthographic(projection, -radius, radius, -radius, radius, 0.1, distance * 3);
        Mat4.multiply(result, projection, view);
        return result;
    }

    #getShadowState(light) {
        const cached = this.shadowCache.get(light);
        if (cached && cached.size === light.shadowMapSize) return cached;

        const gl = this.gl;
        const size = light.shadowMapSize ?? 1024;
        const framebuffer = gl.createFramebuffer();
        const depthTexture = gl.createTexture();
        this.ownedFramebuffers.add(framebuffer);
        this.ownedTextures.add(depthTexture);
        if (cached) {
            gl.deleteFramebuffer(cached.framebuffer);
            gl.deleteTexture(cached.depthTexture);
            this.ownedFramebuffers.delete(cached.framebuffer);
            this.ownedTextures.delete(cached.depthTexture);
        }

        gl.bindTexture(gl.TEXTURE_2D, depthTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, size, size, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);
        gl.drawBuffers([gl.NONE]);
        gl.readBuffer(gl.NONE);

        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
            console.warn("Render3D: shadow framebuffer is incomplete; shadows will be disabled.");
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        const state = { framebuffer, depthTexture, size };
        this.shadowCache.set(light, state);
        return state;
    }

    #getGeometryState(geometry) {
        if (!geometry) throw new Error("Render3D mesh requires geometry.");
        const cached = this.geometryCache.get(geometry);
        if (cached) {
            if (cached.version !== geometry.version) {
                const arrays = [geometry.positions, geometry.normals, geometry.uvs, geometry.tangents];
                arrays.forEach((data, index) => {
                    if (data.byteLength !== cached.byteLengths[index]) {
                        throw new Error('Geometry updates must preserve vertex buffer sizes.');
                    }
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, cached.buffers[index]);
                    this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, data);
                });
                cached.version = geometry.version;
            }
            return cached;
        }

        const gl = this.gl;
        geometry.EnsureNormals();
        geometry.EnsureUvs();
        geometry.EnsureTangents();

        const vao = gl.createVertexArray();
        this.ownedVertexArrays.add(vao);
        gl.bindVertexArray(vao);

        const buffers = [
            this.#uploadAttribute(ATTRIBUTE.position, 3, geometry.positions),
            this.#uploadAttribute(ATTRIBUTE.normal, 3, geometry.normals),
            this.#uploadAttribute(ATTRIBUTE.uv, 2, geometry.uvs),
            this.#uploadAttribute(ATTRIBUTE.tangent, 4, geometry.tangents),
        ];

        let indexed = false;
        let indexType = gl.UNSIGNED_SHORT;
        let count = geometry.vertexCount;

        if (geometry.indices) {
            const indexBuffer = gl.createBuffer();
            this.ownedBuffers.add(indexBuffer);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
            indexed = true;
            count = geometry.indices.length;
            indexType = geometry.indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
        }

        gl.bindVertexArray(null);

        const byteLengths = [geometry.positions, geometry.normals, geometry.uvs, geometry.tangents].map(data => data.byteLength);
        const state = { vao, indexed, indexType, count, buffers, byteLengths, version: geometry.version };
        this.geometryCache.set(geometry, state);
        return state;
    }

    #uploadAttribute(location, size, data) {
        const gl = this.gl;
        const buffer = gl.createBuffer();
        this.ownedBuffers.add(buffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
        return buffer;
    }

    #bindTexture(shader, unit, samplerName, hasName, textureLike, fallbackTexture) {
        const texture = this.#resolveTexture(textureLike);
        this.#set1i(shader, hasName, texture ? 1 : 0);
        this.#bindTextureObject(shader, unit, samplerName, texture?.EnsureGPU(this.gl, fallbackTexture) ?? fallbackTexture);
    }

    #bindTextureObject(shader, unit, samplerName, texture) {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        this.#set1i(shader, samplerName, unit);
    }

    #resolveTexture(textureLike) {
        if (!textureLike) return null;
        if (textureLike instanceof Texture) {
            this.usedTextures.add(textureLike);
            return textureLike;
        }
        if (this.textureCache.has(textureLike)) return this.textureCache.get(textureLike);

        const texture = new Texture(textureLike);
        this.usedTextures.add(texture);
        this.textureCache.set(textureLike, texture);
        return texture;
    }

    #setMatrix(shader, name, value) {
        this.gl.uniformMatrix4fv(shader.GetUniform(name), false, value);
    }

    #setVec3(shader, name, value) {
        this.gl.uniform3fv(shader.GetUniform(name), value);
    }

    #setVec2(shader, name, value) {
        this.gl.uniform2fv(shader.GetUniform(name), value);
    }

    #setVec4(shader, name, value) {
        this.gl.uniform4fv(shader.GetUniform(name), value);
    }

    #set1f(shader, name, value) {
        this.gl.uniform1f(shader.GetUniform(name), value);
    }

    #set1i(shader, name, value) {
        this.gl.uniform1i(shader.GetUniform(name), value);
    }
}
