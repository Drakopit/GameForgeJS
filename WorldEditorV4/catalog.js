export class AssetCatalog {
    constructor(snowData = {}) {
        this.snowData = snowData;
        this.items = [];
        this.rebuild(snowData);
    }

    rebuild(snowData = this.snowData) {
        this.snowData = snowData;
        this.items = buildCatalog(snowData);
    }

    all() {
        return this.items;
    }

    find(name) {
        return this.items.find(item => item.name === name) ?? null;
    }

    objectOptions() {
        return this.items
            .filter(item => item.kind !== "terrain")
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    terrainOptions() {
        return this.items
            .filter(item => item.kind === "terrain")
            .sort((a, b) => a.name.localeCompare(b.name));
    }
}

function buildCatalog(snowData) {
    const catalog = [];
    for (const group of Object.values(snowData ?? {})) {
        const atlases = group?.atlases ?? {};

        for (const atlas of Object.values(atlases)) {
            addSprites(catalog, atlas);
            addAnimations(catalog, atlas);
            addTerrainSets(catalog, atlas);
        }
    }

    return catalog;
}

function addSprites(catalog, atlas) {
    for (const [name, rect] of Object.entries(atlas.sprites ?? {})) {
        catalog.push({
            kind: "spriteRef",
            name,
            atlasSprite: atlas.sprite,
            rect,
        });
    }
}

function addAnimations(catalog, atlas) {
    for (const [name, animation] of Object.entries(atlas.animations ?? {})) {
        catalog.push({
            kind: "animationRef",
            name,
            atlasSprite: atlas.sprite,
            rect: animation.source,
            animation,
        });
    }
}

function addTerrainSets(catalog, atlas) {
    for (const [name, terrainSet] of Object.entries(atlas.terrainSets ?? {})) {
        catalog.push({
            kind: "terrain",
            name,
            atlasSprite: atlas.sprite,
            tileWidth: atlas.tileWidth ?? 16,
            tileHeight: atlas.tileHeight ?? 16,
            tiles: atlas.tiles ?? {},
            terrainSet,
        });
    }
}
