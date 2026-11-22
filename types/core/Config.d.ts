/**
 * Loads and merges global and per-game JSON configuration files.
 */
export class Config {
    static data: any;
    static Defaults(): any;
    /**
     * Fetches one or more config paths, with later values overriding earlier values.
     * @param {string|string[]} filepath - JSON configuration path or ordered paths.
     * @returns {Promise<Object>} Merged configuration data.
     */
    static Load(filepath: string | string[]): Promise<any>;
    /** Loads configuration without changing the legacy global Config.data. */
    static Read(filepath?: any, defaults?: {}): Promise<any>;
    static DeepMerge(target: any, source: any): any;
    static IsPlainObject(value: any): boolean;
}
