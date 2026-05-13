import { AssetManager } from "../../Root/AssetManager.js";
import { Block } from "../Block.js";
import { Enemy } from "../Enemy.js";

export class LevelBuilder {
    constructor(level) {
        this.level = level;

        if (!this.level.blocks) this.level.blocks = [];
        if (!this.level.enemies) this.level.enemies = [];
    }

    SetBackground(imageName) {
        this.level.bgImage = AssetManager.instance.GetImage(imageName);
        return this;
    }

    AddPlatform(x, y, width, height) {
        const platform = typeof x === "object"
            ? x
            : { x, y, width, height };

        const block = new Block(
            this.level.screen,
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );

        block.id = platform.id ?? block.id;
        this.level.blocks.push(block);
        this.level.AddEntity(block);
        return this;
    }

    AddPlatforms(platforms = []) {
        platforms.forEach(platform => this.AddPlatform(platform));
        return this;
    }

    AddEnemy(x, y, config = {}) {
        const spawn = typeof x === "object"
            ? x
            : { x, y };

        const enemy = new Enemy(this.level.screen, this.level.player, spawn, config);
        enemy.id = spawn.id ?? enemy.id;
        this.level.enemies.push(enemy);
        this.level.AddEntity(enemy);
        return this;
    }

    AddEnemies(enemies = [], config = {}) {
        enemies.forEach(enemy => this.AddEnemy(enemy, undefined, config));
        return this;
    }

    Build() {
        return this.level;
    }
}
