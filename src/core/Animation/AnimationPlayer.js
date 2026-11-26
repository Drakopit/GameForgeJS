// @ts-check
import { Component } from "../Component.js";
import { SceneComponents } from "../Scene/SceneComponents.js";
import { BindTarget } from "../Scene/Targets.js";

/**
 * Keyframe animation for a scene node, with a basic state machine.
 *
 * A clip (`clips[]`) has `name`, `duration`, `loop`, `tracks` and `events`:
 * - a track animates one `property` through `keys` ([[time, value], …]) with `interpolation`
 *   "linear" (default), "smooth" or "step". Properties: position, rotation (radians, like the
 *   scene's transforms), scale, color (RGBA 0..1), opacity, any other number or array field the
 *   binding knows, and `clip`, whose string keys start a skeletal or sprite clip when reached;
 * - an event ({at, name}) is sent to `On(name, …)` listeners when its time is crossed.
 *
 * States are clips. `transitions` ([{from, to, trigger?, when?, exitTime?}]) change state on
 * `SetTrigger(name)`, when parameter conditions hold (`when: [{param, op, value}]`, op one of
 * > < >= <= == !=) or when the clip ends (`exitTime: true`); `from: "*"` means any state.
 *
 * Code first and scene first build the same object: the scene's `AnimationPlayer` component is
 * exactly the `settings` argument.
 *
 * @example
 * // Code first
 * level.AddEntity(Animate(cube)
 *     .Clip("spin", 8, { loop: true }).Track("rotation", [[0, [0, 0, 0]], [8, [0, Math.PI * 2, 0]]])
 *     .Clip("hit", 0.3).Track("color", [[0, [1, 0, 0, 1]], [0.3, [1, 1, 1, 1]]])
 *     .Transition({ from: "*", to: "hit", trigger: "hit" }).Transition({ from: "hit", to: "spin", exitTime: true }));
 * // Scene first: the same settings, from components.AnimationPlayer
 * level.AddEntity(new AnimationPlayer(node.components.AnimationPlayer, { target: cube }));
 */
export class AnimationPlayer extends Component {
    /**
     * @param {Record<string, any>} [settings] - `AnimationPlayer` component values.
     * @param {{target?: any, name?: string}} [options] - `target`: what the tracks animate (a 3D
     *   scene node, Mesh, Transform3D, 2D object, or any object with Get / Set; see Targets.js).
     */
    constructor(settings = {}, { target = null, name = "" } = {}) {
        super();
        this.name = name;
        this.target = BindTarget(target);
        /** @type {Map<string, Set<Function>>} */
        this.listeners = new Map();
        this.Configure(settings);
    }

    /** @param {Record<string, any>} settings */
    Configure(settings) {
        this.settings = SceneComponents.Resolve("AnimationPlayer", settings);
        /** @type {Map<string, any>} */
        this.clips = new Map((Array.isArray(this.settings.clips) ? this.settings.clips : []).map(clip => [clip.name, NormalizeClip(clip)]));
        this.transitions = Array.isArray(this.settings.transitions) ? this.settings.transitions : [];
        this.parameters = { ...(this.settings.parameters ?? {}) };
        this.triggers = new Set();
        this.state ??= null;
        this.time ??= 0;
        this.playing ??= false;
    }

    OnStart() {
        if (this.settings.playOnStart) this.Play(this.settings.initial || this.clips.keys().next().value || "");
    }

    /** The settings (the scene's `AnimationPlayer` component values). */
    ToJSON() {
        return structuredClone(this.settings);
    }

    /** The clip of a state, or null. @param {string} name */
    GetClip(name) {
        return this.clips.get(name) ?? null;
    }

    /* Builders (code first): each adds to `settings`, so the result serializes as the scene component. */

    /**
     * Adds (or replaces) a clip; the next Track / Event calls add to it.
     * @param {string} name @param {number} duration @param {{loop?: boolean}} [options]
     */
    Clip(name, duration, { loop = false } = {}) {
        const clip = { name, duration, loop, tracks: [], events: [] };
        this.settings.clips = [...this.settings.clips.filter(item => item.name !== name), clip];
        this.building = clip;
        this.clips.set(name, NormalizeClip(clip));
        if (!this.settings.initial) this.settings.initial = name;
        return this;
    }

    /**
     * Adds a track to the last clip.
     * @param {string} property @param {Array<[number, any]>} keys @param {"linear"|"smooth"|"step"} [interpolation]
     */
    Track(property, keys, interpolation = "linear") {
        const clip = this.Building("Track");
        clip.tracks.push({ property, interpolation, keys: keys.map(([at, value]) => [at, Array.isArray(value) ? [...value] : value]) });
        this.clips.set(clip.name, NormalizeClip(clip));
        return this;
    }

    /** Adds an event to the last clip. @param {number} at @param {string} name */
    Event(at, name) {
        const clip = this.Building("Event");
        clip.events.push({ at, name });
        this.clips.set(clip.name, NormalizeClip(clip));
        return this;
    }

    /** Adds a transition: {from, to, trigger?, exitTime?, when?}. @param {Record<string, any>} transition */
    Transition(transition) {
        this.settings.transitions = [...this.settings.transitions, { ...transition }];
        this.transitions = this.settings.transitions;
        return this;
    }

    /** @param {string} method */
    Building(method) {
        if (!this.building) throw new Error(`AnimationPlayer.${method}: call Clip(name, duration) first.`);
        return this.building;
    }

    /** Switches to a state (clip) from its start. @param {string} name */
    Play(name) {
        const clip = this.GetClip(name);
        if (!clip) return false;
        const previous = this.state;
        this.state = name;
        this.time = 0;
        this.playing = true;
        this.Sample(clip, 0, -1);
        this.Send("state", { from: previous, to: name });
        return true;
    }

