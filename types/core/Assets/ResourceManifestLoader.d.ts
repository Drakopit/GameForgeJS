/**
 * Queues images, audio, shaders, models and JSON declared by game resource manifests.
 */
export class ResourceManifestLoader {
    /**
     * Queues and resolves one or more resource manifests through an `AssetManager`.
     * @param {string|string[]} paths - Resource manifest JSON paths.
     * @param {AssetManager} assets - Destination asset store.
     * @returns {Promise<Object|Object[]>} Loaded manifest data.
     */
    static Load(paths: string | string[], assets: AssetManager): Promise<any | any[]>;
    static Queue(path: any, assets: any): Promise<any>;
    /** Validate the shared resource-manifest contract before starting any asset loads. */
    static Validate(manifest: any): any;
}
