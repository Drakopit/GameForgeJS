import { GameObject } from 'gameforgejs/2d';
import { Vector3D } from 'gameforgejs/core';
import { BoxCollider3D, Mesh, PrimitiveMesh, StandardMaterial, UnlitMaterial, Transform3D } from 'gameforgejs/3d';
import { MeshActor } from './MeshActor.js';
import { OrbitMotion } from '../components/OrbitMotion.js';

/** Procedural set dressing uses shared native geometry/materials, not a custom renderer. */
export class ObservatoryWorld extends GameObject {
    constructor(level) {
        super(); this.level = level; this.meshes = []; this.solids = [];
        this.geometry = { cube: PrimitiveMesh.Cube(), rock: PrimitiveMesh.Sphere(1, {widthSegments: 7, heightSegments: 4}),
            mote: PrimitiveMesh.Sphere(1, {widthSegments: 6, heightSegments: 3}), ring: PrimitiveMesh.Ring(4, 4.2, {segments: 48}) };
        this.material = {
            grass: new StandardMaterial({albedoColor: '#4a8e83', roughness: 0.94}),
            stone: new StandardMaterial({albedoColor: '#344b63', roughness: 0.8}),
            ivory: new StandardMaterial({albedoColor: '#e4d9b5', roughness: 0.55}),
            bronze: new StandardMaterial({albedoColor: '#c89350', metallic: 0.65, roughness: 0.35}),
            leaves: new StandardMaterial({albedoColor: '#437b74', roughness: 1}),
            light: new UnlitMaterial({color: '#81f0df'}),
            water: new UnlitMaterial({color: [0.25, 0.8, 0.88, 0.3], transparent: true}),
            cloud: new UnlitMaterial({color: [0.57, 0.72, 0.78, 0.14], transparent: true}),
            moon: new UnlitMaterial({color: '#f1dcbb'}),
        };
    }
    Add(shape, material, position, scale, solid = false) {
        const mesh = new Mesh({geometry: this.geometry[shape], material: this.material[material],
            transform: new Transform3D({position, scale}), castShadow: !['water', 'light', 'cloud', 'moon'].includes(material)});
        this.level.scene.Add(mesh); this.meshes.push(mesh);
        if (solid) this.solids.push(this.level.physics.AddBody({object: mesh, collider: new BoxCollider3D({size: scale})}));
        return mesh;
    }
    OnStart() {
        const level = this.level;
        for (const island of level.rules.islands) {
            this.Add('cube', 'grass', [island.x, -0.6, island.z], [island.width, 1.2, island.depth], true);
            this.Add('rock', 'stone', [island.x, -4, island.z], [island.width * 0.52, 5, island.depth * 0.5]);
            for (let ridge = 0; ridge < 5; ridge++) {
                const angle = ridge * Math.PI * 2 / 5;
                this.Add('rock', 'stone', [island.x + Math.cos(angle) * 5, -7 - ridge % 2 * 2, island.z + Math.sin(angle) * 5], [4.5, 6 + ridge % 3, 4.5]);
            }
            for (let index = 0; index < 7; index++) {
                const angle = index * Math.PI * 2 / 7;
                const x = island.x + Math.cos(angle) * island.width * 0.38, z = island.z + Math.sin(angle) * island.depth * 0.38;
                this.Add('cube', 'bronze', [x, 1.5, z], [0.4, 3, 0.4]);
                this.Add('rock', 'leaves', [x, 4, z], [1.6, 2, 1.6]);
            }
            this.Add('cube', 'water', [island.x + island.width * 0.35, -6, island.z - 2], [1.2, 12, 0.2]);
            for (let tile = 0; tile < 8; tile++) this.Add('cube', 'ivory', [island.x, 0.04, island.z - 7 + tile * 2], [2.5, 0.08, 1.2]);
        }
        // Axis-aligned bridge collisions match the native sphere/box solver exactly.
        this.Add('cube', 'ivory', [16, -0.3, 0], [12, 0.6, 4], true);
        this.Add('cube', 'ivory', [-16, -0.3, 0], [12, 0.6, 4], true);
        this.Add('cube', 'ivory', [-30, -0.3, -7], [4, 0.6, 18], true);
        for (const x of [-19, -16, -13, 13, 16, 19]) for (const z of [-2, 2]) {
            this.Add('cube', 'bronze', [x, 0.7, z], [0.18, 1.4, 0.18]);
            this.Add('rock', 'light', [x, 1.5, z], [0.16, 0.16, 0.16]);
        }
        for (const x of [-6, 6]) for (const z of [-5, 5]) {
            this.Add('cube', 'ivory', [x, 5, z], [1.1, 10, 1.1], true);
            this.Add('cube', 'bronze', [x, 10, z], [1.8, 0.6, 1.8]);
        }
        for (const z of [-5, 5]) this.Add('cube', 'ivory', [0, 10.7, z], [14, 1, 1.5]);
        this.Add('cube', 'ivory', [0, 0.3, -4], [8, 0.6, 5], true);
        for (let index = 0; index < 3; index++) {
            const ring = this.Add('ring', index === 1 ? 'light' : 'bronze', [0, 6, 0], [1 + index * 0.24, 1, 1 + index * 0.24]);
            ring.transform.rotation.x = Math.PI * (0.2 + index * 0.25);
            const actor = new MeshActor(level.scene, ring);
            level.scene.Remove(ring); this.meshes.pop();
            actor.AddComponent(new OrbitMotion(ring, {center: new Vector3D(0, 6, 0), speed: 0.15 + index * 0.12}));
            level.AddEntity(actor);
        }
        this.Add('rock', 'light', [0, 6, 0], [1.2, 1.2, 1.2]);
        this.Add('rock', 'moon', [-50, 45, -90], [9, 9, 9]);
        for (let index = 0; index < level.rules.environment.horizonIslands; index++) {
            const angle = index * 2.399, distance = 60 + index * 2;
            this.Add('rock', 'stone', [Math.cos(angle) * distance, -8 + Math.sin(index) * 9, Math.sin(angle) * distance], [8, 9, 8]);
            this.Add('cube', 'grass', [Math.cos(angle) * distance, -1 + Math.sin(index) * 9, Math.sin(angle) * distance], [12, 1, 12]);
            this.Add('rock', 'cloud', [Math.cos(angle) * distance, -15, Math.sin(angle) * distance], [22, 2, 12]);
        }
        for (let index = 0; index < level.rules.environment.motes; index++) {
            const mesh = new Mesh({geometry: this.geometry.mote, material: this.material.light, castShadow: false,
                transform: new Transform3D({scale: [0.06, 0.06, 0.06]})});
            const actor = new MeshActor(level.scene, mesh);
            actor.AddComponent(new OrbitMotion(mesh, {center: new Vector3D(0, 2 + index % 8, 0), radius: 8 + index % 20,
                speed: 0.04 + index % 4 * 0.015, phase: index * 2.399, bob: 0.8})); level.AddEntity(actor);
        }
        super.OnStart();
    }
    OnDestroy() {
        for (const mesh of this.meshes) this.level.scene.Remove(mesh);
        for (const solid of this.solids) this.level.physics.RemoveBody(solid);
        this.meshes.length = 0; this.solids.length = 0; super.OnDestroy();
    }
}
