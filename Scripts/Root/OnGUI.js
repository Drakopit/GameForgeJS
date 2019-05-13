class OnGUI extends Base {
    constructor(id) {
        // O Id padrão é Main, caso nenhum seja especificado, ele será atribuido
        var canvas = (id == undefined) ? document.getElementById("Main") : document.getElementById(id);
        // Por hora, só o modo 2d é Suportado
        var context = canvas.getContext("2d");
    }

    Button(x, y, width, height, callBack) {
        var button = new Button(canvas);
        button.Draw(x,y,width,height);
    }
}