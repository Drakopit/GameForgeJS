import { Level, EventEmitter, ObjectPool, GameViewport, SoundEffects } from 'gameforgejs/core';
import { Screen, GameObject } from 'gameforgejs/2d';
import { ScenarioWithArena } from '../data/ArenaScene.js';
import { ArenaView } from '../entities/ArenaView.js';
import { ArenaPlayer } from '../entities/ArenaPlayer.js';
import { ArenaBoss } from '../entities/ArenaBoss.js';
import { ArenaProjectile } from '../entities/ArenaProjectile.js';
import { BossDirector } from '../components/BossDirector.js';
import { HazardField } from '../components/HazardField.js';
import { ArenaHUD } from '../ui/ArenaHUD.js';

import { RoomProgress, rooms } from '../components/RoomProgress.js';

export class ArenaLevel extends Level {
    OnStart(context = this.context) {
        this.caption = 'Ember Warden / Boss Patterns'; this.rules = ScenarioWithArena(context.assets.jsons.scenario, context.assets.jsons.arena);
        this.screen = new Screen('boss-arena', 960, 640, {config: context.config});
        this.events = new EventEmitter(); this.result = ''; this.message = 'Read the gold telegraph. Shoot, evade, punish.';
        this.sound = new SoundEffects(context.services.get('audio'),context.config.audio?.cues);
        this.dashQueued = false; this.shootQueued = false;
        this.view = this.AddEntity(new ArenaView(this));
        this.player = this.AddEntity(new ArenaPlayer(this)); this.boss = this.AddEntity(new ArenaBoss(this));
        this.brain = new BossDirector(this); this.boss.AddComponent(this.brain);
        this.hazards = new HazardField(this); const field = new GameObject(); field.AddComponent(this.sound); field.AddComponent(this.hazards); field.AddComponent(new RoomProgress(this)); this.AddEntity(field);
        const capacity = this.rules.projectiles.capacity;
        this.projectiles = new ObjectPool(() => this.AddEntity(new ArenaProjectile(this)), capacity, {maxSize: capacity});
        this.hud = new ArenaHUD(this);
        this.EnterRoom(0);
        this.removeTelegraph = this.events.on('boss:telegraph', name => {this.message = name;this.sound.Play('warning');});
        this.removeHit = this.events.on('combat:hit',()=>this.sound.Play('hit'));
        this.releaseViewport = GameViewport.Bind(this.screen, {onResize: () => this.hud.stick.Cancel()}); super.OnStart(context);
    }
    EnterRoom(index) {
        this.roomIndex = index;
        this.room = rooms[index];
        this.roomTime = 0;
        this.switches = new Set();
        this.exitOpen = false;
        this.player.position.Set(this.player.anchor.x, this.player.anchor.y);
        this.player.velocity.SetVelocity(0, 0);
        this.boss.active = index === rooms.length - 1;
        this.brain.enabled = this.boss.active;
        this.brain.Reset();
        this.hazards.hazards.length = 0;
        for (const projectile of this.projectiles.pool) projectile.Release();
        this.message = this.room.name;
        this.sound.Play('transition');
    }

    Emit(position, velocity, team) {
        if (this.result) return;
        const projectile = this.projectiles.Get(); if (projectile) {projectile.Launch(position, velocity, team);if(team==='player')this.sound.Play('shot');}
    }
    Finish(result) { this.result = result; this.sound.Play(result==='VICTORY'?'success':'hit'); for (const projectile of this.projectiles.pool) projectile.Release(); this.hazards.hazards.length = 0; }
    Reset() {
        this.result = ''; this.message = 'Read the gold telegraph. Shoot, evade, punish.'; this.dashQueued = this.shootQueued = false;
        this.EnterRoom(0);
        this.boss.position.Set(this.boss.anchor.x, this.boss.anchor.y);
        this.player.health.Reset(); this.boss.health.Reset(); this.player.motion.Reset(); this.player.velocity.SetVelocity(0, 0); this.brain.Reset();
        for (const projectile of this.projectiles.pool) projectile.Release(); this.hazards.hazards.length = 0;
    }
    OnUpdate(dt) { this.hud.Update(); if(!this.hud.help.visible)super.OnUpdate(dt); }
    OnFixedUpdate(dt) {if(!this.hud.help.visible)super.OnFixedUpdate(dt);}
    OnGUI() { this.hud.Draw(); }
    OnExit() { this.releaseViewport?.(); this.removeTelegraph?.(); this.removeHit?.(); this.hud?.Dispose(); super.OnExit(); this.projectiles?.pool.splice(0); }
}
