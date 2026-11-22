/**
 * Container for renderable meshes, lights, one camera and one skybox.
 *
 * The renderer queries this lightweight collection each frame; gameplay remains
 * in levels and entities rather than in the scene container.
 *
 * @param {Object} [options] - Initial scene properties.
 * @param {number[]} [options.backgroundColor] - RGBA fallback clear color.
 * @param {{height:number}|null} [options.planarReflection=null] - Horizontal reflection plane.
 * @param {{color:number[],near:number,far:number}|null} [options.fog=null] - Optional distance fog for Standard, Toon and Unlit surfaces; far must exceed near.
 */
export class Scene3D {
    constructor({ backgroundColor, fog, planarReflection }?: {
        backgroundColor?: number[];
        fog?: any;
        planarReflection?: any;
    });
    backgroundColor: number[];
    fog: any;
    planarReflection: any;
    objects: any[];
    lights: any[];
    camera: any;
    skybox: any;
    /**
     * Registers a mesh, light, camera or skybox based on its Render3D marker.
     * @param {Object} item - Runtime scene item.
     * @returns {Object} The supplied item.
     */
    Add(item: any): any;
    /**
     * Removes an item from all applicable scene slots.
     * @param {Object} item - Previously added scene item.
     * @returns {void}
     */
    Remove(item: any): void;
    /**
     * Returns visible objects with drawable geometry.
     * @returns {Object[]} Mesh-like renderable objects.
     */
    GetRenderableObjects(): any[];
    /**
     * Returns enabled lights, optionally filtered by type.
     * @param {string|null} [type=null] - Light type filter.
     * @returns {Object[]} Enabled lights.
     */
    GetLights(type?: string | null): any[];
}
