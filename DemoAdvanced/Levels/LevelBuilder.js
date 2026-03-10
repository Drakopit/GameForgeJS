import { AssetManager } from "../../Root/AssetManager.js";
import { Block } from "../Block.js";
import { Enemy } from "../Enemy.js";

export class LevelBuilder {
    constructor(level) {
        this.level = level;
        
        // Garante que os arrays existam no nível antes de começar
        if (!this.level.blocks) this.level.blocks = [];
        if (!this.level.enemies) this.level.enemies = [];
    }

    SetBackground(imageName) {
        this.level.bgImage = AssetManager.instance.GetImage(imageName);
        return this; // Retornar 'this' é o que permite encadear os métodos com o ponto (.)
    }

    AddPlatform(x, y, width, height) {
        const block = new Block(this.level.screen, x, y, width, height);
        this.level.blocks.push(block);
        this.level.AddEntity(block);
        return this;
    }

    AddEnemy(x, y) {
        // Assume que o Player já foi instanciado no Nível antes de chamar o Builder
        const enemy = new Enemy(this.level.screen, this.level.player, x, y);
        this.level.enemies.push(enemy);
        this.level.AddEntity(enemy);
        return this;
    }

    Build() {
        // Aqui você pode adicionar validações, ex: checar se o mapa tem um chão.
        // Como está tudo certo, retornamos o nível pronto.
        return this.level;
    }
}