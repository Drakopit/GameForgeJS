/**
 * Static helpers and coefficient values for basic 2D motion calculations.
 */
export class Physic2D {
    static Init(): void;
    static relativeForce(mass: any, accelaration: any): number;
    static weightForce(mass: any, gravity: any): number;
    static normalForce(mass: any, gravity: any, angle: any, coefficientFriction: any): number | Vector3D;
    static frictionForce(accelarationFriction: any, normalForce: any): number;
    static elasticForce(elasticConstant: any, deformation: any): number;
    static elasticConstant(newtonPerMetre: any, mass: any): number;
    static centripetalForce(ray: any, mass: any, velocity: any, angle: any): number;
}
import { Vector3D } from "../../core/Math/Vector3D.js";
