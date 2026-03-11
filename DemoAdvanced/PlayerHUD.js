import { Vector2D } from "../Math/Vector2D.js";
import { Draw } from "../Graphic/Draw.js";
import { AssetManager } from "../Root/AssetManager.js";

export class PlayerHUD {
    constructor(screen, playerRef) {
        this.screen = screen;
        this.player = playerRef;
        this.draw = new Draw(screen);

        // Opcional: Pega a imagem de Idle para tentar recortar o rosto do personagem
        this.portrait = AssetManager.instance.GetImage("heroi_idle");
    }

    OnDrawn() {
        // Se o player não existir, não desenha nada
        if (!this.player) return;

        const ctx = this.screen.Context;
        ctx.save(); // Isola as configurações de renderização da HUD do resto do jogo

        // ==========================================
        // 1. FUNDO DA HUD (Base Translúcida)
        // ==========================================
        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "rgba(15, 15, 25, 0.85)"; // Fundo escuro levemente azulado
        this.draw.DrawRect(15, 15, 250, 75);

        this.draw.Style = this.draw.TYPES.STROKED;
        this.draw.Color = "#444455"; // Borda metálica
        this.draw.DrawRect(15, 15, 250, 75);

        // ==========================================
        // 2. RETRATO (MOLDURA)
        // ==========================================
        let portraitX = 25;
        let portraitY = 25;
        let portraitSize = 55;

        // Fundo do retrato
        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "#222233";
        this.draw.DrawRect(portraitX, portraitY, portraitSize, portraitSize);

        // Tenta desenhar o primeiro frame da animação Idle como retrato
        if (this.portrait) {
            // (Imagem, corteX, corteY, corteW, corteH, telaX, telaY, telaW, telaH)
            // Assumindo que a spritesheet tem frames em torno de 64x64
            let frameW = this.portrait.width / 7; // Como o Idle tem 7 frames
            let frameH = this.portrait.height;
            ctx.drawImage(this.portrait, 0, 0, frameW, frameH, portraitX, portraitY - 5, portraitSize, portraitSize + 10);
        }

        // Borda do Retrato
        this.draw.Style = this.draw.TYPES.STROKED;
        this.draw.Color = "#FFD700"; // Borda Dourada para o Herói
        this.draw.DrawRect(portraitX, portraitY, portraitSize, portraitSize);

        // ==========================================
        // 3. BARRA DE VIDA (HP)
        // ==========================================
        let barX = 95;
        let barY = 45;
        let barW = 155;
        let barH = 14;

        let hpPercent = Math.max(0, this.player.hp / this.player.maxHP);

        // Fundo da Barra (Parte Vazia)
        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.Color = "#331111";
        this.draw.DrawRect(barX, barY, barW, barH);

        // Preenchimento da Barra
        if (hpPercent > 0.5) this.draw.Color = "#00DD00"; // Verde
        else if (hpPercent > 0.25) this.draw.Color = "#FFAA00"; // Amarelo
        else this.draw.Color = "#FF2222"; // Vermelho

        this.draw.DrawRect(barX, barY, barW * hpPercent, barH);

        // Borda da Barra
        this.draw.Style = this.draw.TYPES.STROKED;
        this.draw.Color = "#000000";
        this.draw.DrawRect(barX, barY, barW, barH);

        // ==========================================
        // 4. TEXTOS (Nome, HP e Atributos)
        // ==========================================
        this.draw.Style = this.draw.TYPES.FILLED;
        this.draw.SetTextAlign("left");

        // Nome do Herói
        this.draw.Color = "#FFFFFF";
        this.draw.Font = "bold 14px monospace";
        this.draw.DrawText("KNIGHT", barX, barY - 8);

        // Texto numérico do HP (sobrepondo a barra)
        this.draw.Color = "#FFFFFF";
        this.draw.Font = "bold 11px monospace";
        this.draw.SetTextAlign("center");
        this.draw.DrawText(`${Math.floor(this.player.hp)} / ${this.player.maxHP}`, barX + (barW / 2), barY + 11);

        // Atributos base
        this.draw.SetTextAlign("left");
        this.draw.Color = "#AAAAAA";
        this.draw.Font = "12px monospace";
        this.draw.DrawText(`ATK: ${this.player.attack}  DEF: ${this.player.defense}`, barX, barY + 30);

        ctx.restore();
    }
}