import { PHASES } from "./config.js";
import { clone, snapValue } from "./utils.js";

export class EditorState {
    constructor() {
        this.phaseId = "first";
        this.stage = normalizeStage();
        this.enemies = normalizeEnemies();
        this.player = normalizePlayer();
        this.mode = "all";
        this.filter = "all";
        this.selectedRef = null;
        this.camera = { x: 0, y: 120, zoom: 0.85 };
        this.drag = null;
        this.mouse = { x: 0, y: 0, wx: 0, wy: 0 };
        this.snap = 5;
        this.images = {};
    }

    loadPhase(phaseId, data) {
        this.phaseId = PHASES[phaseId] ? phaseId : "first";
        this.stage = normalizeStage(clone(data.stage));
        this.enemies = normalizeEnemies(clone(data.enemies));
        this.player = normalizePlayer(clone(data.player));
        this.selectedRef = null;
        this.camera = { x: 0, y: 120, zoom: 0.85 };
        this.drag = null;
    }

    stageFileName() {
        return PHASES[this.phaseId]?.stageFile ?? PHASES.first.stageFile;
    }

    enemiesFileName() {
        return PHASES[this.phaseId]?.enemiesFile ?? PHASES.first.enemiesFile;
    }

    activeDocument(key) {
        if (key === "enemies") return this.enemies;
        if (key === "player") return this.player;
        return this.stage;
    }

    setActiveDocument(key, value) {
        if (key === "enemies") this.enemies = normalizeEnemies(value);
        else if (key === "player") this.player = normalizePlayer(value);
        else this.stage = normalizeStage(value);

        this.selectedRef = null;
    }

    entities() {
        const entities = [];
        (this.stage.parallax?.layers ?? []).forEach((ref, index) => entities.push({ type: "parallax", index, ref }));
        (this.stage.platforms ?? []).forEach((ref, index) => entities.push({ type: "platform", index, ref }));
        (this.stage.objects ?? []).forEach((ref, index) => entities.push({ type: "object", index, ref }));
        (this.enemies.enemies ?? []).forEach((ref, index) => entities.push({ type: "enemy", index, ref }));
        if (this.player.player?.spawn) entities.push({ type: "player", index: 0, ref: this.player.player.spawn });
        return entities;
    }

    selectableEntities() {
        return this.entities()
            .filter(entity => this.filter === "all" || entity.type === this.filter)
            .filter(entity => {
                if (this.mode === "all") return true;
                if (this.mode === "stage") return ["platform", "object"].includes(entity.type);
                if (this.mode === "enemies") return entity.type === "enemy";
                if (this.mode === "player") return entity.type === "player";
                if (this.mode === "parallax") return entity.type === "parallax";
                return true;
            });
    }

    selected() {
        if (!this.selectedRef) return null;
        return this.entities().find(entity => (
            entity.type === this.selectedRef.type && entity.index === this.selectedRef.index
        )) ?? null;
    }

    select(type, index) {
        this.selectedRef = { type, index };
    }

    clearSelection() {
        this.selectedRef = null;
    }

    addPlatform() {
        this.stage.platforms ??= [];
        this.stage.platforms.push({
            id: `platform_${this.stage.platforms.length + 1}`,
            x: this.snapWorld(this.camera.x + 120),
            y: this.snapWorld(this.camera.y + 330),
            width: 180,
            height: 24,
            solid: true,
            visible: true,
            material: "ice",
            terrain: "snow_platform",
        });
        this.select("platform", this.stage.platforms.length - 1);
    }

    addObject(catalogItem) {
        if (!catalogItem) return;

        this.stage.objects ??= [];
        const object = {
            id: `${catalogItem.name}_${this.stage.objects.length + 1}`,
            x: this.snapWorld(this.camera.x + 160),
            y: this.snapWorld(this.camera.y + 280),
            width: (catalogItem.rect?.width ?? 32) * 2,
            height: (catalogItem.rect?.height ?? 32) * 2,
            visible: true,
            solid: false,
            zIndex: 25,
        };
        object[catalogItem.kind] = catalogItem.name;
        this.stage.objects.push(object);
        this.select("object", this.stage.objects.length - 1);
    }

    addEnemy() {
        this.enemies.enemies ??= [];
        this.enemies.enemies.push({
            id: `kobold_${String(this.enemies.enemies.length + 1).padStart(2, "0")}`,
            x: this.snapWorld(this.camera.x + 220),
            y: this.snapWorld(this.camera.y + 200),
        });
        this.select("enemy", this.enemies.enemies.length - 1);
    }

    addParallax() {
        this.stage.parallax ??= { layers: [] };
        this.stage.parallax.layers ??= [];
        this.stage.parallax.layers.push({
            id: `layer_${this.stage.parallax.layers.length + 1}`,
            sprite: "snow_03",
            x: 0,
            y: 300,
            width: 640,
            height: 88,
            scrollRatioX: 0.3,
            scrollRatioY: 0.05,
            repeatX: true,
        });
        this.select("parallax", this.stage.parallax.layers.length - 1);
    }

    removeSelected() {
        const selected = this.selected();
        if (!selected || selected.type === "player") return false;

        this.collectionFor(selected.type).splice(selected.index, 1);
        this.clearSelection();
        return true;
    }

    duplicateSelected() {
        const selected = this.selected();
        if (!selected || selected.type === "player") return false;

        const copy = clone(selected.ref);
        copy.id = `${copy.id ?? selected.type}_copy`;
        copy.x = (copy.x ?? 0) + 40;
        copy.y = (copy.y ?? 0) + 20;

        const collection = this.collectionFor(selected.type);
        collection.push(copy);
        this.select(selected.type, collection.length - 1);
        return true;
    }

    collectionFor(type) {
        if (type === "platform") return this.stage.platforms;
        if (type === "object") return this.stage.objects;
        if (type === "enemy") return this.enemies.enemies;
        if (type === "parallax") return this.stage.parallax.layers;
        return [];
    }

    snapWorld(value) {
        return snapValue(value, this.snap);
    }
}

export function normalizeStage(value = {}) {
    const stage = value ?? {};
    stage.platforms ??= [];
    stage.objects ??= [];
    stage.parallax ??= { layers: [] };
    stage.parallax.layers ??= [];
    stage.materials ??= [];
    return stage;
}

export function normalizeEnemies(value = {}) {
    const enemies = value ?? {};
    enemies.enemyDefaults ??= {};
    enemies.enemies ??= [];
    return enemies;
}

export function normalizePlayer(value = {}) {
    const playerDoc = value ?? {};
    playerDoc.player ??= {};
    playerDoc.player.spawn ??= { x: 100, y: 300 };
    playerDoc.player.movement ??= {};
    playerDoc.player.stats ??= {};
    return playerDoc;
}
