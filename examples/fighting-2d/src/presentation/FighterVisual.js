import { Component, Vector2D } from 'gameforgejs/core';
import { Sprite } from 'gameforgejs/2d';
import { FrameSize, FighterAnimations } from '../data/FighterAnimations.js';
import { FighterSettings } from '../data/FightingSettings.js';

export class FighterVisual extends Component {
    constructor(screen, sprite, image) {
        super(); this.screen = screen; this.sprite = sprite;
        sprite.screen = screen; sprite.sprite = image;
        sprite.size.Set(FrameSize.width, FrameSize.height);
        this.clipName=null;this.anchor=new Vector2D();
        this.aura=new Sprite(screen);this.aura.sprite=image;this.aura.size.Set(FrameSize.width,FrameSize.height);
        this.aura.frameCount=FighterAnimations.aura.count;this.aura.updatesPerFrame=60/FighterAnimations.aura.fps;
    }

    Play(state) {
        this.clipName=state;
        const clip = FighterAnimations[state] ?? FighterAnimations.idle;
        this.sprite.frameCount = clip.count; this.sprite.loop = clip.loop;
        this.sprite.updatesPerFrame = 60 / clip.fps;
        this.sprite.Reset();
        if(state==='super'||state==='intro')this.aura.Reset();
    }

    ResolveClip() {
        const f=this.owner;
        if(f.state==='guard')return f.command.crouch?'guardLow':'guard';
        if(f.state==='hurt')return f.knockedDown?(f.stateTimer>0.22?'knockdown':'getUp'):f.hitReaction??'hurt';
        if(f.state==='walk'){
            const forward=(f.facingRight?1:-1)*f.velocity.x>=0;
            return f.motor.dashRemaining>0?(forward?'dash':'backDash'):(forward?'walk':'walkBack');
        }
        if(f.state==='jump')return f.velocity.y<0?'jump':'fall';
        if(f.landTimer>0&&f.state==='idle')return 'land';
        return f.state;
    }
    OnUpdate(dt) {
        const clip=this.ResolveClip();if(clip!==this.clipName)this.Play(clip);
        if(this.owner.state==='super'||this.owner.state==='intro')this.aura.Update(dt);
    }

    OnDrawn() {
        const fighter = this.owner;
        const ctx = this.screen.Context;
        const clip = FighterAnimations[this.clipName] ?? FighterAnimations.idle;
        const width = FrameSize.width * FighterSettings.scale;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath(); ctx.ellipse(fighter.position.x, fighter.groundY + 5, 45, 10, 0, 0, Math.PI * 2); ctx.fill();
        if (fighter.invulnerableTimer > 0) ctx.globalAlpha = 0.7;
        const index = this.sprite.index;
        const cell=clip.cells[Math.min(index,clip.count-1)];
        this.sprite.index = cell.column;
        // Sprite owns sheet clipping/flipping; the adapter supplies authored cell offsets.
        const anchor = this.anchor.Set(fighter.position.x - width / 2, fighter.position.y - (clip.feetY ?? FrameSize.feetY) * FighterSettings.scale);
        if(fighter.state==='super'||fighter.state==='intro'){
            this.aura.Animation(undefined,anchor,'horizontal',FighterAnimations.aura.row,fighter.facingRight,FighterSettings.scale);
        }
        this.sprite.Animation(undefined, anchor, 'horizontal', cell.row, fighter.facingRight, FighterSettings.scale);
        this.sprite.index = index;
        ctx.restore();
        if (fighter.state === 'guard') {
            ctx.save(); ctx.strokeStyle = '#91e9ff'; ctx.lineWidth = 3;
            const angle = fighter.facingRight ? 0 : Math.PI;
            ctx.beginPath(); ctx.arc(fighter.position.x, fighter.position.y - 65, 42, angle - 1.2, angle + 1.2); ctx.stroke();
            ctx.restore();
        }
        this.DrawAttack(ctx);
    }

    DrawAttack(ctx) {
        const fighter = this.owner;
        const attack = fighter.GetCurrentAttack();
        if (!attack) return;
        const elapsed = attack.duration - fighter.stateTimer;
        const progress = Math.min(1, elapsed / attack.activeStart);
        ctx.save();
        if (attack.projectile && !fighter.projectileFired) {
            const radius = (fighter.state === 'super' ? 24 : 14) * progress;
            const x = fighter.position.x + (fighter.facingRight ? 48 : -48);
            const y = fighter.position.y - 76;
            ctx.shadowColor = fighter.tint; ctx.shadowBlur = 22;
            ctx.fillStyle = fighter.tint;
            ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
        } else if (!attack.projectile && fighter.CanHit()) {
            const box = fighter.GetAttackBox();
            ctx.strokeStyle = '#fff1a6'; ctx.lineWidth = fighter.state === 'heavy' ? 8 : 4;
            ctx.beginPath(); ctx.ellipse(box.x + box.width / 2, box.y + box.height / 2, box.width / 2, box.height / 2, 0, -1.3, 1.3); ctx.stroke();
        }
        ctx.restore();
    }
}
