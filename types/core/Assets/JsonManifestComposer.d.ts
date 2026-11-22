/**
 * Combines JSON game manifests referenced through their `compose` entries.
 */
export class JsonManifestComposer {
    /**
     * Recursively merges one loaded JSON asset with its child manifests.
     * @param {string} name - AssetManager JSON key.
     * @param {AssetManager} [assets] - Loaded asset store.
     * @returns {Object} Composed manifest.
     */
    static Compose(name: string, assets?: AssetManager): any;
    /**
     * Resolves composed manifests that may still be registered as lazy JSON assets.
     * Existing synchronous callers should continue to use Compose after eager loading.
     * @param {string} name - AssetManager JSON key.
     * @param {AssetManager} [assets] - Loaded asset store.
     * @returns {Promise<Object>} Composed manifest.
     */
    static ComposeAsync(name: string, assets?: AssetManager): Promise<any>;
    static ComposeDependency(name: any, assets: any, ancestors: any, resolved: any): any;
    static ComposeDependencyAsync(name: any, assets: any, ancestors: any, resolved: any): Promise<any>;
    static CloneWithoutCompose(manifest: any): any;
    static DeepMerge(target: any, source: any): any;
    static IsPlainObject(value: any): boolean;
    static Clone(value: any): any;
    static SetOwn(target: any, key: any, value: any): void;
}
import { AssetManager } from "./AssetManager.js";
