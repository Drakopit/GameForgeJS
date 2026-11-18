import { Level, ActionManager, Vector2D, AssetManager } from 'gameforgejs/core';
import { Screen, Draw, Camera } from 'gameforgejs/2d';
import { TilePlatformerWorld } from 'gameforgejs/addons/platformer';
import { Player } from '../entities/Player.js';
import { Coin } from '../entities/Coin.js';
import { PlatformerHUD } from '../ui/PlatformerHUD.js';

export class PlatformerLevel extends Level {
    constructor(stage) {
        super();
        this.TelaId = 'platformer-lab';
        this.won = false;
        this.stage = stage;
    }

    OnStart(context = this.context) {
        const { width, height } = context.config.screen;
        this.screen = new Screen(this.TelaId, width, height, { config: context.config });
        this.draw = new Draw(this.screen);
        this.hud = new PlatformerHUD(this.screen);
        this.world = new TilePlatformerWorld({
            tileSize: this.stage.tileSize,
            worldWidth: this.stage.columns,
            worldHeight: this.stage.rows,
            getTile: (x, y) => this.GetTile(x, y),
        });
        const assets = context.assets ?? AssetManager.instance;
        this.player = new Player(this.world, this.screen, this.stage.spawn, assets);
        this.AddEntity(this.player);
        this.coins = this.stage.coins.map(position => {
            const coin = new Coin(this.screen, position);
            this.AddEntity(coin);
            return coin;
        });
        this.collectedCount = 0;

        this.camera = new Camera(new Vector2D(0, 0), new Vector2D(width, height));
        this.camera.Init(this.screen, {
            width: this.stage.columns * this.stage.tileSize,
            height: this.stage.rows * this.stage.tileSize,
        });
        this.camera.Update(this.player, 0);
        this.won = false;
        super.OnStart(context);
    }

    GetTile(x, y) {
        return this.stage.terrain.some(rectangle => {
            const insideX = x >= rectangle.x && x < rectangle.x + rectangle.width;
            const insideY = y >= rectangle.y && y < rectangle.y + rectangle.height;
            return insideX && insideY;
        });
    }

    OnUpdate(dt) {
        if (ActionManager.IsActionDown('RESET')) {
            this.RestartStage();
        }
        if (this.won && ActionManager.IsActionDown('CONTINUE')) {
            this.Next = true;
            return;
        }
        super.OnUpdate(dt);
    }

    OnFixedUpdate(dt) {
        super.OnFixedUpdate(dt);
        const worldHeight = this.stage.rows * this.stage.tileSize;
        if (this.player.position.y > worldHeight + 64) {
            this.player.Respawn();
        }
        this.CollectCoins();
        const allCollected = this.collectedCount === this.coins.length;
        if (allCollected && this.player.position.x >= this.stage.goal.x && this.player.controller.grounded) {
            this.won = true;
        }
        this.camera.Update(this.player, dt);
    }

    CollectCoins() {
        for (const coin of this.coins) {
            if (coin.TryCollect(this.player)) {
                this.collectedCount++;
            }
        }
    }

    RestartStage() {
        this.player.Respawn();
        for (const coin of this.coins) {
            coin.Reset();
        }
        this.collectedCount = 0;
        this.won = false;
        this.camera.Update(this.player, 0);
    }

    OnDrawn() {
        this.screen.Refresh();
        this.draw.Color = '#254b60';
        this.draw.DrawRect(0, 0, this.screen.width, this.screen.height);
        this.camera.Begin();
        try {
            this.DrawTerrain();
            this.DrawFlag();
            // This level clears before drawing its background. Level.OnDrawn()
            // would clear again, so render the registered entities here.
            for (const entity of this.entities) {
                entity.OnDrawn();
            }
        } finally {
            this.camera.End();
        }
    }

    DrawTerrain() {
        const { tileSize, worldWidth, worldHeight, getTile } = this.world.options;
        for (let y = 0; y < worldHeight; y++) {
            for (let x = 0; x < worldWidth; x++) {
                if (!getTile(x, y)) continue;

                this.draw.Color = '#416f66';
                this.draw.DrawRect(x * tileSize, y * tileSize, tileSize, tileSize);
                this.draw.Color = '#91c98e';
                this.draw.DrawRect(x * tileSize, y * tileSize, tileSize, 4);
            }
        }
    }

    DrawFlag() {
        const { x, y } = this.stage.goal;
        this.draw.Color = '#f3c866';
        this.draw.DrawRect(x, y, 4, 78);
        this.draw.DrawRect(x + 4, y, 24, 18);
    }

    OnGUI() {
        super.OnGUI();
        this.hud.Draw(this);
    }
}
