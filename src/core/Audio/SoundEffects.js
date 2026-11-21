import { Component } from '../Component.js';
const Cues = Object.freeze({
    select: { frequency: 480, endFrequency: 650, duration: 0.07, volume: 0.045 },
    step: { frequency: 140, endFrequency: 80, duration: 0.045, volume: 0.025 },
    jump: { frequency: 250, endFrequency: 620, duration: 0.12, volume: 0.055 },
    land: { frequency: 130, endFrequency: 60, duration: 0.1, volume: 0.055 },
    shot: { frequency: 780, endFrequency: 260, duration: 0.08, volume: 0.035, wave: 'triangle' },
    hit: { frequency: 150, endFrequency: 40, duration: 0.13, volume: 0.06, wave: 'triangle' },
    collect: { frequency: 660, endFrequency: 1120, duration: 0.13, volume: 0.055 },
    transition: { frequency: 330, endFrequency: 880, duration: 0.25, volume: 0.045 },
    success: { frequency: 520, endFrequency: 1560, duration: 0.45, volume: 0.06 },
    warning: { frequency: 240, endFrequency: 320, duration: 0.18, volume: 0.045, wave: 'triangle' },
    splash: { frequency: 420, endFrequency: 90, duration: 0.16, volume: 0.04 },
});
/** Engine-clocked cue throttling over a borrowed AudioManager; no independent context. */
export class SoundEffects extends Component {
    constructor(audio, cues = {}) { super(); this.audio = audio; this.cues = { ...Cues, ...cues }; this.cooldowns = new Map(); this.played = 0; }
    Play(name) {
        const cue = this.cues[name];
        if (!cue || this.cooldowns.has(name))
            return false;
        if (!this.audio?.PlayTone(cue))
            return false;
        this.cooldowns.set(name, Math.max(0.06, cue.duration ?? 0.1));
        this.played++;
        return true;
    }
    OnUpdate(dt) {
        for (const [name, remaining] of this.cooldowns) {
            if (remaining <= dt)
                this.cooldowns.delete(name);
            else
                this.cooldowns.set(name, remaining - dt);
        }
    }
    OnDestroy() { this.cooldowns.clear(); this.audio = null; }
}
