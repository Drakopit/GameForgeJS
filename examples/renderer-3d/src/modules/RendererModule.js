import { Module } from 'gameforgejs/core';
import { module2D } from 'gameforgejs/2d';
import { module3D } from 'gameforgejs/3d';
import { TechDemo3DLevel } from '../levels/TechDemo3DLevel.js';

export class RendererModule extends Module {
    constructor() {
        super('renderer-3d', {
            imports: [module2D(), module3D()],
            declarations: [TechDemo3DLevel],
            exports: [TechDemo3DLevel],
        });
    }
}
