// @ts-check
import { Component } from "../Component.js";
import { SceneComponents } from "../Scene/SceneComponents.js";

/**
 * Keyframe animation for a scene node, with a basic state machine.
 *
 * A clip (`Animation.clips[]`) has `name`, `duration`, `loop`, `tracks` and `events`:
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
 * @example
 * const player = new AnimationPlayer(node.components.Animation, { target: AnimationPlayer.Bind(mesh.transform, { meshes: [mesh] }) });
 * player.SetTrigger("hit");
 * player.On("footstep", () => sounds.Play("step"));
 */
export class AnimationPlayer extends Component {
    /**
     * @param {Record<string, any>} [settings] - `Animation` component values.
     * @param {{target?: {Get?: (property: string) => any, Set: (property: string, value: any) => void, PlayClip?: (name: string) => void}|null, name?: string}} [options]
     */
    constructor(settings = {}, { target = null, name = "" } = {}) {
        super();
        this.name = name;
        this.target = target;
        /** @type {Map<string, Set<Function>>} */
        this.listeners = new Map();
        this.Configure(settings);
    }

    /** @param {Record<string, any>} settings */
    Configure(settings) {
        this.settings = SceneComponents.Resolve("Animation", settings);
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

    /** The clip of a state, or null. @param {string} name */
    Clip(name) {
        return this.clips.get(name) ?? null;
    }

    /** Switches to a state (clip) from its start. @param {string} name */
    Play(name) {
        const clip = this.Clip(name);
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
        const clip = this.Clip(/** @type {string} */ (this.state));
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

    /**
     * A target for 3D nodes (a Transform3D and its meshes) or 2D objects (x / y, rotation, scale,
     * color, alpha fields): position / rotation / scale / color / opacity, any other field by name,
     * and `clip` through the object's `animator` (sprite) or `skeletal` animator.
     * @param {any} object - Transform3D, or a 2D game object.
     * @param {{meshes?: any[], animator?: any}} [options]
     */
    static Bind(object, { meshes = [], animator = null } = {}) {
        const isTransform3D = Array.isArray(object?.position) && object?.rotation && "x" in object.rotation;
        const materials = () => meshes.map(mesh => mesh.material).filter(Boolean);
        return {
            Get(property) {
                if (isTransform3D && property === "rotation") return [object.rotation.x, object.rotation.y, object.rotation.z];
                if (property === "color") return materials()[0]?.albedoColor ?? object.color;
                return object?.[property];
            },
            Set(property, value) {
                if (isTransform3D) {
                    if (property === "position") return object.SetPosition?.(value[0], value[1], value[2]) ?? object.position.splice(0, 3, ...value);
                    if (property === "rotation") return object.SetRotation?.(value[0], value[1], value[2]);
                    if (property === "scale") return object.SetScale?.(value[0], value[1], value[2]) ?? object.scale.splice(0, 3, ...value);
                }
                if (property === "color" || property === "opacity") {
                    const list = materials();
                    if (list.length) {
                        for (const material of list) {
                            if (!material.albedoColor) continue;
                            if (property === "color") material.albedoColor = [...value];
                            else material.albedoColor[3] = value;
                            if ((property === "opacity" ? value : value[3]) < 1) material.transparent = true;
                        }
                        return;
                    }
                    if (property === "opacity") { object.alpha = value; object.opacity = value; return; }
                }
                if (property === "position" && !isTransform3D && object && "x" in object) {
                    object.x = value[0]; object.y = value[1];
                    return;
                }
                if (property === "rotation" && !isTransform3D && Array.isArray(value)) { object.rotation = value[2] ?? value[0]; return; }
                if (object) object[property] = Array.isArray(value) ? [...value] : value;
            },
            PlayClip(name) {
                const target = animator ?? object?.animator ?? object?.skeletal;
                target?.Play?.(name);
            },
        };
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
