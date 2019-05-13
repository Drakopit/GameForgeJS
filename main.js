import { Button } from "Scripts/Button";

class Base {
    constructor() {
        // Sempre é chamado
        Awake();
    }

    static Awake() {
        // Cálcula o tempo de Runtime
        var startTime;
        var deltaTime = deltaTime || new Date().getTime();
        var runTime = deltaTime - startTime;

        // Define o método de atualização da tela
        window.requestAnimationFrame = window.requestAnimationFrame // Padrão
        || window.mozRequestAnimationFrame // Mozilla
        || window.webkitRequestAnimationFrame // Chrome
        || window.msRequestAnimationFrame // Safari
        || function(f) {return setTimeout(f, 1000/60)} // Simula FPS 60
    }

    Start() {

    }

    Update() {
    }

    FixedUpdate() {

    }

    OnGUI() {

    }
}

class OnGUI extends Base {
    constructor(id) {
        // O Id padrão é Main, caso nenhum seja especificado, ele será atribuido
        var canvas = (id == undefined) ? document.getElementById("Main") : document.getElementById(id);
        // Por hora, só o modo 2d é Suportado
        var context = canvas.getContext("2d");
    }

    Button(x, y, width, height, callBack) {
        var button = new Button();
        button.Draw(x,y,width,height);
    }
}

class Input extends Base {
    constructor() {}
}

class GameObject extends Base {
    constructor() {}
}