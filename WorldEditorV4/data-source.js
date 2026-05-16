import { EMBEDDED } from "./embedded-data.js";
import { DEFAULT_PROFILE_ID, EDITOR_PROFILES, MANIFEST_PATHS, PHASES, SNOW_MANIFESTS } from "./config.js";
import { clone, fetchJson } from "./utils.js";

const PLAYER_FILE = "player.json";

export async function loadEditorData(phaseId, manifestRequest = {}) {
    const profileId = manifestRequest.profileId ?? DEFAULT_PROFILE_ID;
    const profile = EDITOR_PROFILES[profileId] ?? EDITOR_PROFILES[DEFAULT_PROFILE_ID];
    const phases = profile.phases ?? PHASES;
    const fallbackPhaseId = profile.defaultPhaseId ?? Object.keys(phases)[0] ?? "first";
    const resolvedPhaseId = phases[phaseId] ? phaseId : fallbackPhaseId;
    const phase = phases[resolvedPhaseId] ?? phases[fallbackPhaseId] ?? PHASES.first;
    const basePath = manifestRequest.basePath ?? profile.basePath ?? MANIFEST_PATHS.advanced;
    const stageFile = manifestRequest.stageFile ?? phase.stageFile;
    const enemiesFile = manifestRequest.enemiesFile ?? phase.enemiesFile;
    const playerFile = manifestRequest.playerFile ?? profile.playerFile ?? PLAYER_FILE;
    const [stage, enemies, player, snow] = await Promise.all([
        loadProfileFile(stageFile, basePath, profile),
        loadProfileFile(enemiesFile, basePath, profile),
        loadProfileFile(playerFile, basePath, profile),
        loadProfileCatalogs(profile),
    ]);

    return {
        stage,
        enemies,
        player,
        snow,
        phase,
        phaseId: resolvedPhaseId,
        profile,
        profileId: profile.id,
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

async function loadProfileFile(fileName, basePath, profile) {
    const path = `${basePath}${fileName}`;
    return loadWithFallback(path, embeddedFileFallback(fileName, profile));
}

async function loadProfileCatalogs(profile) {
    const catalogBasePath = profile.catalogBasePath ?? MANIFEST_PATHS.snow;
    const catalogFiles = profile.catalogFiles ?? SNOW_MANIFESTS;
    const entries = await Promise.all(
        Object.entries(catalogFiles).map(async ([key, fileName]) => {
            const path = `${catalogBasePath}${fileName}`;
            const data = await loadWithFallback(path, embeddedCatalogFallback(key, profile));
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

function embeddedFileFallback(fileName, profile) {
    return profile.id === "advanced" || profile.id === "custom"
        ? EMBEDDED.files?.[fileName]
        : null;
}

function embeddedCatalogFallback(key, profile) {
    return profile.id === "advanced" || profile.id === "custom"
        ? EMBEDDED.snow?.[key]
        : null;
}
