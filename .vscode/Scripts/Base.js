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