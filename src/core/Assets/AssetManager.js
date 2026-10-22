import { Logger } from "../Logger.js";
import { AudioManager } from "../Audio/AudioManager.js";

/**
 * Dependency-free asset registry, eager preloader and lazy loader.
 *
 * Manifests may set `{ "lazy": true }` on any asset entry. Lazy assets are
 * registered during bootstrap but only fetched after `LoadAsset(name)` or one
 * of the async getters is called.
 */
export class AssetManager {
    constructor({ shared = true, audio = null } = {}) {
        if (shared && AssetManager.instance) {
            return AssetManager.instance;
        }

        this.images = {};
        this.audioQueue = [];
        this.audios = {};
        this.shaders = {};
        this.models = {};
        this.jsons = {};
        this.promises = [];
        this.registry = new Map();
        this.loading = new Map();
        this.loaders = new Map();
        this.values = new Map();
        this.shared = shared;
        this.audio = audio;
        this.disposed = false;

        if (shared) AssetManager.instance = this;
    }

    /** Install an optional asset type without coupling the core to its implementation. */
    RegisterLoader(type, loader) {
        if (!type || typeof loader !== "function") throw new TypeError("RegisterLoader requires a type and function.");
        if (this.loaders.has(type)) throw new Error(`Asset loader '${type}' is already registered.`);
        this.loaders.set(type, loader);
        return () => { if (this.loaders.get(type) === loader) this.loaders.delete(type); };
    }

    GetAudioService() {
        const audio = this.audio ?? (this.shared ? AudioManager.instance : null);
        if (!audio) throw new Error("Audio assets require audioModule().");
        audio.Initialize();
        if (!audio.isInitialized) throw new Error("Audio could not initialize Web Audio for decoding assets.");
        return audio;
    }

    Dispose() {
        if (this.disposed) return;
        this.disposed = true;
        this.registry.clear();
        this.loaders.clear();
        this.values.clear();
        this.loading.clear();
        this.promises.length = 0;
        this.audioQueue.length = 0;
        this.images = {}; this.audios = {}; this.models = {}; this.shaders = {}; this.jsons = {};
        if (AssetManager.instance === this) AssetManager.instance = null;
    }

    RegisterAsset(type, name, path, options = {}) {
        if (this.disposed) throw new Error("Cannot register assets on a disposed manager.");
        if (!name || !path) {
            throw new Error("AssetManager: assets must have a name and path.");
        }

        this.registry.set(this.AssetKey(type, name), {
            type,
            name,
            path,
            lazy: Boolean(options.lazy),
            options,
        });
    }

    RegisterImage(name, path, options = {}) {
        this.RegisterAsset("image", name, path, { ...options, lazy: true });
    }

    RegisterAudio(name, path, options = {}) {
        this.RegisterAsset("audio", name, path, { ...options, lazy: true });
    }

    RegisterShader(name, path, options = {}) {
        this.RegisterAsset("shader", name, path, { ...options, lazy: true });
    }

    RegisterModel(name, path, options = {}) {
        this.RegisterAsset("model", name, path, { ...options, lazy: true });
    }

    RegisterJson(name, path, options = {}) {
        this.RegisterAsset("json", name, path, { ...options, lazy: true });
    }

    QueueAudio(name, path, options = {}) {
        this.RegisterAsset("audio", name, path, options);
        if (options.lazy) return null;
        if (this.audios[name] || this.audioQueue.some(item => item.name === name)) return this.audios[name] ?? null;
        this.audioQueue.push({ name, path });
        return null;
    }

    GetAudio(name) {
        this.TouchLazyAsset(name, "audio");
        if (!this.audios[name] && !this.IsLazyPending(name, "audio")) {
            console.warn(`AssetManager: audio '${name}' not found.`);
        }
        return this.audios[name];
    }

    async LoadAudioQueue() {
        if (this.audioQueue.length === 0) return;

        this.GetAudioService();
        const queued = [...this.audioQueue];
        this.audioQueue = [];

        await Promise.all(queued.map(item => this.LoadAsset(item.name, "audio")));
    }

    TrackPromise(promise) {
        // Queue methods start immediately; LoadAll remains responsible for reporting failures.
        promise.catch(() => {});
        this.promises.push(promise);
        return promise;
    }

