import { LevelHandler } from "../Root/Engine.js";
import { Menu } from "../Template/Menu.js";
import { ActionManager } from "../Input/ActionManager.js";
import { Logger } from "../Root/Logger.js";

export class MiniGame3DMenu extends Menu {
    constructor() {
        super();
    }

    OnStart() {
        super.OnStart();
        this.caption = "Menu Principal - MiniGame 3D";
        this.options = new Array("Iniciar Jogo", "Continuar", "Opções", "Sair");
    }

    OnUpdate(dt) {
        super.OnUpdate(dt);
        if (ActionManager.IsAction("ATTACK")) {
            switch (this.currentSelected) {
                case 0:
                    LevelHandler.current.Next = true; // Inicia o jogo
                    break;
                case 1:
                    Logger.log("info", "Opções selecionadas - funcionalidade ainda não implementada.");
                    break;
                case 2:
                    Logger.log("info", "Saindo do jogo - funcionalidade ainda não implementada.");
                    break;
                default:
                    Logger.log("error", "Opção inválida selecionada.");
                    break;
            }
        }
    }

    OnGUI() {
        super.OnGUI();
    }
}