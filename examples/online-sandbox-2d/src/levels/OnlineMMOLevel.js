import { GameViewport, Level } from 'gameforgejs/core';
import { Screen } from 'gameforgejs/2d';
import { TilePlatformerWorld } from 'gameforgejs/addons/platformer';
import { OnlineSession } from '../network/OnlineSession.js';
import { SnapshotBuffer } from '../network/SnapshotBuffer.js';
import { PredictedPlayer } from '../entities/PredictedPlayer.js';
import { OnlineControls } from '../input/OnlineControls.js';
import { OnlineInterface } from '../ui/OnlineInterface.js';
import { OnlineWorldView } from '../world/OnlineWorldView.js';
import { OnlineAudio } from '../audio/OnlineAudio.js';
import { RulesWithWorld } from '../data/WorldScene.js';

/** Scene orchestration; transport, movement, input and presentation have separate owners. */
export class OnlineMMOLevel extends Level {
    constructor() { super(); this.caption = 'GameForgeJS — Skybound Together'; this.TelaId = 'online-sandbox'; }
    OnStart(context = this.context) {
        this.rules = RulesWithWorld(context.assets.jsons['world-rules'], context.assets.jsons['world-scene']);
        this.screen = new Screen(this.TelaId, 960, 600, { config: context.config });
        this.releaseViewport = GameViewport.Bind(this.screen, {
            onResize: () => { this.controls?.touch.CancelAll(); this.controls?.Layout(); },
        });
        this.preventMenu = event => event.preventDefault();
        this.screen.Canvas.addEventListener('contextmenu', this.preventMenu);
        this.session = new OnlineSession(); this.remote = new SnapshotBuffer();
        this.ui = new OnlineInterface(this); this.controls = new OnlineControls(this);
        this.view = new OnlineWorldView(this); this.sound = new OnlineAudio(context.services.get('audio'));
        this.world = new TilePlatformerWorld({ tileSize: this.rules.tileSize, worldWidth: this.rules.width,
            worldHeight: this.rules.height, getTile: (x, y) => this.session.blocks.get(`${x},${y}`) });
        this.subscriptions = [
            this.session.on('joined', snapshot => {
                if (!this.player) this.player = this.AddEntity(new PredictedPlayer(this.world, this.rules, this.session));
                for (const field of Object.values(this.ui.fields)) field.SetActive(false);
                this.playing = true; this.remote.Clear();
                this.player.Reconcile(snapshot.players.find(player => player.id === this.session.playerId), true);
                this.remote.Push(snapshot);
                this.ui.AddMessage({ system: true, text: 'Collect 6 crystals. Build across the chasm. Bring them to the eastern beacon.' });
            }),
            this.session.on('state', snapshot => {
                this.player?.Reconcile(snapshot.players.find(player => player.id === this.session.playerId));
                this.remote.Push(snapshot);
            }),
            this.session.on('chat', message => this.ui.AddMessage(message)),
            this.session.on('error', message => this.ui.AddMessage({ system: true, text: message.message })),
            this.session.on('action', result => {
                if (result.message) this.ui.AddMessage({ system: true, text: result.message });
                if (result.accepted) this.sound.Play(result.kind, this.ui.volume);
            }),
            this.session.on('pickup', pickup => { if (pickup.playerId === this.session.playerId) this.sound.Play('pickup', this.ui.volume); }),
        ];
        this.playing = false;
        super.OnStart(context);
    }
    Connect(create) {
        if (this.session.status === 'connecting') return;
        const fields = this.ui.fields;
        if (!create && fields.room.GetText().trim().length !== 6) { this.session.message = 'Enter the six-letter room code.'; return; }
        try {
            this.session.message = '';
            this.session.Connect({ endpoint: fields.server.GetText(), name: fields.name.GetText(), room: fields.room.GetText(), create });
        } catch (error) { this.session.message = error.message; this.session.status = 'error'; }
    }
    Leave() {
        this.session.Disconnect(); this.playing = false; this.ui.paused = false;
        if (this.player) { this.RemoveEntity(this.player); this.player = null; }
        this.remote.Clear(); this.view.Dispose(); this.ui.messages = [];
    }
    OnUpdate(dt) {
        this.ui.Update(dt); this.controls.Update();
        this.player?.SetCommand({ axis: this.controls.axis, jumpPressed: this.controls.jumpPressed, jumpHeld: this.controls.jumpHeld });
        super.OnUpdate(dt);
        this.session.Update(dt); this.view.Update(dt);
    }
    WorldTile(point) {
        return { x: Math.floor((point.x + this.view.camera.x) / this.rules.tileSize),
            y: Math.floor((point.y + this.view.camera.y) / this.rules.tileSize) };
    }
    OnDrawn() { if (this.playing) this.view.Draw(); else this.view.DrawSky(); }
    OnGUI() { this.controls.Draw(); this.ui.Draw(); }
    OnExit() {
        this.session.Disconnect(); this.ui.Dispose(); this.view.Dispose();
        for (const remove of this.subscriptions) remove();
        this.releaseViewport();
        this.screen.Canvas.removeEventListener('contextmenu', this.preventMenu);
        super.OnExit();
    }
}