    QueueImage(name, src, options = {}) {
        this.RegisterAsset("image", name, src, options);
        if (options.lazy) return null;
        if (this.images[name]) return this.images[name];

        const promise = this.LoadAsset(name, "image");
        this.TrackPromise(promise);
        return promise;
    }

    LoadImage(name, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                if (!this.disposed) this.images[name] = img;
                resolve(img);
            };
            img.onerror = () => reject(new Error(`AssetManager: failed to load image ${src}`));
            img.src = src;
        });
    }

    QueueShader(name, url, options = {}) {
        this.RegisterAsset("shader", name, url, options);
        if (options.lazy) return null;
        if (this.shaders[name]) return this.shaders[name];

        const promise = this.LoadAsset(name, "shader");
        this.TrackPromise(promise);
        return promise;
    }

    async LoadShader(name, url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`AssetManager: failed to load shader ${url}`);
        const sourceCode = await response.text();
        if (!this.disposed) this.shaders[name] = sourceCode;
        return sourceCode;
    }

    QueueModel(name, url, options = {}) {
        this.RegisterAsset("model", name, url, options);
        if (options.lazy) return null;
        if (this.models[name]) return this.models[name];

        const promise = this.LoadAsset(name, "model");
        this.TrackPromise(promise);
        return promise;
    }

    async LoadModel(url) {
        const loader = this.loaders.get("model");
        if (!loader) throw new Error("Model assets require module3D() or a registered 'model' loader.");
        return loader({ type: "model", path: url }, this);
    }

    QueueJson(name, url, options = {}) {
        this.RegisterAsset("json", name, url, options);
        if (options.lazy) return null;
        if (this.HasLoadedAsset("json", name)) return this.jsons[name];

        const promise = this.LoadAsset(name, "json");
        this.TrackPromise(promise);
        return promise;
    }

    async LoadJson(name, url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`AssetManager: failed to load JSON ${url}`);
        const json = await response.json();
        if (!this.disposed) this.jsons[name] = json;
        return json;
    }

    async LoadAsset(name, type = null) {
        if (this.disposed) throw new Error("Cannot load assets on a disposed manager.");
        const entry = this.FindAssetEntry(name, type);
        if (!entry) {
            throw new Error(`AssetManager: asset '${type ? `${type}:` : ""}${name}' is not registered.`);
        }

        const key = this.AssetKey(entry.type, name);
        const loaded = this.GetLoadedAsset(entry.type, name);
        if (this.HasLoadedAsset(entry.type, name)) return loaded;
        if (this.loading.has(key)) return this.loading.get(key);

        const promise = this.LoadRegisteredAsset(entry)
            .finally(() => this.loading.delete(key));

        this.loading.set(key, promise);
        return promise;
    }

    async LoadAssets(names, type = null) {
        return Promise.all(names.map(name => this.LoadAsset(name, type)));
    }

    async LoadType(type, { includeLazy = true } = {}) {
        const names = [...this.registry.values()]
            .filter(entry => entry.type === type && (includeLazy || !entry.lazy))
            .map(entry => entry.name);

        return this.LoadAssets(names, type);
    }

    async LoadRegisteredAsset(entry) {
        const loader = this.loaders.get(entry.type);
        if (loader) {
            const value = await loader(entry, this);
            if (!this.disposed) {
                this.values.set(this.AssetKey(entry.type, entry.name), value);
                const stores = { image: this.images, audio: this.audios, shader: this.shaders, model: this.models, json: this.jsons };
                if (stores[entry.type]) stores[entry.type][entry.name] = value;
            }
            return value;
        }
        if (entry.type === "image") {
            return this.LoadImage(entry.name, entry.path);
        }

        if (entry.type === "audio") {
            const audio = this.GetAudioService();
            const response = await fetch(entry.path);
            if (!response.ok) throw new Error(`AssetManager: failed to load audio ${entry.path}`);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audio.context.decodeAudioData(arrayBuffer);
            if (!this.disposed) this.audios[entry.name] = audioBuffer;
            return audioBuffer;
        }

        if (entry.type === "shader") {
            return this.LoadShader(entry.name, entry.path);
        }

        if (entry.type === "model") {
            const model = await this.LoadModel(entry.path);
            if (!this.disposed) this.models[entry.name] = model;
            return model;
        }

        if (entry.type === "json") {
            return this.LoadJson(entry.name, entry.path);
        }

        throw new Error(`AssetManager: unsupported asset type '${entry.type}'.`);
    }

    GetLoadedAsset(type, name) {
        if (this.values.has(this.AssetKey(type, name))) return this.values.get(this.AssetKey(type, name));
        if (type === "image") return this.images[name];
        if (type === "audio") return this.audios[name];
        if (type === "shader") return this.shaders[name];
        if (type === "model") return this.models[name];
        if (type === "json") return this.jsons[name];
        return null;
    }

    HasLoadedAsset(type, name) {
        if (this.values.has(this.AssetKey(type, name))) return true;
        const stores = { image: this.images, audio: this.audios, shader: this.shaders, model: this.models, json: this.jsons };
        return stores[type] != null && Object.hasOwn(stores[type], name);
    }

    TouchLazyAsset(name, type) {
        const entry = this.FindAssetEntry(name, type);
        const key = entry ? this.AssetKey(entry.type, name) : null;
        if (!entry?.lazy || this.HasLoadedAsset(entry.type, name) || this.loading.has(key)) return;
        this.LoadAsset(name, type).catch(error => console.warn(error.message));
    }

    IsLazyPending(name, type) {
        const entry = this.FindAssetEntry(name, type);
        return Boolean(entry?.lazy && entry.type === type && !this.HasLoadedAsset(type, name));
    }

    FindAssetEntry(name, type = null) {
        if (type) return this.registry.get(this.AssetKey(type, name)) ?? null;

        const matches = [...this.registry.values()].filter(entry => entry.name === name);
        if (matches.length <= 1) return matches[0] ?? null;

        throw new Error(
            `AssetManager: asset '${name}' exists in multiple types. Use LoadAsset(name, type) or a typed async getter.`
        );
    }

    AssetKey(type, name) {
        return `${type}:${name}`;
    }

    async LoadAll({ includeLazy = false } = {}) {
        const pending = this.promises.splice(0);
        for (const entry of this.registry.values()) {
            if (!entry.lazy || includeLazy) pending.push(this.LoadAsset(entry.name, entry.type));
        }
        this.audioQueue = [];
        await Promise.all(pending);

        Logger.log("info", "AssetManager: all eager assets loaded.");
    }

    GetImage(name) {
        this.TouchLazyAsset(name, "image");
        if (!this.images[name] && !this.IsLazyPending(name, "image")) {
            console.warn(`AssetManager: image '${name}' not found.`);
        }
        return this.images[name];
    }

    HasImage(name) {
        return Boolean(this.images[name]);
    }

    GetModel(name) {
        this.TouchLazyAsset(name, "model");
        if (!this.models?.[name] && !this.IsLazyPending(name, "model")) {
            console.warn(`AssetManager: model '${name}' not found.`);
        }
        return this.models?.[name] ?? null;
    }

    GetShader(name) {
        this.TouchLazyAsset(name, "shader");
        if (!this.shaders[name] && !this.IsLazyPending(name, "shader")) {
            console.warn(`AssetManager: shader '${name}' not found.`);
        }
        return this.shaders[name];
    }

    GetJson(name) {
        this.TouchLazyAsset(name, "json");
        if (!this.jsons[name] && !this.IsLazyPending(name, "json")) {
            console.warn(`AssetManager: JSON '${name}' not found.`);
        }
        return this.jsons[name];
    }

    async GetImageAsync(name) {
        await this.LoadAsset(name, "image");
        return this.images[name];
    }

    async GetAudioAsync(name) {
        await this.LoadAsset(name, "audio");
        return this.audios[name];
    }

    async GetShaderAsync(name) {
        await this.LoadAsset(name, "shader");
        return this.shaders[name];
    }

    async GetModelAsync(name) {
        await this.LoadAsset(name, "model");
        return this.models[name];
    }

    async GetJsonAsync(name) {
        await this.LoadAsset(name, "json");
        return this.jsons[name];
    }
}
