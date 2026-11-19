import { MathExt, Vector2D } from 'gameforgejs/core';
import { Sprite } from 'gameforgejs/2d';
import { BLOCK_COLORS, PLAYER_COLORS } from '../data/OnlineWorldData.js';

const CAMERA_RESPONSE = 8;
const SPRITE_FRAME_SIZE = 32;
const SPRITE_DISPLAY_SIZE = 48;

export class OnlineWorldView {
    constructor(level) { this.level = level; this.camera = new Vector2D(); this.sprites = new Map(); this.age = 0; }
    Update(dt) {
        this.age += dt;
        const level = this.level, screen = level.screen, player = level.player;
        if (player) {
            const worldWidth = level.rules.width * level.rules.tileSize;
            const x = Math.max(0, Math.min(Math.max(0, worldWidth - screen.Width), player.position.x - screen.Width * 0.4));
            const y = player.position.y - screen.Height * (level.controls.mobile ? 0.52 : 0.6);
            const fraction = 1 - Math.exp(-CAMERA_RESPONSE * dt);
            this.camera.x = MathExt.Lerp(this.camera.x, x, fraction);
            this.camera.y = MathExt.Lerp(this.camera.y, y, fraction);
        }
        const ids = new Set(level.session.players.map(player => player.id));
        for (const [id, sprite] of this.sprites) {
            if (!ids.has(id)) this.sprites.delete(id); else sprite.Update(dt);
        }
    }
    DrawSky() {
        const { screen } = this.level, ctx = screen.Context;
        const gradient = ctx.createLinearGradient(0, 0, 0, screen.Height);
        gradient.addColorStop(0, '#122842'); gradient.addColorStop(1, '#6bafa9');
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, screen.Width, screen.Height);
        ctx.fillStyle = '#ffe9a8'; ctx.beginPath(); ctx.arc(screen.Width * 0.78, screen.Height * 0.22, 35, 0, Math.PI * 2); ctx.fill();
        for (const layer of [{ speed: 0.12, color: '#244f67', height: 130 }, { speed: 0.24, color: '#307572', height: 60 }]) {
            ctx.fillStyle = layer.color;
            for (let index = -1; index < screen.Width / 240 + 2; index++) {
                const x = index * 240 - this.camera.x * layer.speed % 240, baseline = screen.Height * 0.7;
                ctx.beginPath(); ctx.moveTo(x, screen.Height); ctx.lineTo(x, baseline);
                ctx.lineTo(x + 120, baseline - layer.height); ctx.lineTo(x + 260, baseline); ctx.lineTo(x + 260, screen.Height); ctx.fill();
            }
        }
    }
    Draw() {
        this.DrawSky();
        const level = this.level, rules = level.rules, ctx = level.screen.Context, size = rules.tileSize;
        ctx.save(); ctx.translate(-this.camera.x, -this.camera.y);
        for (const block of level.session.blocks.values()) {
            if (block.x * size < this.camera.x - size || block.x * size > this.camera.x + level.screen.Width) continue;
            const colors = BLOCK_COLORS[block.type];
            ctx.fillStyle = colors.base; ctx.fillRect(block.x * size, block.y * size, size, size);
            ctx.fillStyle = colors.top; ctx.fillRect(block.x * size, block.y * size, size, 6);
            ctx.strokeStyle = colors.edge; ctx.strokeRect(block.x * size + 0.5, block.y * size + 0.5, size - 1, size - 1);
        }
        for (const crystal of rules.crystals) {
            if (level.session.collected.has(crystal.id)) continue;
            const y = crystal.y + Math.sin(this.age * 3 + crystal.x) * 4;
            ctx.fillStyle = '#a6fff1'; ctx.shadowColor = '#77ffe1'; ctx.shadowBlur = 15;
            ctx.beginPath(); ctx.moveTo(crystal.x, y - 12); ctx.lineTo(crystal.x + 8, y); ctx.lineTo(crystal.x, y + 12); ctx.lineTo(crystal.x - 8, y); ctx.fill(); ctx.shadowBlur = 0;
        }
        const beacon = rules.beacon, charged = level.session.charge >= rules.requiredGems;
        ctx.fillStyle = '#32415a'; ctx.fillRect(beacon.x - 18, beacon.y - 10, 36, 52);
        ctx.fillStyle = charged ? '#b0ffe0' : '#d7c58c'; ctx.shadowBlur = charged ? 35 : 10; ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath(); ctx.arc(beacon.x, beacon.y - 22, 16, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        this.Label(charged ? 'BEACON RESTORED' : 'BRING 6 CRYSTALS · E / USE', beacon.x, beacon.y - 49);
        for (const player of level.remote.Sample()) if (player.id !== level.session.playerId) this.DrawPlayer(player);
        this.DrawPlayer(level.player.GetDisplayState());
        const target = level.controls.target;
        if (target && !level.ui.paused && !level.ui.IsTyping) {
            const player = level.player.position;
            const inReach = Math.hypot((target.x + 0.5) * size - player.x - rules.playerWidth / 2,
                (target.y + 0.5) * size - player.y - rules.playerHeight / 2) <= rules.actionReach;
            ctx.strokeStyle = inReach ? '#b5ffe0' : '#f49c8b'; ctx.lineWidth = 2;
            ctx.strokeRect(target.x * size + 1, target.y * size + 1, size - 2, size - 2);
        }
        ctx.restore();
    }
    Label(text, x, y) {
        const ctx = this.level.screen.Context;
        ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.fillStyle = '#101d31';
        ctx.fillText(text, x + 1, y + 1); ctx.fillStyle = '#f5f4d5'; ctx.fillText(text, x, y);
    }
    DrawPlayer(player) {
        if (!player?.id) return;
        const level = this.level, ctx = level.screen.Context;
        const animation = !player.grounded ? (player.vy < 0 ? 'jump' : 'fall') : Math.abs(player.vx) > 1 ? 'run' : 'idle';
        let entry = this.sprites.get(player.id);
        if (!entry) { entry = new Sprite(level.screen); entry.updatesPerFrame = 8; this.sprites.set(player.id, entry); }
        if (entry.animationName !== animation) {
            entry.animationName = animation; entry.sprite = level.context.assets.images[`player-${animation}`];
            entry.size.Set(SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE);
            entry.frameCount = entry.sprite.width / SPRITE_FRAME_SIZE; entry.index = 0; entry.frameTimer = 0;
        }
        ctx.save(); ctx.globalAlpha = player.connected === false ? 0.4 : 1;
        ctx.translate(player.x + level.rules.playerWidth / 2, player.y + level.rules.playerHeight);
        ctx.fillStyle = PLAYER_COLORS[player.color] ?? PLAYER_COLORS[0];
        ctx.beginPath(); ctx.ellipse(0, 2, 16, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.scale(player.facingRight ? 1 : -1, 1);
        ctx.drawImage(entry.sprite, entry.index * SPRITE_FRAME_SIZE, 0, SPRITE_FRAME_SIZE, SPRITE_FRAME_SIZE,
            -SPRITE_DISPLAY_SIZE / 2, -SPRITE_DISPLAY_SIZE, SPRITE_DISPLAY_SIZE, SPRITE_DISPLAY_SIZE);
        if (['mine', 'place', 'interact'].includes(player.action)) {
            ctx.strokeStyle = '#ffe6a0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(14, -24, 18, -1, 1); ctx.stroke();
        }
        ctx.restore(); this.Label(player.name, player.x + level.rules.playerWidth / 2, player.y - 12);
    }
    Dispose() { this.sprites.clear(); }
}
