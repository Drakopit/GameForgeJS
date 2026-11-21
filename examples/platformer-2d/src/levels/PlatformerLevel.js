import { Level, ActionManager, Vector2D, AssetManager, GameViewport, Input, SoundEffects } from 'gameforgejs/core';
import { Screen, Draw, Camera } from 'gameforgejs/2d';
import { TilePlatformerWorld } from 'gameforgejs/addons/platformer';
import { Player } from '../entities/Player.js';
import { Coin } from '../entities/Coin.js';
import { PlatformerHUD } from '../ui/PlatformerHUD.js';
import { PlatformerControls } from '../input/PlatformerControls.js';
import { PlatformerScenery } from '../rendering/PlatformerScenery.js';
import { StageFromScene } from '../data/StageScene.js';

export class PlatformerLevel extends Level {
    constructor(stage) {
        super();
        this.TelaId = 'platformer-lab';
        this.won = false;
        // A resource name (gameforgejs.scene JSON) or an already-built stage object.
        this.stageSource = stage;
        this.stage = typeof stage === 'string' ? null : stage;
    }

    OnStart(context = this.context) {
        if (typeof this.stageSource === 'string') this.stage = StageFromScene(context.assets.jsons[this.stageSource]);
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
        this.controls=new PlatformerControls(this);
        this.player.controller.input=this.controls;
        this.scenery=new PlatformerScenery();
        this.sound = this.player.AddComponent(new SoundEffects(this.context.services.get('audio')));
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
        this.releaseViewport=GameViewport.Bind(this.screen,{onResize:()=>this.LayoutWorld()});
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

    LayoutWorld() {
        const reserve=Input.instance.presentation.TouchVisible?140:0;
        this.viewHeight=Math.max(100,Math.min(this.stage.rows*this.stage.tileSize,this.screen.Height-reserve));
        this.viewTop=Math.max(0,(this.screen.Height-reserve-this.viewHeight)/2);
        this.camera.size.Set(this.screen.Width,this.viewHeight);this.camera.Update(this.player,0);
    }

    OnUpdate(dt) {
        this.controls.Update();
        this.LayoutWorld();
        if (ActionManager.IsActionDown('HELP')) this.hud.help.Toggle();
        if (ActionManager.IsActionDown('RESET')) {
            this.RestartStage();
        }
        if (this.won && ActionManager.IsActionDown('CONTINUE')) {
            this.Next = true;
            return;
        }
        if (this.hud.help.visible || this.won) return;
        super.OnUpdate(dt);
    }

    OnFixedUpdate(dt) {
        if (this.hud.help.visible || this.won) return;
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
                this.sound.Play('collect');
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
        this.scenery.Draw(this);
        const ctx=this.screen.Context;ctx.save();ctx.beginPath();ctx.rect(0,this.viewTop,this.screen.Width,this.viewHeight);ctx.clip();ctx.translate(0,this.viewTop);
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
            ctx.restore();
        }
    }

    DrawTerrain() {
        const { tileSize, worldWidth, worldHeight, getTile } = this.world.options;
        for (let y = 0; y < worldHeight; y++) {
            for (let x = 0; x < worldWidth; x++) {
                if (!getTile(x, y)) continue;

                this.draw.Color = '#416f66';
                this.draw.DrawRect(x * tileSize, y * tileSize, tileSize, tileSize);
                if(!getTile(x,y-1)) {
                    this.draw.Color = '#b6dfa2';
                    this.draw.DrawRect(x * tileSize, y * tileSize, tileSize, 4);
                }
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
        this.controls.Draw();
    }
    OnExit() { this.releaseViewport?.();this.controls?.Dispose();this.hud?.help?.Dispose(); super.OnExit(); }
}