    Stop() {
        this.playing = false;
    }

    /** @param {string} name @param {any} value */
    Set(name, value) {
        this.parameters[name] = value;
    }

    /** @param {string} name */
    SetTrigger(name) {
        this.triggers.add(name);
    }

    /** Listens to clip events and "state" changes; returns a function that stops listening. */
    On(name, listener) {
        if (!this.listeners.has(name)) this.listeners.set(name, new Set());
        this.listeners.get(name)?.add(listener);
        return () => this.listeners.get(name)?.delete(listener);
    }

    /** @param {string} name @param {any} [detail] */
    Send(name, detail) {
        for (const listener of this.listeners.get(name) ?? []) listener(detail, this);
    }

    /** @param {number} dt */
    OnUpdate(dt) {
        if (!this.playing || !Number.isFinite(dt) || dt < 0) return;
        const clip = this.GetClip(/** @type {string} */ (this.state));
        if (!clip) return;
        const previous = this.time;
        let time = previous + dt * this.settings.speed;
        // A pass ends when the clip reaches its end: loops wrap, others stop on the last frame.
        let finished = false;
        if (time >= clip.duration) {
            finished = true;
            this.Sample(clip, clip.duration, previous);
            if (clip.loop && clip.duration > 0) {
                time %= clip.duration;
                this.Sample(clip, time, -1);
            } else {
                time = clip.duration;
                this.playing = false;
            }
        } else {
            this.Sample(clip, time, previous);
        }
        this.time = time;
        this.CheckTransitions(finished);
    }

    /** @param {boolean} finished - The clip completed a pass this frame. */
    CheckTransitions(finished) {
        for (const transition of this.transitions) {
            if (transition.from !== "*" && transition.from !== this.state) continue;
            if (transition.to === this.state && transition.from === "*") continue;
            if (transition.trigger && !this.triggers.has(transition.trigger)) continue;
            if (transition.exitTime && !finished) continue;
            if (Array.isArray(transition.when) && !transition.when.every(condition => Compare(this.parameters[condition.param], condition.op, condition.value))) continue;
            if (!transition.trigger && !transition.exitTime && !Array.isArray(transition.when)) continue;
            if (transition.trigger) this.triggers.delete(transition.trigger);
            this.Play(transition.to);
            break;
        }
        this.triggers.clear();
    }

    /**
     * Applies a clip at `time` to the target; events and clip keys between `previous` and `time`
     * fire (previous = -1 includes time 0).
     */
    Sample(clip, time, previous) {
        for (const track of clip.tracks) {
            if (track.property === "clip") {
                for (const [at, name] of track.keys) if (at > previous && at <= time) this.target?.PlayClip?.(name);
                continue;
            }
            this.target?.Set(track.property, SampleTrack(track, time));
        }
        for (const event of clip.events) if (event.at > previous && event.at <= time) this.Send(event.name, event);
    }

    OnDestroy() {
        this.playing = false;
        this.listeners.clear();
        this.target = null;
    }
}

/** @param {any} clip */
function NormalizeClip(clip) {
    const tracks = (Array.isArray(clip?.tracks) ? clip.tracks : []).map(track => ({
        property: String(track.property ?? ""),
        interpolation: track.interpolation ?? "linear",
        keys: (Array.isArray(track.keys) ? track.keys : []).filter(key => Array.isArray(key) && Number.isFinite(key[0])).sort((a, b) => a[0] - b[0]),
    })).filter(track => track.property && track.keys.length);
    const longest = Math.max(0, ...tracks.map(track => track.keys[track.keys.length - 1][0]));
    return {
        name: String(clip?.name ?? ""),
        duration: Number.isFinite(clip?.duration) && clip.duration > 0 ? clip.duration : longest,
        loop: Boolean(clip?.loop),
        tracks,
        events: (Array.isArray(clip?.events) ? clip.events : []).filter(event => Number.isFinite(event?.at)).sort((a, b) => a.at - b.at),
    };
}

/**
 * Value of a track at `time` (numbers and arrays interpolate; other values step).
 * @param {{keys: any[], interpolation?: string}} track @param {number} time
 */
export function SampleTrack(track, time) {
    const keys = track.keys;
    if (time <= keys[0][0]) return keys[0][1];
    const last = keys[keys.length - 1];
    if (time >= last[0]) return last[1];
    let k = 0;
    while (k < keys.length - 2 && time > keys[k + 1][0]) k++;
    const [t0, a] = keys[k], [t1, b] = keys[k + 1];
    if (track.interpolation === "step") return a;
    let f = t1 > t0 ? (time - t0) / (t1 - t0) : 0;
    if (track.interpolation === "smooth") f = f * f * (3 - 2 * f);
    if (typeof a === "number" && typeof b === "number") return a + (b - a) * f;
    if (Array.isArray(a) && Array.isArray(b)) return a.map((value, index) => value + ((b[index] ?? value) - value) * f);
    return f < 1 ? a : b;
}

function Compare(left, op, right) {
    switch (op) {
        case ">": return left > right;
        case "<": return left < right;
        case ">=": return left >= right;
        case "<=": return left <= right;
        case "!=": return left !== right;
        default: return left === right;
    }
}

/**
 * Code-first entry point: an AnimationPlayer for `target`, built with Clip / Track / Event /
 * Transition and added to a level like any entity.
 * @param {any} target @param {Record<string, any>} [settings]
 */
export function Animate(target, settings = {}) {
    return new AnimationPlayer(settings, { target });
}
