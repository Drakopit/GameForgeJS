import { Component } from "../../core/Component.js";
import { Geometry3D } from "../Render3D/Mesh/Geometry3D.js";
import { Mesh } from "../Render3D/Mesh/Mesh.js";
import { ShaderMaterial } from "../Render3D/Material/ShaderMaterial.js";
import { ParticleEmitter } from "../../core/Particles/ParticleEmitter.js";

const SPRITES = { soft: 0, circle: 1, square: 2 };

/**
 * The particle shader: each particle is a camera-facing quad built in the vertex stage
 * (position = particle centre, uv = corner, normal.x = size, tangent = RGBA colour).
 */
export const PARTICLE_SHADER = Object.freeze({
    format: "gameforge.shader",
    version: 1,
    name: "Particles",
    domain: "unlit",
    description: "Camera-facing particle sprites (ParticleRenderer3D).",
    properties: [{ name: "sprite", type: "float", default: 0 }],
    render: { transparent: true, depthWrite: false, cull: "none" },
    glsl: {
        vertex: `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aUv;
layout(location = 3) in vec4 aTangent;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
out vec2 vUv;
out vec4 vColor;
out vec3 vWorldPosition;
void main() {
    vec4 world = uModel * vec4(aPosition, 1.0);
    vWorldPosition = world.xyz;
    vec4 view = uView * world;
    view.xy += (aUv * 2.0 - 1.0) * aNormal.x * 0.5;
    vUv = aUv;
    vColor = aTangent;
    gl_Position = uProjection * view;
}`,
        fragment: `#version 300 es
precision highp float;
in vec2 vUv;
in vec4 vColor;
in vec3 vWorldPosition;
uniform float sprite;
uniform bool uReflectionClip;
uniform float uReflectionClipHeight;
out vec4 outColor;
void main() {
    if (uReflectionClip && vWorldPosition.y < uReflectionClipHeight) discard;
    vec2 p = vUv * 2.0 - 1.0;
    float d = dot(p, p);
    float shape = sprite < 0.5 ? pow(max(0.0, 1.0 - d), 2.0) : (sprite < 1.5 ? step(d, 1.0) : 1.0);
    float alpha = vColor.a * shape;
    if (alpha <= 0.002) discard;
    outColor = vec4(vColor.rgb, alpha);
}`,
    },
});

/**
 * Draws a `ParticleEmitter` in a Scene3D as one dynamic mesh (one draw call), in the
 * editor's viewport and in Play alike.
 *
 * @example
 * level.AddEntity(new ParticleRenderer3D(level.scene, emitter));
 */
export class ParticleRenderer3D extends Component {
    /**
     * @param {import("../Render3D/Scene/Scene3D.js").Scene3D|null} scene - Where the mesh is added (on start).
     * @param {import("../../core/Particles/ParticleEmitter.js").ParticleEmitter} emitter
     */
    constructor(scene, emitter) {
        super();
        this.scene = scene;
        this.emitter = emitter;
        this.material = new ShaderMaterial({ shader: PARTICLE_SHADER, name: "Particles" });
        this.mesh = null;
        this.Rebuild();
    }

    /** Re-creates the batch when the emitter's capacity changed. */
    Rebuild() {
        const capacity = this.emitter.capacity;
        if (this.mesh && this.capacityBuilt === capacity) return;
        const wasAdded = this.mesh && this.added;
        if (wasAdded) this.scene?.Remove(this.mesh);
        const vertices = capacity * 4;
        const uvs = new Float32Array(vertices * 2);
        const indices = new (vertices > 65535 ? Uint32Array : Uint16Array)(capacity * 6);
        for (let p = 0; p < capacity; p++) {
            uvs.set([0, 0, 1, 0, 1, 1, 0, 1], p * 8);
            const v = p * 4;
            indices.set([v, v + 1, v + 2, v, v + 2, v + 3], p * 6);
        }
        this.geometry = new Geometry3D({
            positions: new Float32Array(vertices * 3),
            normals: new Float32Array(vertices * 3),
            uvs,
            tangents: new Float32Array(vertices * 4),
            indices,
        });
        this.mesh = new Mesh({ name: `${this.emitter.name || "Particles"} (particles)`, geometry: this.geometry, material: this.material, castShadow: false, receiveShadow: false, frustumCulled: false });
        this.capacityBuilt = capacity;
        if (wasAdded) this.scene?.Add(this.mesh);
    }

    OnStart() {
        this.scene?.Add(this.mesh);
        this.added = true;
    }

    /** Copies the live particles into the batch (call once per frame, after the emitter's update). */
    Sync() {
        this.Rebuild();
        const settings = this.emitter.settings;
        this.material.blend = settings.blend;
        this.material.SetProperty("sprite", SPRITES[settings.sprite] ?? 0);
        const { positions, normals, tangents } = this.geometry;
        let p = 0;
        this.emitter.ForEach((x, y, z, color, size) => {
            for (let corner = 0; corner < 4; corner++) {
                const v = p * 4 + corner;
                positions[v * 3] = x; positions[v * 3 + 1] = y; positions[v * 3 + 2] = z;
                normals[v * 3] = size;
                tangents.set(color, v * 4);
            }
            p++;
        });
        // Unused slots collapse to nothing.
        normals.fill(0, p * 12);
        this.geometry.MarkUpdated();
    }

    OnUpdate() {
        this.Sync();
    }

    OnDestroy() {
        if (this.added) this.scene?.Remove(this.mesh);
        this.added = false;
        this.scene = null;
    }
}

/**
 * Code-first 3D particles: a ParticleEmitter drawn in `scene` (one level entity).
 * @param {any} scene - The Scene3D. @param {Record<string, any>} [settings] - `ParticleEmitter` values.
 * @param {{target?: any, name?: string}} [options]
 * @example
 * level.AddEntity(Particles3D(level.scene, { rate: 30, blend: "additive" }, { target: torch }));
 */
export function Particles3D(scene, settings = {}, options = {}) {
    return new ParticleEmitter(settings, { ...options, renderer: emitter => new ParticleRenderer3D(scene, emitter) });
}
