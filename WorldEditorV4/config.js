export const PHASES = Object.freeze({
    first: {
        label: "Fase 1",
        stageFile: "stage.json",
        enemiesFile: "enemies.json",
    },
    second: {
        label: "Fase 2",
        stageFile: "second-stage.json",
        enemiesFile: "second-enemies.json",
    },
    boss: {
        label: "Boss",
        stageFile: "boss-stage.json",
        enemiesFile: "boss-enemies.json",
    },
});

export const MANIFEST_PROFILES = Object.freeze({
    advanced: {
        label: "Advanced Snow",
        basePath: "DemoAdvanced/Assets/Manifests/advanced/",
        playerFile: "player.json",
        usePhaseFiles: true,
    },
    custom: {
        label: "Personalizado",
        basePath: "DemoAdvanced/Assets/Manifests/advanced/",
        stageFile: "stage.json",
        enemiesFile: "enemies.json",
        playerFile: "player.json",
        usePhaseFiles: false,
    },
});

export const MANIFEST_PATHS = Object.freeze({
    advanced: "DemoAdvanced/Assets/Manifests/advanced/",
    snow: "DemoAdvanced/Assets/Manifests/snow/",
});

export const SNOW_MANIFESTS = Object.freeze({
    objects: "objects.json",
    terrain: "terrain.json",
    vegetation: "vegetation.json",
    standards: "standards.json",
    backgrounds: "backgrounds.json",
});

export const IMAGE_MAP = Object.freeze({
    snow_sky: "DemoAdvanced/Assets/Snow Pack/Background parts/sky.png",
    snow_mountain_01: "DemoAdvanced/Assets/Snow Pack/Background parts/Mountain 01.png",
    snow_mountain_02: "DemoAdvanced/Assets/Snow Pack/Background parts/Mountain 02.png",
    snow_01: "DemoAdvanced/Assets/Snow Pack/Background parts/Snow 01.png",
    snow_02: "DemoAdvanced/Assets/Snow Pack/Background parts/Snow 02.png",
    snow_03: "DemoAdvanced/Assets/Snow Pack/Background parts/Snow 03.png",
    snow_objects: "DemoAdvanced/Assets/Snow Pack/Objects.png",
    snow_standards: "DemoAdvanced/Assets/Snow Pack/Standards.png",
    snow_tileset: "DemoAdvanced/Assets/Snow Pack/Tileset Terrain (16x16).png",
    snow_vegetation: "DemoAdvanced/Assets/Snow Pack/Vegetation.png",
    heroi_idle: "DemoAdvanced/Assets/Player/IDLE.png",
    enemy_idle: "DemoAdvanced/Assets/Kobold/IDLE.png",
});

export const PLAYER_PREVIEW = Object.freeze({
    asset: "heroi_idle",
    frames: 7,
    frameW: 96,
    frameH: 84,
    pivotX: 0.5,
    pivotY: 1,
    groundOffset: 37,
});

export const ENEMY_PREVIEW = Object.freeze({
    asset: "enemy_idle",
    frames: 6,
    frameW: 148,
    frameH: 96,
    pivotX: 0.5,
    pivotY: 1,
    groundOffset: 5,
    drawOffsetX: 22,
});
