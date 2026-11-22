/**
 * Dependency-free asset registry, eager preloader and lazy loader.
 *
 * Manifests may set `{ "lazy": true }` on any asset entry. Lazy assets are
 * registered during bootstrap but only fetched after `LoadAsset(name)` or one
 * of the async getters is called.
 */
export class AssetManager {
    constructor({ shared, audio }?: {
        shared?: boolean;
        audio?: any;
    });
    images: {};
    audioQueue: any[];
    audios: {};
    shaders: {};
    models: {};
    jsons: {};
    promises: any[];
    registry: Map<any, any>;
    loading: Map<any, any>;
    loaders: Map<any, any>;
    values: Map<any, any>;
    shared: boolean;
    audio: any;
    disposed: boolean;
    /** Install an optional asset type without coupling the core to its implementation. */
    RegisterLoader(type: any, loader: any): () => void;
    GetAudioService(): any;
    Dispose(): void;
    RegisterAsset(type: any, name: any, path: any, options?: {}): void;
    RegisterImage(name: any, path: any, options?: {}): void;
    RegisterAudio(name: any, path: any, options?: {}): void;
    RegisterShader(name: any, path: any, options?: {}): void;
    RegisterModel(name: any, path: any, options?: {}): void;
    RegisterJson(name: any, path: any, options?: {}): void;
    QueueAudio(name: any, path: any, options?: {}): any;
    GetAudio(name: any): any;
    LoadAudioQueue(): Promise<void>;
    TrackPromise(promise: any): any;
    QueueImage(name: any, src: any, options?: {}): any;
    LoadImage(name: any, src: any): Promise<any>;
    QueueShader(name: any, url: any, options?: {}): any;
    LoadShader(name: any, url: any): Promise<string>;
    QueueModel(name: any, url: any, options?: {}): any;
    LoadModel(url: any): Promise<any>;
    QueueJson(name: any, url: any, options?: {}): any;
    LoadJson(name: any, url: any): Promise<any>;
    LoadAsset(name: any, type?: any): Promise<any>;
    LoadAssets(names: any, type?: any): Promise<any[]>;
    LoadType(type: any, { includeLazy }?: {
        includeLazy?: boolean;
    }): Promise<any[]>;
    LoadRegisteredAsset(entry: any): Promise<any>;
    GetLoadedAsset(type: any, name: any): any;
    HasLoadedAsset(type: any, name: any): boolean;
    TouchLazyAsset(name: any, type: any): void;
    IsLazyPending(name: any, type: any): boolean;
    FindAssetEntry(name: any, type?: any): any;
    AssetKey(type: any, name: any): string;
    LoadAll({ includeLazy }?: {
        includeLazy?: boolean;
    }): Promise<void>;
    GetImage(name: any): any;
    HasImage(name: any): boolean;
    GetModel(name: any): any;
    GetShader(name: any): any;
    GetJson(name: any): any;
    GetImageAsync(name: any): Promise<any>;
    GetAudioAsync(name: any): Promise<any>;
    GetShaderAsync(name: any): Promise<any>;
    GetModelAsync(name: any): Promise<any>;
    GetJsonAsync(name: any): Promise<any>;
}
