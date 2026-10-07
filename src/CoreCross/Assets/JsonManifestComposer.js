import { AssetManager } from "./AssetManager.js";

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
    static Compose(name, assets = AssetManager.instance) {
        return this.ComposeDependency(name, assets, [], new Map());
    }

    static ComposeDependency(name, assets, ancestors, resolved) {
        if (ancestors.includes(name)) {
            throw new Error(`JsonManifestComposer: dependency cycle ${[...ancestors, name].join(" -> ")}.`);
        }
        if (resolved.has(name)) return this.Clone(resolved.get(name));
        const manifest = assets.GetJson(name);
        if (manifest == null) {
            throw new Error(`JsonManifestComposer: JSON '${name}' is not loaded (dependency path: ${[...ancestors, name].join(" -> ")}). Await its loading before composing.`);
        }
        if (!manifest?.compose) {
            return this.Clone(manifest);
        }

        if (!Array.isArray(manifest.compose)) throw new Error(`JsonManifestComposer: '${name}.compose' must be an array.`);

        const result = this.CloneWithoutCompose(manifest);

        manifest.compose.forEach(entry => {
            const childName = typeof entry === "string" ? entry : entry.name;
            const childManifest = this.ComposeDependency(childName, assets, [...ancestors, name], resolved);
            this.DeepMerge(result, childManifest);
        });

        resolved.set(name, this.Clone(result));
        return result;
    }

    static CloneWithoutCompose(manifest) {
        const clone = this.Clone(manifest);
        delete clone.compose;
        return clone;
    }

    static DeepMerge(target, source) {
        if (!source) return target;

        Object.entries(source).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                this.SetOwn(target, key, this.Clone(value));
                return;
            }

            if (this.IsPlainObject(value)) {
                this.SetOwn(target, key, this.DeepMerge(
                    Object.hasOwn(target, key) && this.IsPlainObject(target[key]) ? target[key] : {},
                    value
                ));
                return;
            }

            this.SetOwn(target, key, value);
        });

        return target;
    }

    static IsPlainObject(value) {
        return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    static Clone(value) {
        if (Array.isArray(value)) return value.map(item => this.Clone(item));
        if (this.IsPlainObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.Clone(item)]));
        return value;
    }

    static SetOwn(target, key, value) {
        Object.defineProperty(target, key, { value, writable: true, enumerable: true, configurable: true });
    }
}
