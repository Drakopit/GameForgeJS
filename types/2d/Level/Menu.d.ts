/**
 * Basic keyboard-controlled menu level supplied as a simple 2D example.
 */
export class Menu extends Level {
    OnStart(): void;
    options: string[];
    currentSelected: number;
    draw: Draw;
    OnFixedUpdate(dt: any): void;
}
import { Level } from "../../core/Level/Level.js";
import { Draw } from "../Graphics/Draw.js";
