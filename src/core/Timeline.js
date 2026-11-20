// @ts-check
import { Component } from './Component.js';

/**
 * Reusable, engine-clocked sequence of parallel tracks and one-shot cues.
 * A track samples normalized progress; a cue runs once when its time is crossed.
 * Skip applies track endpoints without playing unvisited cues. Completion always
 * releases game-owned control locks through onFinish, including cancellation.
 */
export class Timeline extends Component {
    /**
     * @param {{duration:number, tracks?: {start:number,duration:number,sample:(progress:number)=>void}[], cues?: {at:number,run:()=>void}[], onFinish?:(reason:'completed'|'skipped'|'cancelled')=>void}} options
     */
    constructor({ duration, tracks = [], cues = [], onFinish = () => {} }) {
        super();
        if (!Number.isFinite(duration) || duration <= 0) throw new RangeError('Timeline duration must be positive.');
        for (const track of tracks) {
            if (!Number.isFinite(track.start) || track.start < 0 || !Number.isFinite(track.duration)
                || track.duration <= 0 || track.start + track.duration > duration || typeof track.sample !== 'function') {
                throw new RangeError('Timeline track is outside the sequence.');
            }
        }
        for (const cue of cues) if (!Number.isFinite(cue.at) || cue.at < 0 || cue.at > duration || typeof cue.run !== 'function') {
            throw new RangeError('Timeline cue is outside the sequence.');
        }
        this.duration = duration;
        this.tracks = [...tracks];
        this.cues = [...cues].sort((a, b) => a.at - b.at);
        this.onFinish = onFinish;
        this.time = 0;
        this.playing = false;
        this.paused = false;
        this.nextCue = 0;
    }
    Play() {
        if (this.playing) this.Cancel();
        this.time = 0; this.nextCue = 0; this.paused = false; this.playing = true;
        this.Sample(-1); this.FireCues();
    }
    /** @param {number} dt */
    OnUpdate(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Timeline delta must be finite and nonnegative.');
        if (!this.playing || this.paused) return;
        const previous = this.time;
        this.time = Math.min(this.duration, this.time + dt);
        this.Sample(previous); this.FireCues();
        if (this.playing && this.time === this.duration) this.Finish('completed');
    }
    /** @param {number} previous */
    Sample(previous) {
        for (const track of this.tracks) {
            if (this.time >= track.start && previous < track.start + track.duration) {
                track.sample(Math.min(1, (this.time - track.start) / track.duration));
            }
        }
    }
    FireCues() {
        while (this.playing && this.nextCue < this.cues.length && this.cues[this.nextCue].at <= this.time) {
            this.cues[this.nextCue++].run();
        }
    }
    Skip() {
        if (!this.playing) return;
        this.time = this.duration;
        for (const track of this.tracks) track.sample(1);
        this.Finish('skipped');
    }
    Cancel() { if (this.playing) this.Finish('cancelled'); }
    /** @param {'completed'|'skipped'|'cancelled'} reason */
    Finish(reason) { this.playing = false; this.paused = false; this.onFinish(reason); }
    OnDestroy() { this.Cancel(); }
}
