import { Draw, InputHelpPanel as InfoPanel } from 'gameforgejs/2d';

import { FightingGameSession } from "../state/FightingGameState.js";

export class FightingHelp extends InfoPanel {
    constructor(screen) {
        super(new Draw(screen), { title: 'GUIA DE COMBATE / H ou Start', x: 100, y: 112, width: 760, lines: [], playerRows: () => FightingGameSession.mode === "versus" ? [1, 2].map(seat =>
            (this.data.rows ?? []).filter(row => row.id?.startsWith("p" + seat + "-"))
                .map(row => ({ ...row, label: row.label.replace(/^P[12] /, "") }))) : [] });
    }
}
