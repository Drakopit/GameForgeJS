// @ts-check
import { EventEmitter, Vector2D } from 'gameforgejs/core';
import { GameObject, ParticleSystem, CanvasRenderTarget } from 'gameforgejs/2d';
import { RippleField } from '../components/RippleField.js';
import { ParticleEmitter } from '../components/ParticleEmitter.js';
import { WeatherEmitter } from '../components/WeatherEmitter.js';
import { PropPhysics } from '../systems/PropPhysics.js';
import { SeededRandom } from '../data/SeededRandom.js';

/** Composes systems/components; the Level/Engine remains the only update owner. */
export class FoundryWorld extends GameObject {
    /** @param {import('../data/FoundrySettings.js').FoundrySettings} settings @param {number} width @param {number} height */
    constructor(settings, width, height) {
        super();
        this.settings = settings; this.width = width; this.height = height;
        this.surfaceY = height * 0.72; this.age = 0; this.trauma = 0; this.gust = 0;
        this.events = new EventEmitter(); this.random = new SeededRandom(settings.data.seed);
        this.target = new CanvasRenderTarget(Math.round(width), Math.round(height));
        this.emitter = new Vector2D(width * 0.58, height * 0.47);
        /** @type {import('./FoundryProp.js').FoundryProp[]} */ this.props = [];
        /** @type {RippleField} */ this.water = this.AddComponent(new RippleField(settings.data.limits.ripples));
        /** @type {ParticleSystem} */ this.rain = this.AddComponent(new ParticleSystem({ capacity: settings.data.limits.rain }));
        /** @type {ParticleSystem} */ this.particles = this.AddComponent(new ParticleSystem({ capacity: settings.data.limits.particles }));
        /** @type {ParticleSystem} */ this.splashes = this.AddComponent(new ParticleSystem({ capacity: settings.data.limits.splashes }));
        /** @type {WeatherEmitter} */ this.weather = this.AddComponent(new WeatherEmitter(this));
        this.rain.onStep = particle => this.weather.StepRain(particle);
        /** @type {ParticleEmitter} */ this.emission = this.AddComponent(new ParticleEmitter(this));
        /** @type {PropPhysics} */ this.physics = this.AddComponent(new PropPhysics(this));
    }
    /** @param {number} dt */
    OnUpdate(dt) {
        this.age += dt; this.trauma = Math.max(0, this.trauma - dt * 0.7); this.gust *= Math.exp(-dt * 2);
        super.OnUpdate(dt);
    }
    /** @param {number} x @param {number} y @param {number} power */
    Splash(x, y, power) {
        for (let index = 0; index < Math.ceil(10 * power); index++) {
            this.splashes.Emit(x, y, { vx: this.random.Range(-85, 85) * power, vy: this.random.Range(-120, -35) * power,
                gravity: 380, drag: 0.8, lifetime: this.random.Range(0.25, 0.65), size: 1.4 * power, endSize: 0,
                color: { r: 126, g: 235, b: 241 }, endColor: { r: 44, g: 102, b: 121 }, opacity: 0.8 });
        }
    }
    /** @param {number} x @param {number} y @param {number} [vx] @param {number} [vy] */
    Drop(x, y, vx = 70, vy = -180) {
        const actor = this.props.find(prop => !prop.active);
        if (actor) actor.Launch(x, y, vx, vy);
    }
    Burst() { this.emission.Emit(120, 1.5); this.trauma = Math.min(1, this.trauma + 0.35); }
    Gust() { this.gust = -300; this.trauma = Math.min(1, this.trauma + 0.3); }
    /** @param {number} width @param {number} height */
    Resize(width, height) {
        const scaleX = width / this.width, scaleY = height / this.height;
        for (const system of [this.rain, this.particles, this.splashes]) for (const particle of system.particles) {
            particle.position.x *= scaleX; particle.position.y *= scaleY;
        }
        for (const actor of this.props) if (actor.active) {
            actor.position.x = Math.max(0, Math.min(width - actor.size.x, actor.position.x * scaleX));
            actor.position.y = Math.min(height * 0.72 - actor.size.y, actor.position.y * scaleY);
        }
        for (const ring of this.water.rings) if (ring.active) {
            ring.x *= scaleX; ring.y *= scaleY; ring.radius *= scaleX; ring.stretch *= scaleY / scaleX;
        }
        this.width = width; this.height = height; this.surfaceY = height * 0.72;
        this.emitter.Set(width * 0.58, height * 0.47); this.target.Resize(Math.round(width), Math.round(height));
    }
    Clear() {
        this.random = new SeededRandom(this.settings.data.seed);
        this.rain.Clear(); this.particles.Clear(); this.splashes.Clear(); this.water.Clear();
        this.emission.carry = 0; this.weather.carry = 0;
        for (const actor of this.props) actor.SetActive(false);
        this.trauma = 0; this.gust = 0; this.age = 0;
        const prewarm = Math.min(260, this.settings.current.rainRate / 2);
        for (let index = 0; index < prewarm; index++) this.weather.Emit(true);
        this.Drop(this.width * 0.45, this.height * 0.22, 65, -20);
        this.Drop(this.width * 0.64, this.height * 0.34, -90, -60);
    }
    OnDestroy() { super.OnDestroy(); this.events.clear(); this.target.Dispose(); }
}
