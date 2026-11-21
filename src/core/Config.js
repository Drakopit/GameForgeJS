import { CONFIG_DEFAULTS } from "./ConfigDefaults.js";

/**
 * Loads and merges global and per-game JSON configuration files.
 */
export class Config {
    static data = null;

    static Defaults() { return this.DeepMerge({}, CONFIG_DEFAULTS); }

    /**
     * Fetches one or more config paths, with later values overriding earlier values.
     * @param {string|string[]} filepath - JSON configuration path or ordered paths.
     * @returns {Promise<Object>} Merged configuration data.
     */
    static async Load(filepath) {
        this.data = await this.Read(filepath);
        return this.data;
    }

    /** Loads configuration without changing the legacy global Config.data. */
    static async Read(filepath = null, defaults = {}) {
        try {
            const paths = Array.isArray(filepath) ? filepath : [filepath];
            const configs = [];

            for (const path of paths.filter(Boolean)) {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`Arquivo de configuracao nao encontrado: ${path}`);
                configs.push(await response.json());
            }

            return configs.reduce((result, config) => this.DeepMerge(result, config), this.DeepMerge(this.Defaults(), defaults));
        } catch (error) {
            console.error("GameForgeJS: Falha critica ao carregar configuracao.", error);
            throw error;
        }
    }

    static DeepMerge(target, source) {
        if (!source) return target;

        Object.entries(source).forEach(([key, value]) => {
            if (key === "__proto__" || key === "constructor" || key === "prototype") return;
            if (Array.isArray(value)) {
                target[key] = value.map(entry => this.IsPlainObject(entry) ? this.DeepMerge({}, entry) : Array.isArray(entry) ? structuredClone(entry) : entry);
                return;
            }

            if (this.IsPlainObject(value)) {
                target[key] = this.DeepMerge(
                    this.IsPlainObject(target[key]) ? target[key] : {},
                    value
                );
                return;
            }

            target[key] = value;
        });

        return target;
    }

    static IsPlainObject(value) {
        return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }
}
