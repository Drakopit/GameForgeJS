/** Gradual rain wetting and evaporation over shared native surface materials. */
export class WetSurfaceResponse extends Component {
    constructor(rain: any, materials: any, { wetting, drying }?: {
        wetting?: number;
        drying?: number;
    });
    rain: any;
    materials: Set<any>;
    wetting: number;
    drying: number;
}
import { Component } from '../../core/Component.js';
