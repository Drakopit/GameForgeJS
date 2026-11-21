import { Component } from '../../core/Component.js';
/** Engine-clocked animation of a deduplicated set of native SurfaceMaterials. */
export class SurfaceAnimator extends Component {
    constructor(materials = []) { super(); this.materials = new Set(materials); }
    OnUpdate(dt) { for (const material of this.materials)
        material.Advance(dt); }
    OnDestroy() { this.materials.clear(); }
}
