/** One dynamic native mesh for a bounded RainEmitter; no per-drop draw calls. */
export class RainRenderer extends Component {
    constructor(scene: any, emitter: any);
    scene: any;
    emitter: any;
    geometry: Geometry3D;
    mesh: Mesh;
    OnUpdate(): void;
}
import { Component } from '../../core/Component.js';
import { Geometry3D } from '../Render3D/Mesh/Geometry3D.js';
import { Mesh } from '../Render3D/Mesh/Mesh.js';
