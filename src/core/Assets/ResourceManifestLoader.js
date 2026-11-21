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
    static async Load(paths, assets) {
        const manifestPaths = Array.isArray(paths) ? paths : [paths];
        const manifests = [];

        for (const path of manifestPaths) {
            manifests.push(await this.Queue(path, assets));
        }

        await assets.LoadAll();
        return manifests.length === 1 ? manifests[0] : manifests;
    }

    static async Queue(path, assets) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Manifest not found: ${path}`);
        }

        const manifest = await response.json();
        this.Validate(manifest);
        // Resource paths belong to their manifest, never to the hosting HTML page.
        // response.url also preserves redirects and deployment under a URL prefix.
        const base = response.url || new URL(path, globalThis.location?.href ?? "http://localhost/").href;
        const queues = {
            images: "QueueImage", audios: "QueueAudio", shaders: "QueueShader",
            models: "QueueModel", jsons: "QueueJson",
        };
        for (const [group, queue] of Object.entries(queues)) {
            for (const asset of manifest[group] ?? []) {
                assets[queue](asset.name, new URL(asset.path, base).href, asset);
            }
        }

        return manifest;
    }

    /** Validate the shared resource-manifest contract before starting any asset loads. */
    static Validate(manifest) {
        if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) {
            throw new TypeError("Resource manifest must be an object.");
        }
        if (manifest.schemaVersion !== undefined && manifest.schemaVersion !== 1) {
            throw new Error(`Unsupported resource schema version: ${manifest.schemaVersion}`);
        }
        for (const group of ["images", "audios", "shaders", "models", "jsons"]) {
            if (manifest[group] === undefined) continue;
            if (!Array.isArray(manifest[group])) throw new TypeError(`Resource '${group}' must be an array.`);
            const names = new Set();
            for (const asset of manifest[group]) {
                if (!asset || typeof asset.name !== "string" || !asset.name.trim()
                    || typeof asset.path !== "string" || !asset.path.trim()) {
                    throw new TypeError(`Each '${group}' resource requires a name and path.`);
                }
                if (names.has(asset.name)) throw new Error(`Duplicate '${group}' resource '${asset.name}'.`);
                names.add(asset.name);
            }
        }
        return manifest;
    }
}
