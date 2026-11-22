/** Native parallel projection for true 3D isometric scenes; viewHeight controls zoom. */
export class OrthographicCamera extends PerspectiveCamera {
    constructor({ viewHeight, ...options }?: {
        viewHeight?: number;
    });
    viewHeight: number;
    UpdateProjection(aspect?: number): this;
}
import { PerspectiveCamera } from './PerspectiveCamera.js';
