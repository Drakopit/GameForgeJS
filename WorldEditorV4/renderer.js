import { ENEMY_PREVIEW, PLAYER_PREVIEW } from "./config.js";

export class WorldRenderer {
    constructor({ canvas, wrap, hud, state, catalog }) {
        this.canvas = canvas;
        this.wrap = wrap;
        this.hud = hud;
        this.state = state;
        this.catalog = catalog;
        this.ctx = canvas.getContext("2d");
    }

    resize() {
        const rect = this.wrap.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = Math.max(1, Math.floor(rect.width * dpr));
        this.canvas.height = Math.max(1, Math.floor(rect.height * dpr));
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.draw();
    }

    screenX(x) {
        return (x - this.state.camera.x) * this.state.camera.zoom;
    }

    screenY(y) {
        return (y - this.state.camera.y) * this.state.camera.zoom;
    }

    worldX(x) {
        return x / this.state.camera.zoom + this.state.camera.x;
    }

    worldY(y) {
        return y / this.state.camera.zoom + this.state.camera.y;
    }

    draw() {
        const ctx = this.ctx;
        const rect = this.wrap.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, rect.width, rect.height);

        this.drawParallax();
        this.drawTilemapGrid();
        this.drawPlatforms();
        this.drawObjects();
        this.drawEnemies();
        this.drawPlayer();
        this.drawSelection();
        this.drawHud();
    }

    drawParallax() {
        if (!(this.state.filter === "all" || this.state.filter === "parallax")) return;

        const layers = this.state.stage.parallax?.layers ?? [];
        for (const layer of layers) {
            const image = this.state.images[layer.sprite];
            const x = this.screenX(layer.x + (this.state.camera.x * (1 - (layer.scrollRatioX ?? 0))));
            const y = this.screenY(layer.y + (this.state.camera.y * (1 - (layer.scrollRatioY ?? 0))));
            const width = layer.width * this.state.camera.zoom;
            const height = layer.height * this.state.camera.zoom;

            if (image?.complete && image.naturalWidth) {
                if (layer.repeatX && width > 0) {
                    for (let xx = x % width - width; xx < this.wrap.clientWidth + width; xx += width) {
                        this.ctx.drawImage(image, xx, y, width, height);
                    }
                } else {
                    this.ctx.drawImage(image, x, y, width, height);
                }
            } else {
                this.ctx.fillStyle = "rgba(245, 158, 11, 0.08)";
                this.ctx.fillRect(this.screenX(layer.x), this.screenY(layer.y), width, height);
            }
        }
    }

    drawPlatforms() {
        if (!(this.state.filter === "all" || this.state.filter === "platform")) return;

        for (const platform of this.state.stage.platforms ?? []) {
            if (!this.drawTerrain(platform)) {
                this.drawRect(platform, "#60a5fa", 0.18);
            }
            this.ctx.strokeStyle = "#60a5fa";
            this.ctx.strokeRect(
                this.screenX(platform.x),
                this.screenY(platform.y),
                platform.width * this.state.camera.zoom,
                platform.height * this.state.camera.zoom
            );
        }
    }

    drawObjects() {
        if (!(this.state.filter === "all" || this.state.filter === "object")) return;

        const objects = [...(this.state.stage.objects ?? [])].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
        for (const object of objects) {
            if (!this.drawSprite(object)) {
                this.drawRect(object, "#a78bfa", 0.18);
            } else {
                this.ctx.strokeStyle = "#a78bfa";
                this.ctx.strokeRect(
                    this.screenX(object.x),
                    this.screenY(object.y),
                    object.width * this.state.camera.zoom,
                    object.height * this.state.camera.zoom
                );
            }
        }
    }

    drawEnemies() {
        if (!(this.state.filter === "all" || this.state.filter === "enemy")) return;

        for (const enemy of this.state.enemies.enemies ?? []) {
            const body = this.entityBody("enemy", enemy);
            if (!this.drawEntitySprite("enemy", enemy)) {
                this.drawRect(body, "#ef4444", 0.2);
            }
            this.ctx.strokeStyle = "#ef4444";
            this.ctx.strokeRect(
                this.screenX(body.x),
                this.screenY(body.y),
                body.width * this.state.camera.zoom,
                body.height * this.state.camera.zoom
            );
            this.drawLabel(enemy.id, enemy.x, enemy.y - 12, "#fecaca");
        }
    }

    drawPlayer() {
        const spawn = this.state.player.player?.spawn;
        if (!spawn || !(this.state.filter === "all" || this.state.filter === "player")) return;

        const body = this.entityBody("player", spawn);
        if (!this.drawEntitySprite("player", spawn)) {
            this.drawRect(body, "#22c55e", 0.25);
        }
        this.ctx.strokeStyle = "#22c55e";
        this.ctx.strokeRect(
            this.screenX(body.x),
            this.screenY(body.y),
            body.width * this.state.camera.zoom,
            body.height * this.state.camera.zoom
        );
        this.drawLabel("player", spawn.x, spawn.y - 12, "#bbf7d0");
    }

    drawSelection() {
        const selected = this.state.selected();
        if (!selected) return;

        const box = this.visualBox(selected);
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(
            this.screenX(box.x),
            this.screenY(box.y),
            (box.width ?? 32) * this.state.camera.zoom,
            (box.height ?? 32) * this.state.camera.zoom
        );
        ctx.setLineDash([]);
        ctx.fillStyle = "#facc15";
        ctx.fillRect(
            this.screenX((box.x ?? 0) + (box.width ?? 32)) - 6,
            this.screenY((box.y ?? 0) + (box.height ?? 32)) - 6,
            12,
            12
        );
        ctx.restore();
    }

    drawSprite(ref, alpha = 1) {
        const name = ref.spriteRef ?? ref.animationRef;
        if (!name) return false;

        const item = this.catalog.find(name);
        if (!item || item.terrainSet) return false;

        const image = this.state.images[item.atlasSprite];
        const rect = item.rect;
        if (!image?.complete || !image.naturalWidth || !rect) return false;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.drawImage(
            image,
            rect.x ?? 0,
            rect.y ?? 0,
            rect.width ?? ref.width,
            rect.height ?? ref.height,
            this.screenX(ref.x),
            this.screenY(ref.y),
            ref.width * this.state.camera.zoom,
            ref.height * this.state.camera.zoom
        );
        this.ctx.restore();
        return true;
    }

    drawTerrain(ref) {
        const item = this.catalog.find(ref.terrain ?? "");
        if (!item?.terrainSet) return false;

        const image = this.state.images[item.atlasSprite];
        if (!image?.complete || !image.naturalWidth) return false;

        const tileWidth = item.tileWidth ?? 16;
        const tileHeight = item.tileHeight ?? 16;
        const columns = Math.max(1, Math.ceil(ref.width / tileWidth));
        const rows = Math.max(1, Math.ceil(ref.height / tileHeight));

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(
            this.screenX(ref.x),
            this.screenY(ref.y),
            ref.width * this.state.camera.zoom,
            ref.height * this.state.camera.zoom
        );
        this.ctx.clip();

        for (let row = 0; row < rows; row += 1) {
            for (let column = 0; column < columns; column += 1) {
                const tileName = this.tileNameFor(item, row, column, rows, columns);
                const tile = item.tiles[tileName];
                if (!tile) continue;

                this.ctx.drawImage(
                    image,
                    tile.x,
                    tile.y,
                    tile.width,
                    tile.height,
                    this.screenX(ref.x + column * tileWidth),
                    this.screenY(ref.y + row * tileHeight),
                    tileWidth * this.state.camera.zoom,
                    tileHeight * this.state.camera.zoom
                );
            }
        }

        this.ctx.restore();
        return true;
    }

    tileNameFor(item, row, column, rows, columns) {
        const vertical = row === 0 ? "top" : row === rows - 1 ? "bottom" : "middle";
        const horizontal = column === 0 ? "Left" : column === columns - 1 ? "Right" : "";
        const key = horizontal ? `${vertical}${horizontal}` : vertical;
        return item.terrainSet.tiles?.[key]
            ?? item.terrainSet.tiles?.middle
            ?? item.terrainSet.tiles?.top;
    }

    drawTilemapGrid() {
        const world = this.state.stage.world;
        const tilemap = this.state.stage.tilemap;
        if (!world || !tilemap || !(this.state.filter === "all" || this.state.filter === "platform")) return;

        const image = this.state.images[tilemap.sprite];
        const tileWidth = tilemap.tileWidth ?? world.cell ?? 64;
        const tileHeight = tilemap.tileHeight ?? world.cell ?? 64;
        const groundTiles = tilemap.groundTiles ?? [{ x: 0, y: 0 }];
        const tiles = tilemap.tiles ?? {};
        const blockedTile = tilemap.blockedTile ?? tiles[tilemap.blockedTileId] ?? groundTiles[0];
        const terrainRows = tilemap.terrainRows ?? tilemap.terrain ?? null;
        const blocked = new Set(tilemap.blockedTiles ?? []);
        const cell = world.cell ?? 64;
        const originX = world.originX ?? 0;
        const originY = world.originY ?? 0;

        for (let row = 0; row < (world.rows ?? 0); row += 1) {
            for (let col = 0; col < (world.cols ?? 0); col += 1) {
                const x = originX + col * cell;
                const y = originY + row * cell;
                const tileId = terrainRows?.[row]?.[col] ?? null;
                const tile = tileId
                    ? (tiles[tileId] ?? groundTiles[0])
                    : blocked.has(`${col},${row}`)
                        ? blockedTile
                        : groundTiles[(row * 3 + col * 5) % groundTiles.length];

                if (image?.complete && image.naturalWidth) {
                    this.ctx.drawImage(
                        image,
                        tile.x ?? 0,
                        tile.y ?? 0,
                        tile.width ?? tileWidth,
                        tile.height ?? tileHeight,
                        this.screenX(x),
                        this.screenY(y),
                        cell * this.state.camera.zoom,
                        cell * this.state.camera.zoom
                    );
                } else {
                    this.ctx.fillStyle = blocked.has(`${col},${row}`)
                        ? "rgba(148, 163, 184, 0.28)"
                        : "rgba(34, 197, 94, 0.18)";
                    this.ctx.fillRect(
                        this.screenX(x),
                        this.screenY(y),
                        cell * this.state.camera.zoom,
                        cell * this.state.camera.zoom
                    );
                }

                this.ctx.strokeStyle = blocked.has(`${col},${row}`)
                    ? "rgba(15, 23, 42, 0.55)"
                    : "rgba(15, 23, 42, 0.28)";
                this.ctx.strokeRect(
                    this.screenX(x),
                    this.screenY(y),
                    cell * this.state.camera.zoom,
                    cell * this.state.camera.zoom
                );
            }
        }
    }

    drawEntitySprite(type, ref) {
        const profilePreview = type === "player"
            ? this.state.profile?.playerPreview ?? PLAYER_PREVIEW
            : this.state.profile?.enemyPreview ?? ENEMY_PREVIEW;
        const manifestRoot = type === "player" ? this.state.player.player ?? {} : this.state.enemies.enemyDefaults ?? {};
        const config = {
            ...profilePreview,
            asset: ref.asset ?? manifestRoot.asset ?? profilePreview.asset,
        };
        const image = this.state.images[config.asset];
        const body = this.entityBody(type, ref);
        if (!image?.complete || !image.naturalWidth) return false;

        const scale = type === "player"
            ? Number(this.state.player.player?.scale ?? 1.7)
            : Number(ref.scale ?? this.state.enemies.enemyDefaults?.scale ?? 1);
        const frame = ref.frame ?? manifestRoot.frame ?? null;
        const frameWidth = frame?.width ?? config.frameW ?? image.naturalWidth / config.frames;
        const frameHeight = frame?.height ?? config.frameH ?? image.naturalHeight;
        const drawWidth = frameWidth * scale;
        const drawHeight = frameHeight * scale;
        const drawOffsetX = type === "enemy" ? (this.state.enemies.enemyDefaults?.render?.drawOffsetX ?? 0) : 0;
        const drawX = body.x + body.width / 2 - drawWidth * config.pivotX + drawOffsetX;
        const drawY = body.y + body.height - drawHeight * config.pivotY + config.groundOffset;

        this.ctx.drawImage(
            image,
            frame?.x ?? 0,
            frame?.y ?? 0,
            frameWidth,
            frameHeight,
            this.screenX(drawX),
            this.screenY(drawY),
            drawWidth * this.state.camera.zoom,
            drawHeight * this.state.camera.zoom
        );
        return true;
    }

    drawRect(entity, color, fillAlpha = 0.22) {
        this.ctx.save();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = fillAlpha;
        this.ctx.fillRect(
            this.screenX(entity.x),
            this.screenY(entity.y),
            (entity.width ?? 32) * this.state.camera.zoom,
            (entity.height ?? 32) * this.state.camera.zoom
        );
        this.ctx.globalAlpha = 1;
        this.ctx.strokeRect(
            this.screenX(entity.x),
            this.screenY(entity.y),
            (entity.width ?? 32) * this.state.camera.zoom,
            (entity.height ?? 32) * this.state.camera.zoom
        );
        this.ctx.restore();
    }

    drawLabel(text, x, y, color) {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = "12px Segoe UI";
        ctx.fillStyle = "rgba(2, 6, 23, 0.85)";
        const width = ctx.measureText(text).width + 8;
        ctx.fillRect(this.screenX(x), this.screenY(y) - 14, width, 18);
        ctx.fillStyle = color;
        ctx.fillText(text, this.screenX(x) + 4, this.screenY(y));
        ctx.restore();
    }

    drawHud() {
        this.hud.innerHTML = [
            `Cam: ${Math.round(this.state.camera.x)}, ${Math.round(this.state.camera.y)}`,
            `Mouse: ${Math.round(this.state.mouse.wx)}, ${Math.round(this.state.mouse.wy)}`,
            `Zoom: ${this.state.camera.zoom.toFixed(2)}`,
            `Modo: ${this.state.mode}`,
        ].join(" - ");
    }

    hitTest(mouseX, mouseY) {
        const worldX = this.worldX(mouseX);
        const worldY = this.worldY(mouseY);
        const entities = this.state.selectableEntities().slice().reverse();

        for (const entity of entities) {
            const box = this.visualBox(entity);
            const width = box.width ?? 32;
            const height = box.height ?? 32;
            if (worldX >= box.x && worldX <= box.x + width && worldY >= box.y && worldY <= box.y + height) {
                return entity;
            }
        }

        return null;
    }

    visualBox(entity) {
        if (entity.type === "enemy") return this.entityBody("enemy", entity.ref);
        if (entity.type === "player") return this.entityBody("player", entity.ref);
        return entity.ref;
    }

    entityBody(type, ref) {
        if (type === "enemy") {
            const defaults = this.state.enemies.enemyDefaults ?? {};
            return {
                x: ref.x,
                y: ref.y,
                width: defaults.bodySize?.width ?? 64,
                height: defaults.bodySize?.height ?? 64,
            };
        }

        if (type === "player") {
            const player = this.state.player.player ?? {};
            return {
                x: ref.x,
                y: ref.y,
                width: player.bodySize?.width ?? 26,
                height: player.bodySize?.height ?? 37,
            };
        }

        return ref;
    }
}
