import { PerspectiveCamera } from './PerspectiveCamera.js';
import { Mat4 } from '../../../core/Math/Mat4.js';
/** Native parallel projection for true 3D isometric scenes; viewHeight controls zoom. */
export class OrthographicCamera extends PerspectiveCamera {
    constructor({ viewHeight = 12, ...options } = {}) {
        super(options);
        if (!Number.isFinite(viewHeight) || viewHeight <= 0)
            throw new RangeError('View height must be positive.');
        this.viewHeight = viewHeight;
        this.UpdateProjection(this.aspect);
    }
    UpdateProjection(aspect = this.aspect) {
        this.aspect = aspect || 1;
        const half = (this.viewHeight ?? 12) / 2;
        Mat4.orthographic(this.projectionMatrix, -half * this.aspect, half * this.aspect, -half, half, this.near, this.far);
        return this;
    }
}
