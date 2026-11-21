import { SkeletonPose } from './SkeletonPose.js';
import { CpuSkinDeformer } from './CpuSkinDeformer.js';
import { SampleTrack } from './ClipSampler.js';

/**
 * CPU glTF skeletal playback for small scenes. Owns pose and deformed geometry
 * per Model3D instance. Supports TRS tracks with LINEAR/STEP interpolation.
 * Animation libraries must use matching node names, parent names and rest poses;
 * this is compatible-rig binding, not arbitrary animation retargeting.
 */
export class SkeletalAnimator {
    constructor(model) {
        if (!model.sourceAsset?.nodes?.length) throw new Error('SkeletalAnimator requires a model with glTF node metadata.');
        this.model = model;
        this.pose = new SkeletonPose(model.sourceAsset.nodes);
        this.deformers = model.meshes.filter(mesh => mesh.modelPart.skin).map(mesh => new CpuSkinDeformer(mesh));
        this.clips = new Map();
        this.current = null;
        this.time = 0;
        this.loop = true;
        this.finished = false;
        this.ApplyPose();
    }

    /** Bind one clip from the model itself or a compatible loaded animation asset. */
    AddClip(name, source = this.model.sourceAsset, clipName = name) {
        const clip = source.animations.find(animation => animation.name === clipName);
        if (!clip) throw new Error(`Animation clip '${clipName}' was not found.`);
        const names = new Map(this.pose.nodes.map(node => [node.name, node]));
        if (names.size !== this.pose.nodes.length) throw new Error('Animation binding requires unique node names.');
        const sourceParents = new Map();
        if (new Set(source.nodes.map(node => node.name)).size !== source.nodes.length) {
            throw new Error('Animation library requires unique node names.');
        }
        for (const node of source.nodes) for (const child of node.children) sourceParents.set(child, node);
        const channels = clip.channels.map(channel => {
            const original = source.nodes[channel.target.node];
            const node = names.get(original?.name);
            if (!node || node.matrix || original.matrix) throw new Error(`Unsupported animation target '${original?.name}'.`);
            if (!['translation', 'rotation', 'scale'].includes(channel.target.path)) {
                throw new Error(`Unsupported animation path '${channel.target.path}'.`);
            }
            ValidateBinding(node, original, this.pose, sourceParents);
            const sampler = clip.samplers[channel.sampler];
            const size = channel.target.path === 'rotation' ? 4 : 3;
            if (!sampler || !['LINEAR', 'STEP'].includes(sampler.interpolation)
                || !sampler.input.length || sampler.output.length !== sampler.input.length * size) {
                throw new Error(`Unsupported animation sampler in '${clipName}'.`);
            }
            for (let index = 0; index < sampler.input.length; index++) {
                const time = sampler.input[index];
                if (!Number.isFinite(time) || time < 0 || (index > 0 && time <= sampler.input[index - 1])) {
                    throw new Error(`Invalid keyframe times in '${clipName}'.`);
                }
            }
            if (!sampler.output.every(Number.isFinite)) throw new Error(`Invalid keyframe values in '${clipName}'.`);
            if (channel.target.path === 'rotation') {
                for (let offset = 0; offset < sampler.output.length; offset += 4) {
                    const length = Math.hypot(...sampler.output.slice(offset, offset + 4));
                    if (Math.abs(length - 1) > 0.001) throw new Error(`Invalid rotation quaternion in '${clipName}'.`);
                }
            }
            return { node: node.index, path: channel.target.path, sampler };
        });
        const duration = Math.max(0, ...channels.map(channel => channel.sampler.input.at(-1)));
        this.clips.set(name, { name, duration, channels });
        return this;
    }

    /** Select a clip without restarting it on repeated calls for the same name. */
    Play(name, { loop = true, restart = false } = {}) {
        const clip = this.clips.get(name);
        if (!clip) throw new Error(`Animation '${name}' is not registered.`);
        if (this.current === clip && !restart) return;
        this.current = clip;
        this.loop = loop;
        this.Seek(0);
    }

    Update(dt) {
        if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Animation delta must be finite and nonnegative.');
        if (this.current && !this.finished) this.Seek(this.time + dt);
    }

    /** Sample a clip at an explicit time, useful for combat-timeline synchronization. */
    Seek(time) {
        if (!Number.isFinite(time) || time < 0) throw new RangeError('Animation time must be finite and nonnegative.');
        if (!this.current) return;
        const duration = this.current.duration;
        this.time = this.loop && duration > 0 ? time % duration : Math.min(time, duration);
        this.finished = !this.loop && time >= duration;
        this.pose.Reset();
        for (const channel of this.current.channels) {
            this.pose.local[channel.node][channel.path] = SampleTrack(channel.sampler, channel.path, this.time);
        }
        this.ApplyPose();
    }

    ApplyPose() {
        this.pose.UpdateWorld();
        for (const mesh of this.model.meshes) {
            if (mesh.modelPart.node) mesh.transform.matrix = this.pose.world[mesh.modelPart.node.index];
        }
        for (const deformer of this.deformers) deformer.Apply(this.pose);
    }
}

function ValidateBinding(node, source, pose, sourceParents) {
    while (node || source) {
        if (!node || !source || node.name !== source.name) throw new Error('Incompatible animation parent hierarchy.');
        if (node.matrix || source.matrix) throw new Error(`Matrix-node animation binding is unsupported: '${node.name}'.`);
        for (const field of ['translation', 'rotation', 'scale']) {
            if (node[field].some((value, index) => Math.abs(value - source[field][index]) > 0.0001)) {
                throw new Error(`Incompatible rest pose for '${node.name}'.`);
            }
        }
        node = pose.nodes[pose.parents[node.index]];
        source = sourceParents.get(source.index);
    }
}
