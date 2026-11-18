import { WaterVisualSettings as Settings } from '../data/PresentationSettings.js';
import { Geometry3D } from 'gameforgejs/3d';

// A small fixed-topology grid. Only heights and normals change during playback.
export class WaterGeometry extends Geometry3D {
    constructor({ width, depth, segments, amplitude, waveFrequencyX = Settings.waveFrequencyX, waveFrequencyZ = Settings.waveFrequencyZ }) {
        const positions = [];
        const normals = [];
        const uvs = [];
        const indices = [];
        for (let row = 0; row <= segments; row++) {
            for (let column = 0; column <= segments; column++) {
                positions.push((column / segments - 0.5) * width, 0, (row / segments - 0.5) * depth);
                normals.push(0, 1, 0);
                uvs.push(column / segments, row / segments);
                if (row < segments && column < segments) {
                    const first = row * (segments + 1) + column;
                    const next = first + segments + 1;
                    indices.push(first, next, first + 1, first + 1, next, next + 1);
                }
            }
        }
        super({ positions, normals, uvs, indices });
        this.width = width;
        this.depth = depth;
        this.amplitude = amplitude;
        this.waveFrequencyX = waveFrequencyX;
        this.waveFrequencyZ = waveFrequencyZ;
        this.Update(0);
    }

    HeightAt(x, z, phase) {
        // Damp waves at the bank so the shoreline stays joined to the ground.
        const edge = Math.cos(Math.PI * x / this.width) * Math.cos(Math.PI * z / this.depth);
        const waves = Math.sin(x * this.waveFrequencyX + phase) + Settings.secondaryAmplitude * Math.sin(z * this.waveFrequencyZ - phase * Settings.secondarySpeed);
        return this.amplitude * edge * waves;
    }

    Update(phase) {
        const epsilon = Settings.normalSampleDistance;
        for (let index = 0; index < this.positions.length; index += 3) {
            const x = this.positions[index];
            const z = this.positions[index + 2];
            this.positions[index + 1] = this.HeightAt(x, z, phase);
            const slopeX = (this.HeightAt(x + epsilon, z, phase) - this.HeightAt(x - epsilon, z, phase)) / (2 * epsilon);
            const slopeZ = (this.HeightAt(x, z + epsilon, phase) - this.HeightAt(x, z - epsilon, phase)) / (2 * epsilon);
            const length = Math.hypot(slopeX, 1, slopeZ);
            this.normals[index] = -slopeX / length;
            this.normals[index + 1] = 1 / length;
            this.normals[index + 2] = -slopeZ / length;
        }
        this.MarkUpdated();
    }
}
