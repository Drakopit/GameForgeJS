import { SoundEffects } from 'gameforgejs/core';
/** Contacts and user-triggered FX produce bounded cues; rain itself stays quiet. */
export class FoundryAudio extends SoundEffects {
    constructor(audio, world) { super(audio); this.world = world; this.remove = []; }
    OnStart() {
        this.remove.push(this.world.events.on('impact', hit => { if (hit.speed > 75)
            this.Play(hit.surface ? 'splash' : 'hit'); }));
        for (const [event, cue] of [['prop:launched', 'select'], ['fx:burst', 'collect'], ['wind:gust', 'transition']]) {
            this.remove.push(this.world.events.on(event, () => this.Play(cue)));
        }
    }
    OnDestroy() { for (const remove of this.remove)
        remove(); this.remove.length = 0; super.OnDestroy(); }
}
