export class TrailMenuHUD {
    Draw(level) {
        const draw = level.ui.Draw;
        const course = level.courses[level.currentSelected];
        draw.SetTextAlign('left');
        draw.Font = 'Arial';
        draw.Color = 'rgba(8, 20, 38, 0.94)';
        draw.DrawRect(0, 0, 365, 540);
        draw.Color = '#70e6d1';
        draw.FontSize = '12px';
        draw.DrawText('GAMEFORGEJS  /  AVENTURA NAS ALTURAS', 30, 38);
        draw.Color = '#ffffff';
        draw.FontSize = '47px';
        draw.DrawText('SKY TRAIL', 27, 96);
        draw.Color = '#adc6dc';
        draw.FontSize = '15px';
        draw.DrawText('Cada ilha, um novo salto.', 30, 126);
        draw.FontSize = '12px';
        draw.DrawText('ESCOLHA SUA EXPEDIÇÃO', 30, 171);
        level.courses.forEach((entry, index) => {
            const y = 190 + index * 59;
            const selected = index === level.currentSelected;
            draw.Color = selected ? '#24465a' : '#122c42';
            draw.DrawRect(23, y, 317, 51);
            if (selected) { draw.Color = '#70e6d1'; draw.DrawRect(23, y, 4, 51); }
            draw.Color = selected ? '#ffffff' : '#c3d4e3';
            draw.FontSize = '17px';
            draw.DrawText(`${String(index + 1).padStart(2, '0')}  ${entry.label.replace('Sky Trail — ', '')}`, 38, y + 22, 286);
            draw.Color = '#8eb0c7';
            draw.FontSize = '11px';
            draw.DrawText(`${entry.difficulty.toUpperCase()}  /  ${entry.platforms} ILHAS`, 69, y + 40);
        });
        draw.Color = '#70e6d1';
        draw.DrawRect(23, 447, 317, 39);
        draw.Color = '#09263b';
        draw.FontSize = '17px';
        draw.DrawText('ENTER / A / START   •   JOGAR', 42, 473);
        draw.Color = '#adc6dc';
        draw.FontSize = '12px';
        draw.DrawText('Setas / WASD / D-pad / analógico: escolher', 25, 510);
        draw.Color = 'rgba(8, 20, 38, 0.82)';
        draw.DrawRect(393, 414, 538, 100);
        draw.Color = '#ffffff';
        draw.FontSize = '23px';
        draw.DrawText(course.label, 413, 446, 500);
        draw.Color = '#bdd3e5';
        draw.FontSize = '14px';
        draw.DrawText(course.description, 413, 474, 500);
        draw.Color = '#70e6d1';
        draw.FontSize = '12px';
        draw.DrawText(`${course.coins} MOEDAS  /  CHECKPOINTS  /  CÂMERA LIVRE`, 413, 497);
    }
}
