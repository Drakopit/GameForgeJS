import { FoundryAudio } from '../components/FoundryAudio.js';
// @ts-check
import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { FoundryLevel } from '../levels/FoundryLevel.js';
import { FoundryWorld } from '../entities/FoundryWorld.js';
import { FoundryProp } from '../entities/FoundryProp.js';
import { WeatherEmitter } from '../components/WeatherEmitter.js';
import { ParticleEmitter } from '../components/ParticleEmitter.js';
import { RippleField } from '../components/RippleField.js';
import { WaterContact } from '../components/WaterContact.js';
import { PropForces } from '../components/PropForces.js';
import { PropVisual } from '../components/PropVisual.js';
import { PropPhysics } from '../systems/PropPhysics.js';

export class FoundryModule extends Module {
    constructor() {
        super('storm-foundry-2d', { imports: [module2D({ telemetry: true })],
            declarations: [FoundryAudio, FoundryLevel, FoundryWorld, FoundryProp, WeatherEmitter, ParticleEmitter,
                RippleField, WaterContact, PropForces, PropVisual, PropPhysics], exports: [FoundryLevel] });
    }
}
