import { EMBEDDED } from "./embedded-data.js";
import { MANIFEST_PATHS, PHASES, SNOW_MANIFESTS } from "./config.js";
import { clone, fetchJson } from "./utils.js";

const PLAYER_FILE = "player.json";

export async function loadEditorData(phaseId, manifestRequest = {}) {
    const phase = PHASES[phaseId] ?? PHASES.first;
    const basePath = manifestRequest.basePath ?? MANIFEST_PATHS.advanced;
    const stageFile = manifestRequest.stageFile ?? phase.stageFile;
    const enemiesFile = manifestRequest.enemiesFile ?? phase.enemiesFile;
    const playerFile = manifestRequest.playerFile ?? PLAYER_FILE;
    const [stage, enemies, player, snow] = await Promise.all([
        loadAdvancedFile(stageFile, basePath),
        loadAdvancedFile(enemiesFile, basePath),
        loadAdvancedFile(playerFile, basePath),
        loadSnowCatalogs(),
    ]);

    return {
        stage,
        enemies,
        player,
        snow,
        phase,
    };
}

export async function loadSnowCatalogs() {
    const entries = await Promise.all(
        Object.entries(SNOW_MANIFESTS).map(async ([key, fileName]) => {
            const data = await loadSnowFile(fileName, key);
            return [key, data];
        })
    );

    return Object.fromEntries(entries);
}

async function loadAdvancedFile(fileName, basePath = MANIFEST_PATHS.advanced) {
    const path = `${basePath}${fileName}`;
    return loadWithFallback(path, EMBEDDED.files?.[fileName]);
}

async function loadSnowFile(fileName, fallbackKey) {
    const path = `${MANIFEST_PATHS.snow}${fileName}`;
    return loadWithFallback(path, EMBEDDED.snow?.[fallbackKey]);
}

async function loadWithFallback(path, fallback) {
    try {
        return await fetchJson(path);
    } catch (error) {
        if (fallback) return clone(fallback);
        throw new Error(`Nao foi possivel carregar ${path}: ${error.message}`);
    }
}
