/** Conservative world AABB frustum rejection; transparent surfaces sort back-to-front. */
export class RenderQueue3D {
    bounds: WeakMap<object, any>;
    culled: number;
    Build(objects: any, camera: any): any[];
    GetBounds(geometry: any): any;
}
