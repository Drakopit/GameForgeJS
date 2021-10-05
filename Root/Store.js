/**
 * @doc Class Store
 * @namespace Root
 * @class Store
 * @author Patrick Faustino Camello
 * @summary That class was made, to compose the EngineHtml5 framework.
 * @Date 15/05/2019
 * @example var store = new Store();
 *  It's class is used to save informations in browser 
 * @returns {Object}
 */

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