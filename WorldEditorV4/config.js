export const ADVANCED_PHASES = Object.freeze({
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

export const TACTICAL_PHASES = Object.freeze({
    skirmish: {
        label: "Tiny Swords Skirmish",
        stageFile: "stage.json",
        enemiesFile: "enemies.json",
    },
});

export const PHASES = ADVANCED_PHASES;

export const MANIFEST_PROFILES = Object.freeze({
    advanced: {
        label: "Advanced Snow",
        basePath: "DemoAdvanced/Assets/Manifests/advanced/",
        playerFile: "player.json",
        usePhaseFiles: true,
    },
    tactical: {
        label: "Tactical Tiny Swords",
        basePath: "DemoTacticalRPG/Assets/Manifests/tactical/",
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
    tactical: "DemoTacticalRPG/Assets/Manifests/tactical/",
});

export const SNOW_MANIFESTS = Object.freeze({
    objects: "objects.json",
    terrain: "terrain.json",
    vegetation: "vegetation.json",
    standards: "standards.json",
    backgrounds: "backgrounds.json",
});

export const ADVANCED_IMAGE_MAP = Object.freeze({
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

export const TACTICAL_IMAGE_MAP = Object.freeze({
    tactical_tilemap_color1: "DemoTacticalRPG/Assets/Tiny Swords/Terrain/Tileset/Tilemap_color1.png",
    tactical_shadow: "DemoTacticalRPG/Assets/Tiny Swords/Terrain/Tileset/Shadow.png",
    tactical_cursor: "DemoTacticalRPG/Assets/Tiny Swords/UI Elements/UI Elements/Cursors/Cursor_01.png",
    tactical_banner: "DemoTacticalRPG/Assets/Tiny Swords/UI Elements/UI Elements/Banners/Banner.png",
    blue_house1: "DemoTacticalRPG/Assets/Tiny Swords/Buildings/Blue Buildings/House1.png",
    blue_tower: "DemoTacticalRPG/Assets/Tiny Swords/Buildings/Blue Buildings/Tower.png",
    red_barracks: "DemoTacticalRPG/Assets/Tiny Swords/Buildings/Red Buildings/Barracks.png",
    tree_1: "DemoTacticalRPG/Assets/Tiny Swords/Terrain/Resources/Wood/Trees/Tree1.png",
    tree_2: "DemoTacticalRPG/Assets/Tiny Swords/Terrain/Resources/Wood/Trees/Tree2.png",
    bush_1: "DemoTacticalRPG/Assets/Tiny Swords/Terrain/Decorations/Bushes/Bushe1.png",
    rock_1: "DemoTacticalRPG/Assets/Tiny Swords/Terrain/Decorations/Rocks/Rock1.png",
    gold_resource: "DemoTacticalRPG/Assets/Tiny Swords/Terrain/Resources/Gold/Gold Resource/Gold_Resource.png",
    blue_warrior_idle: "DemoTacticalRPG/Assets/Tiny Swords/Units/Blue Units/Warrior/Warrior_Idle.png",
    blue_warrior_run: "DemoTacticalRPG/Assets/Tiny Swords/Units/Blue Units/Warrior/Warrior_Run.png",
    red_warrior_idle: "DemoTacticalRPG/Assets/Tiny Swords/Units/Red Units/Warrior/Warrior_Idle.png",
    red_warrior_run: "DemoTacticalRPG/Assets/Tiny Swords/Units/Red Units/Warrior/Warrior_Run.png",
    red_lancer_idle: "DemoTacticalRPG/Assets/Tiny Swords/Units/Red Units/Lancer/Lancer_Idle.png",
    red_lancer_run: "DemoTacticalRPG/Assets/Tiny Swords/Units/Red Units/Lancer/Lancer_Run.png",
    red_archer_idle: "DemoTacticalRPG/Assets/Tiny Swords/Units/Red Units/Archer/Archer_Idle.png",
    red_archer_run: "DemoTacticalRPG/Assets/Tiny Swords/Units/Red Units/Archer/Archer_Run.png",
});

export const IMAGE_MAP = ADVANCED_IMAGE_MAP;

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

export const TACTICAL_PLAYER_PREVIEW = Object.freeze({
    asset: "blue_warrior_idle",
    frames: 8,
    frameW: 192,
    frameH: 192,
    pivotX: 0.5,
    pivotY: 1,
    groundOffset: 22,
});

export const TACTICAL_ENEMY_PREVIEW = Object.freeze({
    asset: "red_warrior_idle",
    frames: 8,
    frameW: 192,
    frameH: 192,
    pivotX: 0.5,
    pivotY: 1,
    groundOffset: 22,
});

export const DEFAULT_PROFILE_ID = "advanced";

export const EDITOR_PROFILES = Object.freeze({
    advanced: {
        id: "advanced",
        label: "Advanced Snow",
        basePath: MANIFEST_PATHS.advanced,
        playerFile: "player.json",
        phases: ADVANCED_PHASES,
        defaultPhaseId: "first",
        catalogBasePath: MANIFEST_PATHS.snow,
        catalogFiles: SNOW_MANIFESTS,
        imageMap: ADVANCED_IMAGE_MAP,
        playerPreview: PLAYER_PREVIEW,
        enemyPreview: ENEMY_PREVIEW,
        camera: { x: 0, y: 120, zoom: 0.85 },
        defaults: {
            platform: {
                width: 180,
                height: 24,
                material: "ice",
                terrain: "snow_platform",
            },
            enemy: {
                idPrefix: "kobold",
                width: 64,
                height: 64,
            },
            parallax: {
                sprite: "snow_03",
                width: 640,
                height: 88,
                y: 300,
            },
        },
    },
    tactical: {
        id: "tactical",
        label: "Tactical Tiny Swords",
        basePath: MANIFEST_PATHS.tactical,
        playerFile: "player.json",
        phases: TACTICAL_PHASES,
        defaultPhaseId: "skirmish",
        catalogBasePath: MANIFEST_PATHS.tactical,
        catalogFiles: { tactical: "catalog.json" },
        imageMap: TACTICAL_IMAGE_MAP,
        playerPreview: TACTICAL_PLAYER_PREVIEW,
        enemyPreview: TACTICAL_ENEMY_PREVIEW,
        camera: { x: -10, y: -20, zoom: 1.1 },
        defaults: {
            platform: {
                width: 60,
                height: 60,
                material: "grass",
                terrain: "tiny_grass_platform",
            },
            enemy: {
                idPrefix: "red_unit",
                width: 48,
                height: 56,
                asset: "red_warrior_idle",
            },
            parallax: {
                sprite: "tactical_tilemap_color1",
                width: 640,
                height: 120,
                y: 380,
            },
        },
    },
    custom: {
        id: "custom",
        label: "Personalizado",
        basePath: MANIFEST_PATHS.advanced,
        playerFile: "player.json",
        phases: ADVANCED_PHASES,
        defaultPhaseId: "first",
        catalogBasePath: MANIFEST_PATHS.snow,
        catalogFiles: SNOW_MANIFESTS,
        imageMap: ADVANCED_IMAGE_MAP,
        playerPreview: PLAYER_PREVIEW,
        enemyPreview: ENEMY_PREVIEW,
        camera: { x: 0, y: 120, zoom: 0.85 },
        defaults: {
            platform: {
                width: 180,
                height: 24,
                material: "ice",
                terrain: "snow_platform",
            },
            enemy: {
                idPrefix: "enemy",
                width: 64,
                height: 64,
            },
            parallax: {
                sprite: "snow_03",
                width: 640,
                height: 88,
                y: 300,
            },
        },
    },
});
