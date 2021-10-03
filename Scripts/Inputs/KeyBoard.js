export var KeyResponse = {
    getKeyDown: 0,
    getKeyUp: 0,
    getKeyPress: 0
};

// TODO: Precisa verificar essa classe
export class KeyBoard {
    constructor() {}
    
    static GetKeyDown(evento) {
        if (evento !== undefined) {
            KeyResponse.getKeyUp = 0;
            // KeyResponse.getKeyPress = 0;
            KeyResponse.getKeyDown = evento.keyCode;
            // return evento.keyCode;
        }
    }

    static GetKeyUp(evento) {
        if (evento !== undefined) {
            KeyResponse.getKeyDown = 0;
            // KeyResponse.getKeyPress = 0;
            KeyResponse.getKeyUp = evento.keyCode;
            // return evento.keyCode;
        }
    }

    static GetKeyPress(evento) {
        if (evento !== undefined) {
            // KeyResponse.getKeyDown = 0;
            // KeyResponse.getKeyUp = 0;
            KeyResponse.getKeyPress = evento.keyCode;
            // return evento.keyCode;
        }
    }
}