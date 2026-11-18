import { HUDFrame } from 'gameforgejs/2d';
export class SkyTrailHelp {
    Draw(draw) {
        const frame = new HUDFrame(draw);
        frame.Panel({ x: 70, y: 140, width: 580, height: 260 });
        draw.SetTextAlign('left');
        draw.FontSize = '22px';
        draw.Color = '#FFD76A';
        draw.DrawText('Sky Trail — controles e percurso', 90, 174);
        draw.FontSize = '15px';
        draw.Color = '#FFFFFF';
        const lines = [
            'Mover: WASD / setas | analogico esquerdo / D-pad',
            'Saltar: Espaco / Z | A (Xbox), Cross (PS), B (Nintendo)',
            'Correr: Shift | RT / R2 / ZR    Camera: Q/E | analogico direito',
            'Ajuda: H | botao superior    Reiniciar: R | clique no analogico esquerdo',
            'Menu: Esc | botao direito / Back. A ajuda nao pausa o jogo.',
            'Anel dourado: checkpoint. Aterrisse nele para salvar o retorno.',
            'Plataforma vermelha: vai sumir. Colete tudo e alcance a bandeira.',
        ];
        lines.forEach((line, index) => draw.DrawText(line, 90, 206 + index * 26, 540));
    }
}
