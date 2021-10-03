// JavaScript source code
export class Store {
    constructor() { }

    // Salva o estado atual
    SaveState(state) {
        window.localStorage.setItem("gameState", JSON.stringify(state));
    }

    // Retorna o estado antes salvo
    RestoreState() {
        let state = window.localStorage.getItem("gameState");
        if (state) return JSON.parse(state);
        else return null;
    }
}