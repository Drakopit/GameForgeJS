/**
 * The particle shader: each particle is a camera-facing quad built in the vertex stage
 * (position = particle centre, uv = corner, normal.x = size, tangent = RGBA colour).
 */
export const PARTICLE_SHADER: Readonly<{
    format: "gameforge.shader";
    version: 1;
    name: "Particles";
    domain: "unlit";
    description: "Camera-facing particle sprites (ParticleRenderer3D).";
    properties: {
        name: string;
        type: string;
        default: number;
    }[];
    render: {
        transparent: boolean;
        depthWrite: boolean;
        cull: string;
    };
    glsl: {
        vertex: string;
        fragment: string;
    };
}>;
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
    constructor(scene: import("../Render3D/Scene/Scene3D.js").Scene3D | null, emitter: import("../../core/Particles/ParticleEmitter.js").ParticleEmitter);
    scene: import("../index.js").Scene3D;
    emitter: import("../../core/index.js").ParticleEmitter;
    material: ShaderMaterial;
    mesh: Mesh;
    /** Re-creates the batch when the emitter's capacity changed. */
    Rebuild(): void;
    geometry: Geometry3D;
    capacityBuilt: any;
    added: boolean;
    /** Copies the live particles into the batch (call once per frame, after the emitter's update). */
    Sync(): void;
    OnUpdate(): void;
}
import { Component } from "../../core/Component.js";
import { ShaderMaterial } from "../Render3D/Material/ShaderMaterial.js";
import { Mesh } from "../Render3D/Mesh/Mesh.js";
import { Geometry3D } from "../Render3D/Mesh/Geometry3D.js";
