/**
 * Seeded bounded rain simulation in world coordinates. FixedUpdate owns motion;
 * a native renderer component can consume drops without owning another loop.
 * @param {Object} [options] Count (0–2048), bounds, speed, wind, seed, heightAt and onImpact.
 */
export class RainEmitter extends Component {
    constructor({ count, bounds, speed, wind, seed, heightAt, onImpact }?: {
        count?: number;
        bounds?: {
            width: number;
            depth: number;
            height: number;
        };
        speed?: number;
        wind?: Vector3D;
        seed?: number;
        heightAt?: () => number;
        onImpact?: () => void;
    });
    bounds: {
        width: number;
        depth: number;
        height: number;
    };
    speed: number;
    wind: Vector3D;
    seed: number;
    heightAt: () => number;
    onImpact: () => void;
    impacts: number;
    drops: {
        position: Vector3D;
        impact: Vector3D;
        splash: number;
    }[];
    activeCount: number;
    Random(): number;
    Spawn(drop: any, initial?: boolean): void;
    SetIntensity(intensity: any): void;
}
import { Component } from '../../core/Component.js';
import { Vector3D } from '../../core/Math/Vector3D.js';
