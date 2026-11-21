import { Mat4 } from '../../core/Math/Mat4.js';

/** Instance-local glTF node transforms, independent of the shared loaded asset. */
export class SkeletonPose {
    constructor(nodes) {
        this.nodes = nodes;
        this.world = nodes.map(() => Mat4.create());
        this.parents = nodes.map(() => -1);
        for (const node of nodes) {
            for (const child of node.children) {
                if (!nodes[child] || this.parents[child] !== -1) throw new Error('Invalid skeleton hierarchy.');
                this.parents[child] = node.index;
            }
        }
        this.Reset();
    }

    Reset() {
        this.local = this.nodes.map(node => ({
            translation: [...node.translation],
            rotation: [...node.rotation],
            scale: [...node.scale],
        }));
    }

    UpdateWorld() {
        const status = new Uint8Array(this.nodes.length);
        const update = index => {
            if (status[index] === 2) return;
            if (status[index] === 1) throw new Error('Skeleton hierarchy contains a cycle.');
            status[index] = 1;
            const node = this.nodes[index];
            const pose = this.local[index];
            const local = node.matrix ? new Float32Array(node.matrix)
                : Mat4.fromRotationTranslationScale(Mat4.create(), pose.rotation, pose.translation, pose.scale);
            const parent = this.parents[index];
            if (parent !== -1) {
                update(parent);
                Mat4.multiply(this.world[index], this.world[parent], local);
            } else Mat4.copy(this.world[index], local);
            status[index] = 2;
        };
        this.nodes.forEach((node, index) => update(index));
    }
}
