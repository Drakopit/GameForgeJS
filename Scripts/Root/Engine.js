import { Base } from "./Base";
import { GameObject } from "./GameObject";

export var GameObjects = [];
var startTime; var lastTime; var deltaTime;

export class Engine extends Base {
    constructor() {}

    static Start() {
        for (const gameObject of GameObjects) {
            if (gameObject instanceof GameObject) gameObject.Start();
        }
    }

    static Update() {
        startTime = performance.now();
        deltaTime = ((startTime - lastTime) / 1000.0);

        // Loop Baseado no FPS
        for (const gameObject of GameObjects) {
            if (gameObject instanceof GameObject) gameObject.Update();
        }

        // Loop com deltaTime
        for (const gameObject of GameObjects) {
            if (gameObject instanceof GameObject) gameObject.FixedUpdate(deltaTime);
        }

        // Draw
        for (const gameObject of GameObjects) {
            if (gameObject instanceof GameObject) gameObject.DrawnSelf();
        }

        // Interface gráfica
        for (const gameObject of GameObject) {
            if (gameObject instanceof GameObject) gameObject.OnGUI();
        }

        lastTime = startTime;
        let self = this;
        window.requestAnimationFrame(self.Loop.bind(self));
    }

    static AddObject(object) {
        GameObjects.push(object);
    }

    static GetObject(id, name) {
        return GameObjects.find(id) || GameObjects.find(name);
    }

    static DeleteObject(id, name) {
        let gameObject = GameObjects.find(id) || GameObjects.find(name);
        delete gameObject;
    }
}