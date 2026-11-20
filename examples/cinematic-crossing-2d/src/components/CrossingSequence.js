import { Timeline, MathExt } from 'gameforgejs/core';

export class CrossingSequence extends Timeline {
    constructor(level) {
        const duration = level.rules.duration;
        super({duration, tracks: [
            {start: 0, duration, sample: t => {
                level.focus.Set(MathExt.Lerp(240, 1500, t * t * (3 - 2 * t)), 360);
                level.magnification = 1 + Math.sin(t * Math.PI) * 0.24;
                level.fade = Math.max(0, 1 - t * duration, 1 - (1 - t) * duration);
            }},
        ], cues: level.rules.beats.map(beat => ({at: beat.at, run: () => {level.dialogue = beat.text;level.sound.Play('select');}})),
        onFinish: reason => {
            level.courier.path.playing = false;
            if (reason === 'skipped') level.courier.position.Copy(level.courier.path.points.at(-1));
            level.focus.Copy(level.courier.position); level.dialogue = ''; level.fade = 0; level.magnification = 1;
        }});
    }
}
