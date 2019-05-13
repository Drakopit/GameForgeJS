import {Base} from "Base.js"


// API padrão usa KeyboardEvent
class Input extends Base {
    constructor() {
        // var KeyCode = {
        //     key: "",
        //     value: 0
        // }
        // var CharCode = {
        //     key: 0,
        //     value: ""
        // }

        this.KeyCode = {
            "Backspace":8,
            "Tab":9,
            "Enter":13,
            "Shift":16,
            "Ctrl":17,
            "Alt":18,
            "Pause/Break":19,
            "Caps Lock":20,
            "Esc":27,
            "Space":32,
            "Page Up":33,
            "Page Down":34,
            "End":35,
            "Home":36,
            "Left":37,
            "Up":38,
            "Right":39,
            "Down":40,
            "Insert":45,
            "Delete":46,
            "0":48, "1":49, "2":50, "3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,
            "A":65,"B":66,"C":67,"D":68,"E":69,"F":70,"G":71,"H":72,"I":73,"J":74,"K":75,
            "L":76,"M":77,"N":78,"O":79,"P":80,"Q":81,"R":82,"S":83,"T":84,"U":85,"V":86,"W":87,"X":88,"Y":89,"Z":90,
            "Windows":91,
            "Right Click":93,
            "Numpad 0":96,"Numpad 1":97,"Numpad 2":98,"Numpad 3":99,"Numpad 4":100,"Numpad 5":101,"Numpad 6":102,"Numpad 7":103,"Numpad 8":104,"Numpad 9":105,
            "Numpad *":106,"Numpad +":107,"Numpad -":109,"Numpad .":110,"Numpad /":111,
            "F1":112,"F2":113,"F3":114,"F4":115,"F5":116,"F6":117,"F7":118,"F8":119,"F9":120,"F10":121,"F11":122,"F12":123,
            "Num Lock":144,"Scroll Lock":145,
            "My Computer":182,"My Calculator":183,
            ";":186,"=":187,",":188,"-":189,".":190,"/":191,"`":192,"[":219,"\\":220,"]":221,"'":222
        };
        this.CharCode = {
            8:"Backspace",
            9:"Tab",
            13:"Enter",
            16:"Shift",
            17:"Ctrl",
            18:"Alt",
            19:"Pause/Break",
            20:"Caps Lock",
            27:"Esc",
            32:"Space",
            33:"Page Up",
            34:"Page Down",
            35:"End",
            36:"Home",
            37:"Left",
            38:"Up",
            39:"Right",
            40:"Down",
            45:"Insert",
            46:"Delete",
            48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",
            65:"A",66:"B",67:"C",68:"D",69:"E",70:"F",71:"G",72:"H",73:"I",74:"J",75:"K",
            76:"L",77:"M",78:"N",79:"O",80:"P",81:"Q",82:"R",83:"S",84:"T",85:"U",86:"V",
            87:"W",88:"X",89:"Y",90:"Z",
            91:"Windows",
            93:"Right Click",
            96:"Numpad 0",97:"Numpad 1",98:"Numpad 2",99:"Numpad 3",100:"Numpad 4",101:"Numpad 5",102:"Numpad 6",103:"Numpad 7",104:"Numpad 8",105:"Numpad 9",
            106:"Numpad *",107:"Numpad +",109:"Numpad -",110:"Numpad .",111:"Numpad /",
            112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",
            144:"Num Lock",145:"Scroll Lock",
            182:"My Computer",183:"My Calculator",
            186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"
        };
        // keyCodeToChar = {8:"Backspace",9:"Tab",13:"Enter",16:"Shift",17:"Ctrl",18:"Alt",19:"Pause/Break",20:"Caps Lock",27:"Esc",32:"Space",33:"Page Up",34:"Page Down",35:"End",36:"Home",37:"Left",38:"Up",39:"Right",40:"Down",45:"Insert",46:"Delete",48:"0",49:"1",50:"2",51:"3",52:"4",53:"5",54:"6",55:"7",56:"8",57:"9",65:"A",66:"B",67:"C",68:"D",69:"E",70:"F",71:"G",72:"H",73:"I",74:"J",75:"K",76:"L",77:"M",78:"N",79:"O",80:"P",81:"Q",82:"R",83:"S",84:"T",85:"U",86:"V",87:"W",88:"X",89:"Y",90:"Z",91:"Windows",93:"Right Click",96:"Numpad 0",97:"Numpad 1",98:"Numpad 2",99:"Numpad 3",100:"Numpad 4",101:"Numpad 5",102:"Numpad 6",103:"Numpad 7",104:"Numpad 8",105:"Numpad 9",106:"Numpad *",107:"Numpad +",109:"Numpad -",110:"Numpad .",111:"Numpad /",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"Num Lock",145:"Scroll Lock",182:"My Computer",183:"My Calculator",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"};
        // keyCharToCode = {"Backspace":8,"Tab":9,"Enter":13,"Shift":16,"Ctrl":17,"Alt":18,"Pause/Break":19,"Caps Lock":20,"Esc":27,"Space":32,"Page Up":33,"Page Down":34,"End":35,"Home":36,"Left":37,"Up":38,"Right":39,"Down":40,"Insert":45,"Delete":46,"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"A":65,"B":66,"C":67,"D":68,"E":69,"F":70,"G":71,"H":72,"I":73,"J":74,"K":75,"L":76,"M":77,"N":78,"O":79,"P":80,"Q":81,"R":82,"S":83,"T":84,"U":85,"V":86,"W":87,"X":88,"Y":89,"Z":90,"Windows":91,"Right Click":93,"Numpad 0":96,"Numpad 1":97,"Numpad 2":98,"Numpad 3":99,"Numpad 4":100,"Numpad 5":101,"Numpad 6":102,"Numpad 7":103,"Numpad 8":104,"Numpad 9":105,"Numpad *":106,"Numpad +":107,"Numpad -":109,"Numpad .":110,"Numpad /":111,"F1":112,"F2":113,"F3":114,"F4":115,"F5":116,"F6":117,"F7":118,"F8":119,"F9":120,"F10":121,"F11":122,"F12":123,"Num Lock":144,"Scroll Lock":145,"My Computer":182,"My Calculator":183,";":186,"=":187,",":188,"-":189,".":190,"/":191,"`":192,"[":219,"\\":220,"]":221,"'":222};
    }

    // Retorna o código, pelo nome dado
    GetKey(keyCode) {
        return this.KeyCode[keyCode];
    }

    // Retorna a tecla que esta sendo pressionada
    GetKeyPress() {
        let key;
        canvas.addEventListener('keypress', (e) => {
            key = e.which || e.KeyCode;
        }, false);
        return key;
    }

    // Retorna a tecla que foi pressionada
    GetKeyDown() {
        let key;
        canvas.addEventListener('keydown', (e) => {
            key = e.which || e.KeyCode;
        }, false);
        return key;
    }

    // Retorna a tecla que foi solta
    GetKeyRelease() {
        let key;
        canvas.addEventListener('keyup', (e) => {
            key = e.which || e.KeyCode;
        }, false);
        return key;
    }
}

/*
function displayKeyCode(evt)
{
var textBox = getObject('txtChar');
var charCode = (evt.which) ? evt.which : event.keyCode
textBox.value = String.fromCharCode(charCode);
if (charCode == 8) textBox.value = "backspace"; //  backspace
if (charCode == 9) textBox.value = "tab"; //  tab
if (charCode == 13) textBox.value = "enter"; //  enter
if (charCode == 16) textBox.value = "shift"; //  shift
if (charCode == 17) textBox.value = "ctrl"; //  ctrl
if (charCode == 18) textBox.value = "alt"; //  alt
if (charCode == 19) textBox.value = "pause/break"; //  pause/break
if (charCode == 20) textBox.value = "caps lock"; //  caps lock
if (charCode == 27) textBox.value = "escape"; //  escape
if (charCode == 33) textBox.value = "page up"; // page up, to avoid displaying alternate character and confusing people	         
if (charCode == 34) textBox.value = "page down"; // page down
if (charCode == 35) textBox.value = "end"; // end
if (charCode == 36) textBox.value = "home"; // home
if (charCode == 37) textBox.value = "left arrow"; // left arrow
if (charCode == 38) textBox.value = "up arrow"; // up arrow
if (charCode == 39) textBox.value = "right arrow"; // right arrow
if (charCode == 40) textBox.value = "down arrow"; // down arrow
if (charCode == 45) textBox.value = "insert"; // insert
if (charCode == 46) textBox.value = "delete"; // delete
if (charCode == 91) textBox.value = "left window"; // left window
if (charCode == 92) textBox.value = "right window"; // right window
if (charCode == 93) textBox.value = "select key"; // select key
if (charCode == 96) textBox.value = "numpad 0"; // numpad 0
if (charCode == 97) textBox.value = "numpad 1"; // numpad 1
if (charCode == 98) textBox.value = "numpad 2"; // numpad 2
if (charCode == 99) textBox.value = "numpad 3"; // numpad 3
if (charCode == 100) textBox.value = "numpad 4"; // numpad 4
if (charCode == 101) textBox.value = "numpad 5"; // numpad 5
if (charCode == 102) textBox.value = "numpad 6"; // numpad 6
if (charCode == 103) textBox.value = "numpad 7"; // numpad 7
if (charCode == 104) textBox.value = "numpad 8"; // numpad 8
if (charCode == 105) textBox.value = "numpad 9"; // numpad 9
if (charCode == 106) textBox.value = "multiply"; // multiply
if (charCode == 107) textBox.value = "add"; // add
if (charCode == 109) textBox.value = "subtract"; // subtract
if (charCode == 110) textBox.value = "decimal point"; // decimal point
if (charCode == 111) textBox.value = "divide"; // divide
if (charCode == 112) textBox.value = "F1"; // F1
if (charCode == 113) textBox.value = "F2"; // F2
if (charCode == 114) textBox.value = "F3"; // F3
if (charCode == 115) textBox.value = "F4"; // F4
if (charCode == 116) textBox.value = "F5"; // F5
if (charCode == 117) textBox.value = "F6"; // F6
if (charCode == 118) textBox.value = "F7"; // F7
if (charCode == 119) textBox.value = "F8"; // F8
if (charCode == 120) textBox.value = "F9"; // F9
if (charCode == 121) textBox.value = "F10"; // F10
if (charCode == 122) textBox.value = "F11"; // F11
if (charCode == 123) textBox.value = "F12"; // F12
if (charCode == 144) textBox.value = "num lock"; // num lock
if (charCode == 145) textBox.value = "scroll lock"; // scroll lock
if (charCode == 186) textBox.value = ";"; // semi-colon
if (charCode == 187) textBox.value = "="; // equal-sign
if (charCode == 188) textBox.value = ","; // comma
if (charCode == 189) textBox.value = "-"; // dash
if (charCode == 190) textBox.value = "."; // period
if (charCode == 191) textBox.value = "/"; // forward slash
if (charCode == 192) textBox.value = "`"; // grave accent
if (charCode == 219) textBox.value = "["; // open bracket
if (charCode == 220) textBox.value = "\\"; // back slash
if (charCode == 221) textBox.value = "]"; // close bracket
if (charCode == 222) textBox.value = "'"; // single quote
var lblCharCode = getObject('spnCode');
lblCharCode.innerHTML = 'KeyCode:  ' + charCode;
return false;
}
function getObject(obj)
{
var theObj;
if (document.all) {
if (typeof obj=='string') {
return document.all(obj);
} else {
return obj.style;
}
}
*/